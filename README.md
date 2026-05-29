# Garamatic

> **Meta-repository for the Garamatic microservices ecosystem.**
> This repo tracks all service repositories as git submodules and provides a single point of orchestration for local development, integration testing, and deployment.

## Quick Start

```bash
# Clone with all submodules
git clone --recursive git@github.com:Garamatic/garamatic.git

# Or initialize submodules after clone
git clone git@github.com:Garamatic/garamatic.git
cd garamatic
make setup

# Start the entire stack
cd garamatic
make up

# Run integration tests
make test
```

## Architecture

The Garamatic platform consists of **8 microservices** plus shared infrastructure:

```
┌─────────────────────────────────────────────────────────────┐
│                        Garamatic                            │
│                   (this meta-repo)                          │
├─────────────────────────────────────────────────────────────┤
│  Frontends                                                  │
│  ├── garamatic-web      → Main web application              │
│  └── masala-web         → Marketing landing page            │
├─────────────────────────────────────────────────────────────┤
│  Backends                                                   │
│  ├── ticket-masala      → Core ticket engine (.NET)        │
│  ├── gatekeeper-api     → Event ingestion (.NET)             │
│  ├── mailing-service    → Email worker + API (.NET)        │
│  ├── event-planner      → Drupal CMS (PHP)                  │
│  ├── odoo-integration   → ERP bridge (.NET)                │
│  └── agentic-service    → MCP server (Python)              │
├─────────────────────────────────────────────────────────────┤
│  Shared                                                     │
│  ├── integration-contracts → API schemas, types             │
│  ├── rabbitmq             → Message broker                  │
│  └── mailhog              → Test email capture              │
└─────────────────────────────────────────────────────────────┘
```

## Services

| Submodule | Purpose | Port | Docker |
|-----------|---------|------|--------|
| `ticket-masala` | Core ticket engine | `8085` | ✅ |
| `gatekeeper-api` | Event ingestion | `8086` | ✅ |
| `mailing-service` | Email worker + API | `8087` | ✅ |
| `event-planner` | Drupal CMS | `8088` | ✅ |
| `garamatic-web` | Main frontend | `8090` | ✅ |
| `masala-web` | Marketing site | `8091` | ✅ |
| `agentic-service` | MCP server | `3001` | ✅ |
| `odoo-integration` | ERP bridge | — | ✅ |
| `integration-contracts` | Shared schemas | — | ❌ |
| `integration-tests` | Test suite | — | ✅ |

## Repository Structure

```
garamatic/
├── docker-compose.yml              # Full stack orchestration
├── .env.example                    # Environment template
├── .gitmodules                     # Submodule declarations
├── Makefile                        # Common commands
├── README.md                       # This file
├── scripts/
│   ├── setup.sh                    # One-time setup
│   ├── test.sh                     # Test runner
│   ├── bump.sh                     # Update submodules
│   └── status.sh                   # Ecosystem dashboard
├── ticket-masala/                  # [submodule]
├── mailing-service/                # [submodule]
├── event-planner/                  # [submodule]
├── garamatic-web/                  # [submodule]
├── masala-web/                     # [submodule]
├── agentic-service/                # [submodule]
├── odoo-integration/               # [submodule]
├── integration-contracts/          # [submodule]
└── integration-tests/              # [tracked in root repo]
```

## Commands

### Daily Development

```bash
make up          # Start the full stack
make dev         # Start attached (see logs)
make down        # Stop and remove everything
make logs        # Tail all service logs
```

### Testing

```bash
make test        # Run integration tests in Docker
make test-local  # Run tests against local services
```

### Submodule Management

```bash
make status      # Show current submodule commits
make update      # Pull latest from all submodules
make bump        # Update submodules and commit root repo
```

### Individual Scripts

```bash
./scripts/setup.sh                    # Initialize environment
./scripts/test.sh                     # Docker test suite
./scripts/test.sh local               # Local test suite
./scripts/test.sh local cross-service # Specific suite
./scripts/bump.sh                     # Bump all submodules
./scripts/bump.sh ticket-masala      # Bump one submodule
./scripts/bump.sh --dry-run          # Preview changes
./scripts/status.sh                   # Full ecosystem dashboard
```

## Working with Submodules

### The Golden Rule

> **Always commit in the service repo first, then bump the submodule in the root repo.**

### Typical Workflow

```bash
# 1. Work on a service
cd ticket-masala
# ... make changes ...
git add .
git commit -m "feat: add new ticket priority field"
git push origin main

# 2. Update the root repo to point to the new commit
cd ..
./scripts/bump.sh ticket-masala
# This commits: "bump: update ticket-masala to latest"

# 3. Push the root repo
git push origin main
```

### Checking Out a Specific Version

```bash
# The root repo pins exact submodule commits via .gitmodules
# After cloning, you can checkout a specific root commit and get the exact
# service versions that were tested together:

git checkout v1.2.3               # Checkout root repo tag
git submodule update --init       # Check out the exact submodule commits
make up                           # Start the exact stack version
```

### Pinning Submodules

```bash
# Pin all to current commits
git add -A
git commit -m "release: pin all services to v1.3.0"

# Tag the release
git tag v1.3.0
git push origin v1.3.0
```

## Environment Variables

Copy `.env.example` → `.env` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `SENDGRID_API_KEY` | No | SendGrid API key (mailing service) |
| `SENDGRID_FROM_EMAIL` | No | Default sender email |
| `GATEKEEPER_API_KEY` | No | Ingestion API key |
| `GRAFANA_ADMIN_PASSWORD` | No | Grafana admin password |

## Troubleshooting

### Submodules show as "modified" after no changes

```bash
# This usually means the submodule commit changed on the remote
make update          # Pull latest
# Or
./scripts/bump.sh    # Update and commit
```

### A service won't start

```bash
# Check individual service logs
docker compose logs <service-name>

# Rebuild a single service
docker compose up --build <service-name>
```

### Integration tests fail

```bash
# Run tests with verbose output
make test
# Then check logs:
docker compose -f integration-tests/docker/docker-compose.test.yml logs
```

## CI/CD

### GitHub Actions Example

```yaml
# .github/workflows/integration.yml
name: Integration Tests

on:
  push:
    branches: [main]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          submodules: recursive
      - run: make setup
      - run: make test
```

## License

See individual submodules for their respective licenses.

---

**Maintained by Garamatic.**
