#!/usr/bin/env python3
"""Fast Ollama benchmark: short prompt, short generation, cold vs warm, TPS, RAM."""

import json
import subprocess
import time
import sys

OLLAMA_URL = "http://localhost:11434/api/generate"
PROMPT = "List five colors. Be brief."

MODELS = [
    ("qwen3.5:0.8b",    "1.0 GB", 10.5),
    ("ministral-3:3b",  "3.0 GB", 12.7),
    ("granite4.1:3b",   "2.1 GB", 8.5),
    ("phi4-mini:latest", "2.5 GB", 8.4),
    ("nemotron-3-nano:4b", "2.8 GB", 14.6),
    ("qwen3.5:2b",      "2.7 GB", 16.3),
]


def run_ollama(model: str, prompt: str) -> dict:
    payload = json.dumps({"model": model, "prompt": prompt, "stream": False, "options": {"num_predict": 15}})
    result = subprocess.run(
        ["curl", "-s", "--max-time", "300", "-X", "POST", OLLAMA_URL, "-d", payload],
        capture_output=True, text=True, timeout=300,
    )
    try:
        return json.loads(result.stdout)
    except json.JSONDecodeError:
        return {"error": result.stdout[:200]}


def get_ollama_mem_mb() -> float:
    try:
        result = subprocess.run(
            ["docker", "stats", "--no-stream", "--format", "{{.MemUsage}}", "garamatic_ollama"],
            capture_output=True, text=True, timeout=5,
        )
        mem_str = result.stdout.strip().split()[0]
        if mem_str.endswith("GiB"):
            return float(mem_str[:-3]) * 1024
        elif mem_str.endswith("MiB"):
            return float(mem_str[:-3])
        elif mem_str.endswith("KiB"):
            return float(mem_str[:-3]) / 1024
        else:
            return float(mem_str)
    except Exception:
        return 0.0


def fmt_ms(ns: int | None) -> float:
    return (ns or 0) / 1e6


def tps(tokens: int, ns: int | None) -> float:
    sec = fmt_ms(ns) / 1000
    return tokens / sec if sec > 0 else 0.0


def unload_model(model: str):
    payload = json.dumps({"model": model, "prompt": "", "stream": False, "keep_alive": 0})
    subprocess.run(
        ["curl", "-s", "-X", "POST", OLLAMA_URL, "-d", payload],
        capture_output=True, timeout=30,
    )
    time.sleep(2)


def benchmark():
    results = []
    print("=" * 120)
    print("  OLLAMA CPU BENCHMARK — Cold vs Warm | Prompt TPS | Gen TPS | RAM")
    print("=" * 120)

    for model, size, intel in MODELS:
        print(f"\n  {'─'*118}")
        print(f"  {model}  ({size})  — Intelligence: {intel}")
        print(f"  {'─'*118}")

        mem_base = get_ollama_mem_mb()

        # COLD
        sys.stdout.write("  [COLD] ")
        sys.stdout.flush()
        cold = run_ollama(model, PROMPT)
        if "error" in cold:
            print(f"FAILED: {cold['error']}")
            continue
        mem_cold = get_ollama_mem_mb()
        c_total = fmt_ms(cold.get("total_duration"))
        c_load = fmt_ms(cold.get("load_duration"))
        c_pt = cold.get("prompt_eval_count", 0)
        c_pps = tps(c_pt, cold.get("prompt_eval_duration"))
        c_gt = cold.get("eval_count", 0)
        c_gps = tps(c_gt, cold.get("eval_duration"))
        c_ram = mem_cold - mem_base
        print(f"total={c_total:.0f}ms load={c_load:.0f}ms prompt={c_pt}t@{c_pps:.1f}t/s gen={c_gt}t@{c_gps:.1f}t/s ramΔ={c_ram:.0f}MB")

        # WARM
        sys.stdout.write("  [WARM] ")
        sys.stdout.flush()
        warm = run_ollama(model, PROMPT)
        if "error" in warm:
            print(f"FAILED: {warm['error']}")
            continue
        mem_warm = get_ollama_mem_mb()
        w_total = fmt_ms(warm.get("total_duration"))
        w_load = fmt_ms(warm.get("load_duration"))
        w_pt = warm.get("prompt_eval_count", 0)
        w_pps = tps(w_pt, warm.get("prompt_eval_duration"))
        w_gt = warm.get("eval_count", 0)
        w_gps = tps(w_gt, warm.get("eval_duration"))
        w_ram = mem_warm - mem_cold
        print(f"total={w_total:.0f}ms load={w_load:.0f}ms prompt={w_pt}t@{w_pps:.1f}t/s gen={w_gt}t@{w_gps:.1f}t/s ramΔ={w_ram:.0f}MB")

        results.append({
            "model": model,
            "size": size,
            "intel": intel,
            "cold_total": c_total,
            "cold_load": c_load,
            "cold_prompt_tps": c_pps,
            "cold_gen_tps": c_gps,
            "cold_ram": c_ram,
            "warm_total": w_total,
            "warm_load": w_load,
            "warm_prompt_tps": w_pps,
            "warm_gen_tps": w_gps,
            "warm_ram": w_ram,
        })

        unload_model(model)

    # SUMMARY
    print(f"\n{'='*120}")
    print("  SUMMARY")
    print(f"{'='*120}")
    hdr = (
        f"{'Model':<30} {'Int':<5} {'Size':<8} "
        f"{'CldLoad':<9} {'CldGen':<9} {'CldRAM':<9} "
        f"{'WrmLoad':<9} {'WrmGen':<9} {'WrmRAM':<9}"
    )
    print(hdr)
    print("-" * len(hdr))
    for r in results:
        print(
            f"{r['model']:<30} {r['intel']:<5.1f} {r['size']:<8} "
            f"{r['cold_load']:<9.0f} {r['cold_gen_tps']:<9.1f} {r['cold_ram']:<9.0f} "
            f"{r['warm_load']:<9.0f} {r['warm_gen_tps']:<9.1f} {r['warm_ram']:<9.0f}"
        )

    print(f"\n  RANKED BY WARM GENERATION TPS")
    for i, r in enumerate(sorted(results, key=lambda x: x["warm_gen_tps"], reverse=True), 1):
        print(f"    {i}. {r['model']:<30} {r['warm_gen_tps']:.1f} t/s")

    print(f"\n  RANKED BY INTELLIGENCE / WARM_GEN (smarts per speed)")
    for i, r in enumerate(sorted(results, key=lambda x: x["intel"] / x["warm_gen_tps"] if x["warm_gen_tps"] > 0 else 0), 1):
        ratio = r["intel"] / r["warm_gen_tps"] if r["warm_gen_tps"] > 0 else 0
        print(f"    {i}. {r['model']:<30} {ratio:.2f} (intel {r['intel']:.1f} / {r['warm_gen_tps']:.1f} t/s)")

    print(f"\n{'='*120}")


if __name__ == "__main__":
    benchmark()
