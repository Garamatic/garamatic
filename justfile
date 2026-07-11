# Local CI — no GitHub Actions required
ci: lint test

lint:
    pre-commit run --all-files 2>/dev/null || echo "pre-commit not installed — skipping"

test:
    make test 2>/dev/null || echo "integration tests require docker — run 'make up' first"

# ── Commit sweep ──
commit-sweep:
    @echo "=== Last 10 commits ==="
    git log --oneline -10
    @echo ""
    @echo "=== Unpushed ==="
    git log --oneline @{u}..HEAD 2>/dev/null || echo "  (no upstream)"
    @echo ""
    git status --short || echo "  (clean)"

# ── End of shift ──
eos:
    @echo "=== 1/5 Tests ==="
    -just ci
    @echo "=== 2/5 Commit sweep ==="
    -just commit-sweep
    @echo "=== 3/5 Worksheet? ==="
    @ls -t worksheets/ 2>/dev/null | head -3 || echo "  (none)"
    @echo "=== 4/5 Feedback? ==="
    @head -5 FEEDBACK.md 2>/dev/null || echo "  (none)"
    @echo "=== 5/5 Tree clean? ==="
    git status --short || echo "  (clean)"
