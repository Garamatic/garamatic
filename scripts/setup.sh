#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Setup Script
# ═══════════════════════════════════════════════════════════════════════════
# Initializes the full development environment. Run this once after cloning.
#
# Usage: ./scripts/setup.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Garamatic Meta-Repo Setup"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

# ─── Check prerequisites ─────────────────────────────────────────────────
echo "🔍 Checking prerequisites..."

command -v docker >/dev/null 2>&1 || {
    echo "❌ Docker is required but not installed."
    exit 1
}

command -v docker-compose >/dev/null 2>&1 || command -v "docker compose" >/dev/null 2>&1 || {
    echo "❌ Docker Compose is required but not installed."
    exit 1
}

command -v git >/dev/null 2>&1 || {
    echo "❌ Git is required but not installed."
    exit 1
}

echo "   ✅ Docker, Docker Compose, and Git are available"

# ─── Initialize submodules ───────────────────────────────────────────────
echo ""
echo "📦 Initializing git submodules..."

if git submodule status >/dev/null 2>&1; then
    git submodule update --init --recursive
    echo "   ✅ Submodules initialized"
else
    echo "   ⚠️  No .gitmodules found. Submodules may already be present."
fi

# ─── Environment file ────────────────────────────────────────────────────
echo ""
echo "📋 Setting up environment..."

if [ ! -f .env ]; then
    cp .env.example .env
    echo "   ✅ Created .env from template"
else
    echo "   ✅ .env already exists"
fi

# ─── Integration tests ───────────────────────────────────────────────────
echo ""
echo "📦 Installing integration test dependencies..."

if [ -f integration-tests/package.json ]; then
    cd integration-tests
    if [ ! -d node_modules ]; then
        npm install
        echo "   ✅ Integration test dependencies installed"
    else
        echo "   ✅ Integration test dependencies already installed"
    fi
    cd "${ROOT_DIR}"
fi

# ─── Summary ─────────────────────────────────────────────────────────────
echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo "  ✅ Setup complete!"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""
echo "   Next steps:"
echo ""
echo "   1. Review .env and configure any secrets (SendGrid, etc.)"
echo "   2. Run 'make up' or 'docker compose up --build' to start the stack"
echo "   3. Run 'make test' to execute the integration test suite"
echo ""
echo "   Service URLs (after 'make up'):"
echo "   • Ticket Masala  → http://localhost:8085"
echo "   • Gatekeeper     → http://localhost:8086"
echo "   • Mailing        → http://localhost:8087"
echo "   • Event Planner  → http://localhost:8088"
echo "   • Garamatic Web  → http://localhost:8090"
echo "   • Masala Web     → http://localhost:8091"
echo "   • Agentic        → http://localhost:3001"
echo "   • RabbitMQ Mgmt  → http://localhost:15672"
echo "   • Mailhog UI     → http://localhost:8025"
echo ""
