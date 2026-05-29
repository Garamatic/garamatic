# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Makefile
# ═══════════════════════════════════════════════════════════════════════════
# Common commands for managing the entire microservices ecosystem.
#
# Usage:
#   make setup     # Initialize submodules and env
#   make up        # Start the full stack
#   make down      # Stop the full stack
#   make test      # Run integration tests
#   make update    # Pull latest from all submodules
#   make pull      # Pull root repo and submodules
#   make push      # Push root repo and submodule commits
#   make status    # Show current submodule commits
# ═══════════════════════════════════════════════════════════════════════════

.PHONY: setup up down test update pull push sync status logs lint

# ─── Setup ─────────────────────────────────────────────────────────────────
setup:
	@echo "📦 Initializing submodules..."
	git submodule update --init --recursive
	@echo "📋 Copying environment template..."
	cp -n .env.example .env 2>/dev/null || echo "   .env already exists"
	@echo "✅ Setup complete. Run 'make up' to start the stack."

# ─── Docker Compose ────────────────────────────────────────────────────────
up:
	@echo "🚀 Starting Garamatic stack..."
	docker compose up --build -d
	@echo ""
	@echo "   Services:"
	@echo "   • Ticket Masala  → http://localhost:8085"
	@echo "   • Gatekeeper     → http://localhost:8086"
	@echo "   • Mailing        → http://localhost:8087"
	@echo "   • Event Planner  → http://localhost:8088"
	@echo "   • Garamatic Web  → http://localhost:8090"
	@echo "   • Masala Web     → http://localhost:8091"
	@echo "   • Agentic        → http://localhost:3001"
	@echo "   • RabbitMQ Mgmt  → http://localhost:15672  (guest/guest)"
	@echo "   • Mailhog UI     → http://localhost:8025"

down:
	@echo "🛑 Stopping Garamatic stack..."
	docker compose down -v

dev:
	@echo "🚀 Starting Garamatic stack (attached)..."
	docker compose up --build

logs:
	docker compose logs -f

# ─── Testing ───────────────────────────────────────────────────────────────
test:
	@echo "🧪 Running integration tests..."
	docker compose -f integration-tests/docker/docker-compose.test.yml up \
		--build --abort-on-container-exit

test-local:
	@echo "🧪 Running integration tests against local services..."
	cd integration-tests && npm test

# ─── Submodule Management ──────────────────────────────────────────────────
update:
	@echo "⬆️  Updating all submodules to latest remote..."
	git submodule update --remote
	@echo ""
	@echo "⚠️  Review changes before committing!"

pull:
	@echo "⬇️  Pulling root repo and submodules..."
	@scripts/pull.sh

push:
	@echo "⬆️  Pushing root repo and submodule commits..."
	@scripts/push.sh

sync: pull push
	@echo "✅ Repo and submodules synced."

status:
	@echo "📊 Submodule status:"
	@git submodule status

bump:
	@echo "🔖 Bumping all submodules to latest and committing..."
	git submodule update --remote
	git add -A
	git commit -m "bump: update all submodules to latest" || echo "No changes to commit"

# ─── Development ───────────────────────────────────────────────────────────
lint:
	@echo "🔍 Running code quality checks across services..."
	@echo "   (Add per-service lint commands here as needed)"

# ─── Help ──────────────────────────────────────────────────────────────────
help:
	@echo "Garamatic Meta-Repo Commands"
	@echo ""
	@echo "  make setup      Initialize submodules and env"
	@echo "  make up         Start the full Docker stack (detached)"
	@echo "  make dev        Start the full Docker stack (attached)"
	@echo "  make down       Stop and remove the stack"
	@echo "  make logs       Tail Docker logs"
	@echo "  make test       Run integration tests in Docker"
	@echo "  make test-local Run integration tests against local services"
	@echo "  make update     Pull latest commits for all submodules"
	@echo "  make pull       Pull root repo and submodules"
	@echo "  make push       Push root repo and submodule commits"
	@echo "  make sync       Pull then push root repo and submodules"
	@echo "  make status     Show current submodule commits"
	@echo "  make bump       Update submodules and commit the root repo"
	@echo "  make lint       Run code quality checks"
	@echo "  make help       Show this help message"
