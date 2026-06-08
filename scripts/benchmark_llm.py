#!/usr/bin/env python3
"""
LLM Token Speed Benchmark — supports Ollama and OpenAI-compatible backends (llama.cpp, etc.)

Usage:
    python3 scripts/benchmark_llm.py
    python3 scripts/benchmark_llm.py --model qwen3.5:2b-q4_K_M
    python3 scripts/benchmark_llm.py --warmups 3 --runs 5 --max-tokens 128

Requires: Python 3.7+ (stdlib only). No pip packages needed.
"""

import argparse
import json
import time
import urllib.request
import urllib.error
from dataclasses import dataclass, asdict
from typing import List, Optional, Dict, Any

# ── Prompts ──────────────────────────────────────────────────────────────────

BASE_PROMPT = """RÉPUBLIQUE FRANÇAISE
DÉPARTEMENT DE LA HAUTE-GARONNE
COMMUNE DE VAL-DE-NESTE
ARRÊTÉ MUNICIPAL

Portant refus de délivrance d'un permis de construire
Dossier n° : PC 031542 26 C0042

Le Maire de la Commune de Val-de-Neste,

Vu le Code de l'urbanisme, et notamment ses articles L. 421-1, R. 111-2, R. 111-21 et R. 424-1 ;

Vu le Plan Local d'Urbanisme (PLU) de la commune de Val-de-Neste approuvé par délibération du Conseil Municipal en date du 14 mars 2019, révisé le 22 octobre 2024, et notamment le règlement applicable à la zone UC (Zone urbaine résidentielle de moyenne densité) ;

Vu la demande de permis de construire enregistrée en mairie le 12 janvier 2026, déposée par Monsieur Jean-Marc DUPONT (le Pétitionnaire), demeurant au 14, rue des Alouettes, 31210 Val-de-Neste, pour un projet de construction d'un immeuble collectif de huit (8) logements collectifs avec stationnement intégré, sur un terrain sis au 42, avenue des Pyrénées, cadastré section AB n° 112 ;

Vu l'avis défavorable émis le 18 février 2026 par le Service Départemental d'Incendie et de Secours (SDIS 31), motivé par l'insuffisance des voies de desserte pour les engins de secours et l'absence de borne d'incendie normalisée à moins de 100 mètres du projet ;

Vu l'avis défavorable émis le 3 mars 2026 par l'Architecte des Bâtiments de France (ABF), au motif que l'insertion paysagère du projet, situé dans le champ de visibilité de l'église romane Saint-Sernin (classée Monument Historique par arrêté du 12 décembre 1922), porte atteinte au caractère des lieux avoisinants par sa hauteur disproportionnée et l'usage de matériaux non traditionnels en façade ;

CONSIDÉRANT :

Considérant qu'aux termes de l'article R. 111-2 du Code de l'urbanisme, le projet peut être refusé s'il est de nature à porter atteinte à la sécurité publique ; que l'étroitesse de l'avenue des Pyrénées au droit du projet (largeur carrossable de 3,50 mètres) ne permet pas le croisement, le retournement, ni le déploiement sécurisé des bras élévateurs articulés des services de secours, validant ainsi le risque caractérisé par le SDIS 31 ;

Considérant qu'aux termes de l'article UC.9 du règlement du Plan Local d'Urbanisme (PLU), l'emprise au sol des constructions ne peut excéder 40 % de la superficie totale de la parcelle ; que le tableau des surfaces du formulaire CERFA déposé fait apparaître une emprise au sol projetée de 245 mètres carrés pour une surface de terrain de 500 mètres carrés, soit un coefficient d'emprise au sol (CES) réel de 49 %, en infraction manifeste avec la règle précitée ;

Considérant que l'article UC.12 du règlement du PLU impose la création d'une place de stationnement par tranche de 60 mètres carrés de surface de plancher créée, soit un minimum requis de 9 places pour le projet présenté ; que les plans de masse (pièce PC02) et de coupe (pièce PC03) n'identifient que 6 places matérialisées en sous-sol, sans possibilité d'aménagement en surface compte tenu de l'absence d'espaces libres ;

Considérant que l'article R. 111-21 du Code de l'urbanisme permet à l'autorité administrative de refuser un projet si les constructions, par leur situation, leur architecture ou leur aspect extérieur, sont de nature à porter atteinte au caractère ou à l'intérêt des lieux avoisinants ; qu'en l'espèce, la surélévation proposée en R+3 culminant à 14,20 mètres à l'égout du toit rompt l'alignement architectural de la rue, composé exclusivement de bâtis de type "Toulousaine" en R+1 n'excédant pas 6,50 mètres de hauteur ;

Considérant qu'au vu des multiples non-conformités d'ordre public (sécurité incendie) et réglementaires locales (emprise au sol, gabarit, stationnement), le projet ne peut faire l'objet d'un accord sous réserve de prescriptions techniques spéciales, car les modifications à y apporter toucheraient à l'économie générale du projet et nécessiteraient le dépôt d'une nouvelle demande ;

ARRÊTE :

Article 1 : La demande de permis de construire n° PC 031542 26 C0042 visant à édifier un immeuble collectif de 8 logements sur la parcelle cadastrée AB n° 112 est REFUSÉE.

Article 2 : Le présent arrêté sera notifié au pétitionnaire par lettre recommandée avec accusé de réception, et copie en sera transmise à Monsieur le Préfet de la Haute-Garonne au titre du contrôle de légalité.

Article 3 : Le Secrétaire Général de la mairie et les agents de la force publique sont chargés, chacun en ce qui le concerne, de l'exécution du présent arrêté.

Article 4 (Délais et voies de recours) :
La présente décision peut faire l'objet d'un recours gracieux devant l'auteur de l'acte (Monsieur le Maire) ou d'un recours hiérarchique devant Monsieur le Préfet, dans un délai de deux mois à compter de sa notification. Un recours contentieux peut également être introduit devant le Tribunal Administratif de Toulouse (9 Rue Notre Dame, 31000 Toulouse) ou via l'application "Télérecours" (www.telerecours.fr) dans le même délai de deux mois à compter de la notification de la présente décision ou du rejet du recours administratif préalable.

Fait à Val-de-Neste, le 8 juin 2026.

Le Bourgmestre / Le Maire,
Signature électronique certifiée

Marc ALBERT"""

