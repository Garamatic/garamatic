#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Test Runner
# ═══════════════════════════════════════════════════════════════════════════
# Runs the integration test suite. Supports both Docker and local modes.
#
# Usage:
#   ./scripts/test.sh              # Run tests in Docker (full isolation)
#   ./scripts/test.sh local        # Run tests against local running services
#   ./scripts/test.sh <suite>      # Run a specific test suite
#
# Suites: contract-compliance, service-health, cross-service, e2e-workflows
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

MODE="${1:-docker}"
SUITE="${2:-}"

cd "${ROOT_DIR}"

# ─── Docker Mode ─────────────────────────────────────────────────────────
if [ "$MODE" = "docker" ]; then
    echo "🐳 Running integration tests in Docker..."

    COMPOSE_FILE="integration-tests/docker/docker-compose.test.yml"

    if [ -n "$SUITE" ]; then
        echo "   Suite: $SUITE"
        docker compose -f "$COMPOSE_FILE" run --rm \
            -e TEST_SUITE="$SUITE" \
            test-runner \
            node "tests/${SUITE}.test.js"
    else
        docker compose -f "$COMPOSE_FILE" up --build --abort-on-container-exit
    fi

    EXIT_CODE=$?

    if [ $EXIT_CODE -eq 0 ]; then
        echo ""
        echo "✅ All tests passed!"
    else
        echo ""
        echo "❌ Tests failed. Check logs:"
        echo "   docker compose -f $COMPOSE_FILE logs"
    fi

    exit $EXIT_CODE
fi

# ─── Local Mode ──────────────────────────────────────────────────────────
if [ "$MODE" = "local" ]; then
    echo "🖥️  Running integration tests against local services..."

    cd integration-tests

    if [ -n "$SUITE" ]; then
        echo "   Suite: $SUITE"
        node "tests/${SUITE}.test.js"
    else
        npm test
    fi

    exit $?
fi

# ─── Unknown mode ─────────────────────────────────────────────────────────
echo "❌ Unknown mode: $MODE"
echo ""
echo "Usage:"
echo "  ./scripts/test.sh              # Docker mode (default)"
echo "  ./scripts/test.sh local        # Local mode"
echo "  ./scripts/test.sh local <suite> # Local mode, specific suite"
echo ""
echo "Suites:"
echo "  contract-compliance"
echo "  service-health"
echo "  cross-service"
echo "  e2e-workflows"
exit 1
