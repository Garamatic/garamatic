#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Pre-commit hook: Run tests for staged submodules
# ═══════════════════════════════════════════════════════════════════════════
# This script is called by the root pre-commit hook whenever a commit
# is made. It checks which submodules are staged and runs the relevant
# fast unit tests for each.
#
# Heavy integration tests (docker-based) are skipped — they belong in CI.
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

STAGED=$(git diff --cached --name-only | grep -E '^(agentic-service|integration-contracts|masala-web)$' || true)

if [ -z "$STAGED" ]; then
    exit 0
fi

FAILED=0

for sub in $STAGED; do
    echo ""
    echo "▶️  Running tests for $sub..."
    if ! (
        cd "$sub"
        case $sub in
            agentic-service)
                uv run pytest tests/ -q
                ;;
            integration-contracts)
                npm test -- --silent
                ;;
            masala-web)
                npm test
                ;;
        esac
    ); then
        echo "❌ Tests failed in $sub"
        FAILED=1
    else
        echo "✅ Tests passed in $sub"
    fi
done

if [ "$FAILED" -ne 0 ]; then
    echo ""
    echo "❌ Commit blocked: submodule tests failed."
    exit 1
fi

exit 0