FOLLOW_UP_QUESTIONS = {
    "fact_extraction": "Why exactly can't this project be saved via simple corrections/prescriptions? Answer concisely.",
    "context_math": "The PLU rule says max 40% footprint on a 500m² parcel. The project claims 245m² footprint (49%). How many square meters must the architect reduce the footprint to comply? How many extra parking spaces are needed? The rule requires 1 parking space per 60m² of floor area, and the building has 8 units. Show the math.",
    "structured_extraction": "Extract the following from the text and output ONLY as JSON: { 'dossier_number': string, 'petitioner': string, 'refusal_reasons': array of strings, 'safety_issues': array, 'plu_violations': array, 'required_parking': number, 'actual_parking': number, 'max_footprint_percent': number, 'actual_footprint_percent': number }"
}

# ── Data classes ─────────────────────────────────────────────────────────────

@dataclass
class RunResult:
    model: str
    prompt_label: str
    run_num: int
    ttft_ms: float          # Time to first token (ms)
    total_tokens: int
    total_time_ms: float
    tokens_per_sec: float
    prompt_tokens: int
    completion_tokens: int
    backend: str
    error: Optional[str] = None

# ── Backend detection ─────────────────────────────────────────────────────────

def detect_backend(base_url: str) -> str:
    """Auto-detect backend: 'ollama' or 'openai' (llama.cpp, etc.)."""
    # Try Ollama first
    try:
        req = urllib.request.Request(f"{base_url}/api/tags", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                return "ollama"
    except Exception:
        pass
    # Try OpenAI-compatible
    try:
        req = urllib.request.Request(f"{base_url}/v1/models", method="GET")
        with urllib.request.urlopen(req, timeout=5) as resp:
            if resp.status == 200:
                return "openai"
    except Exception:
        pass
    return "unknown"

# ── Ollama API ──────────────────────────────────────────────────────────────

def ollama_generate(url: str, model: str, prompt: str, max_tokens: int) -> Dict[str, Any]:
    """Generate via Ollama /api/generate with streaming."""
    payload = {
        "model": model,
        "prompt": prompt,
        "stream": True,
        "options": {
            "num_predict": max_tokens,
            "temperature": 0.1,
        }
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        url,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    first_token_time = None
    start_time = time.perf_counter()
    token_count = 0
    eval_count = 0
    prompt_eval_count = 0
    final_response = None

    with urllib.request.urlopen(req, timeout=120) as resp:
        for line in resp:
            if not line:
                continue
            line = line.decode("utf-8").strip()
            if not line:
                continue
            try:
                chunk = json.loads(line)
            except json.JSONDecodeError:
                continue

            if chunk.get("done"):
                final_response = chunk
                break

            if chunk.get("response"):
                if first_token_time is None:
                    first_token_time = time.perf_counter()
                token_count += 1

    end_time = time.perf_counter()
    total_time_ms = (end_time - start_time) * 1000
    ttft_ms = (first_token_time - start_time) * 1000 if first_token_time else total_time_ms

    if final_response:
        eval_count = final_response.get("eval_count", token_count)
        prompt_eval_count = final_response.get("prompt_eval_count", 0)
        if eval_count > 0:
            token_count = eval_count

    return {
        "ttft_ms": ttft_ms,
        "total_tokens": token_count,
        "total_time_ms": total_time_ms,
        "tokens_per_sec": (token_count / (total_time_ms / 1000)) if total_time_ms > 0 else 0,
        "prompt_tokens": prompt_eval_count,
        "completion_tokens": token_count,
    }


def ollama_list_models(base_url: str) -> List[str]:
    try:
        req = urllib.request.Request(f"{base_url}/api/tags", method="GET", timeout=5)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return [m["name"] for m in data.get("models", [])]
    except Exception:
        return []

# ── OpenAI-compatible API (llama.cpp, etc.) ─────────────────────────────────

def openai_generate(url: str, model: str, prompt: str, max_tokens: int) -> Dict[str, Any]:
    """Generate via OpenAI-compatible /v1/chat/completions with streaming."""
    payload = {
        "model": model,
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": max_tokens,
        "temperature": 0.1,
        "stream": True,
        "stream_options": {"include_usage": True},
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        f"{url}/v1/chat/completions",
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )

    first_token_time = None
    start_time = time.perf_counter()
    chunk_count = 0
    usage = None
    content = ""

    with urllib.request.urlopen(req, timeout=120) as resp:
        for raw_line in resp:
            if not raw_line:
                continue
            line = raw_line.decode("utf-8").strip()
            if not line.startswith("data: "):
                continue
            json_str = line[6:]
            if json_str == "[DONE]":
                break
            try:
                chunk = json.loads(json_str)
            except json.JSONDecodeError:
                continue

            delta = chunk.get("choices", [{}])[0].get("delta", {})
            text = delta.get("content", "")
            if text:
                if first_token_time is None:
                    first_token_time = time.perf_counter()
                content += text
                chunk_count += 1

            if chunk.get("usage"):
                usage = chunk["usage"]

    end_time = time.perf_counter()
    total_time_ms = (end_time - start_time) * 1000
    ttft_ms = (first_token_time - start_time) * 1000 if first_token_time else total_time_ms

    completion_tokens = usage.get("completion_tokens", 0) if usage else 0
    prompt_tokens = usage.get("prompt_tokens", 0) if usage else 0
    total_tokens = completion_tokens if completion_tokens > 0 else chunk_count

    return {
        "ttft_ms": ttft_ms,
        "total_tokens": total_tokens,
        "total_time_ms": total_time_ms,
        "tokens_per_sec": (total_tokens / (total_time_ms / 1000)) if total_time_ms > 0 else 0,
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
    }


def openai_list_models(base_url: str) -> List[str]:
    try:
        req = urllib.request.Request(f"{base_url}/v1/models", method="GET", timeout=5)
        with urllib.request.urlopen(req) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return [m.get("id", m.get("name", "")) for m in data.get("data", data.get("models", []))]
    except Exception:
        return []

# ── Benchmark ───────────────────────────────────────────────────────────────

def warmup(base_url: str, backend: str, model: str, prompt: str, count: int = 1):
    print(f"   🔥 Warmup ({count}x)...", end="", flush=True)
    for _ in range(count):
        try:
            if backend == "ollama":
                ollama_generate(f"{base_url}/api/generate", model, prompt, max_tokens=32)
            else:
                openai_generate(base_url, model, prompt, max_tokens=32)
        except Exception:
            pass
    print(" done")


def run_benchmark(base_url: str, backend: str, model: str, prompt: str, label: str, runs: int) -> List[RunResult]:
    results = []
    for i in range(1, runs + 1):
        print(f"   Run {i}/{runs}...", end="", flush=True)
        try:
            if backend == "ollama":
                stats = ollama_generate(f"{base_url}/api/generate", model, prompt, max_tokens=512)
            else:
                stats = openai_generate(base_url, model, prompt, max_tokens=512)

            r = RunResult(
                model=model,
                prompt_label=label,
                run_num=i,
                ttft_ms=stats["ttft_ms"],
                total_tokens=stats["total_tokens"],
                total_time_ms=stats["total_time_ms"],
                tokens_per_sec=stats["tokens_per_sec"],
                prompt_tokens=stats["prompt_tokens"],
                completion_tokens=stats["completion_tokens"],
                backend=backend,
            )
            results.append(r)
            print(f" {r.tokens_per_sec:.1f} tok/s, TTFT={r.ttft_ms:.0f}ms")
        except Exception as e:
            results.append(RunResult(
                model=model, prompt_label=label, run_num=i,
                ttft_ms=0, total_tokens=0, total_time_ms=0, tokens_per_sec=0,
                prompt_tokens=0, completion_tokens=0, backend=backend,
                error=str(e)
            ))
            print(f" ERROR: {e}")
        time.sleep(0.3)
    return results


def print_summary(results: List[RunResult]):
    if not results:
        return

    ok = [r for r in results if r.error is None]
    if not ok:
        print("   All runs failed.")
        return

    tps_values = [r.tokens_per_sec for r in ok]
    ttft_values = [r.ttft_ms for r in ok]
    total_tokens = [r.total_tokens for r in ok]
    total_times = [r.total_time_ms for r in ok]
    prompt_tokens = [r.prompt_tokens for r in ok]

    def avg(vals): return sum(vals) / len(vals)
    def min_(vals): return min(vals)
    def max_(vals): return max(vals)
    def p50(vals): return sorted(vals)[len(vals)//2]
    def p95(vals): return sorted(vals)[int(len(vals)*0.95)] if len(vals) > 2 else max_(vals)

    print(f"""
   ----------------------------------------------------------------
   SUMMARY  ({ok[0].model}  |  {ok[0].prompt_label}  |  {ok[0].backend})
   ----------------------------------------------------------------
   Runs: {len(ok)} successful
   Tokens/sec:      avg={avg(tps_values):.1f}  min={min_(tps_values):.1f}  max={max_(tps_values):.1f}  p50={p50(tps_values):.1f}
   TTFT (ms):       avg={avg(ttft_values):.0f}  min={min_(ttft_values):.0f}  max={max_(ttft_values):.0f}  p50={p50(ttft_values):.0f}
   Total tokens:    avg={avg(total_tokens):.0f}  min={min_(total_tokens)}  max={max_(total_tokens)}
   Prompt tokens:   avg={avg(prompt_tokens):.0f}
   Total time (ms): avg={avg(total_times):.0f}  min={min_(total_times):.0f}  max={max_(total_times):.0f}
   ----------------------------------------------------------------""")


def main():
    parser = argparse.ArgumentParser(description="Benchmark LLM token speed")
    parser.add_argument("--url", default="http://localhost:11434", help="LLM base URL")
    parser.add_argument("--model", default="qwen3.5:2b-q4_K_M", help="Model name")
    parser.add_argument("--backend", choices=["ollama", "openai", "auto"], default="auto", help="Backend type")
    parser.add_argument("--warmups", type=int, default=1, help="Warmup runs")
    parser.add_argument("--runs", type=int, default=3, help="Benchmark runs per prompt")
    parser.add_argument("--max-tokens", type=int, default=512, help="Max tokens to generate")
    parser.add_argument("--follow-up", action="store_true", help="Also benchmark the follow-up challenge questions")
    parser.add_argument("--json", action="store_true", help="Output raw results as JSON")
    args = parser.parse_args()

    base_url = args.url.rstrip("/")
    backend = args.backend if args.backend != "auto" else detect_backend(base_url)

    if backend == "unknown":
        print("❌ Could not auto-detect backend. Use --backend ollama or --backend openai")
        return

    print(f"""
================================================================================
  LLM TOKEN SPEED BENCHMARK
  Backend: {backend:<10} |  URL: {base_url}
================================================================================
""")

    # Check models
    if backend == "ollama":
        available = ollama_list_models(base_url)
    else:
        available = openai_list_models(base_url)
    print(f"📦 Available models: {', '.join(available) if available else 'none found'}")
    if args.model not in available and available:
        print(f"⚠️  Model '{args.model}' not in available list. Attempting anyway...")
    print()

    all_results = []

    # ── Base prompt (long context) ──
    print(f"📝 Benchmark: BASE PROMPT (long context, ~{len(BASE_PROMPT)} chars)")
    warmup(base_url, backend, args.model, BASE_PROMPT, args.warmups)
    results = run_benchmark(base_url, backend, args.model, BASE_PROMPT, "base_prompt", args.runs)
    all_results.extend(results)
    print_summary(results)
    print()

    # ── Follow-up questions ──
    if args.follow_up:
        for key, question in FOLLOW_UP_QUESTIONS.items():
            prompt = f"{BASE_PROMPT}\n\n---\n\nQuestion: {question}\n\nAnswer:"
            label = f"followup_{key}"
            print(f"📝 Benchmark: FOLLOW-UP [{key}]")
            warmup(base_url, backend, args.model, prompt, 1)
            results = run_benchmark(base_url, backend, args.model, prompt, label, args.runs)
            all_results.extend(results)
            print_summary(results)
            print()

    # ── JSON export ──
    if args.json:
        export = [asdict(r) for r in all_results]
        print(json.dumps(export, indent=2, ensure_ascii=False))

    print("✅ Benchmark complete.")


if __name__ == "__main__":
    main()
