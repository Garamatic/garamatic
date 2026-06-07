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
│   ├── status.sh                   # Ecosystem dashboard
│   ├── pull.sh                     # Pull root repo and submodules
│   └── push.sh                     # Push root repo and submodule commits
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

### Monitoring & Health

```bash
make monitor-up      # Start health dashboard (Grafana)
make monitor-down    # Stop health dashboard
make monitor-logs    # Tail monitoring logs
make stack-up        # Start full stack + monitoring
make stack-down      # Stop full stack + monitoring
```

### Backup & Restore

```bash
make backup          # Backup all volumes and databases
make restore         # List available backups
make restore TIMESTAMP=20250605_120000  # Restore specific backup
```

### Submodule Management

```bash
make status      # Show current submodule commits
make update      # Pull latest from all submodules
make pull        # Pull root repo and submodules
make push        # Push root repo and submodule commits
make sync        # Pull then push root repo and submodules
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
./scripts/pull.sh                     # Pull root repo and submodules
./scripts/push.sh                     # Push root repo and submodule commits
./scripts/backup.sh                   # Backup all volumes and databases
./scripts/restore.sh <timestamp>      # Restore from backup
./scripts/health-check.sh           # Quick health check
```

## Working with Submodules

### Easy Git Workflow

If you want Git to handle submodules more naturally, set this once:

```bash
git config --global submodule.recurse true
git config --global fetch.recurseSubmodules on-demand
git config --global push.recurseSubmodules on-demand
```

Then use:

```bash
make pull              # Pull the root repo and sync submodules
make push              # Push the root repo and any referenced submodule commits
# Or run the scripts directly:
./scripts/pull.sh      # Pull root repo and submodules
./scripts/push.sh      # Push root repo and submodule commits
```

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
| `AGENTIC_API_KEY` | No | Agentic service API key |
| `GRAFANA_ADMIN_PASSWORD` | No | Grafana admin password (default: admin) |
| `OPENAI_API_KEY` | No | OpenAI API key (optional, uses Ollama by default) |
| `OLLAMA_BASE_URL` | No | Ollama API URL (default: http://ollama:11434/v1) |
| `BACKUP_DIR` | No | Backup directory (default: ./backups) |
| `CLOUDFLARE_TUNNEL_ID` | No | Cloudflare Tunnel ID (see Tunnel section) |
| `CLOUDFLARE_DOMAIN` | No | Base domain for tunnel subdomains |

## Monitoring & Health

The monitoring stack includes:

- **Grafana Dashboard** → http://localhost:3000 (admin/`${GRAFANA_ADMIN_PASSWORD}`)
- **Health Dashboard** → http://localhost:3002 (simple HTML/JS, auto-refreshes every 30s)

All services have `restart: unless-stopped` enabled for automatic recovery after crashes.

## Cloudflare Tunnel

Expose the entire Garamatic stack to the internet via a **locally managed** Cloudflare Tunnel.
Ingress routes are defined in `cloudflared/config.yml` and cannot be modified from the Cloudflare dashboard.

The tunnel runs as a Docker container on the same network as the demo stack.

### First-Time Setup

```bash
# 1. Install cloudflared CLI
#    https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/

# 2. Authenticate with Cloudflare
cloudflared tunnel login

# 3. Create a named tunnel
cloudflared tunnel create garamatic

# 4. Add the tunnel ID and domain to your .env
echo 'CLOUDFLARE_TUNNEL_ID=<tunnel-id>' >> .env
echo 'CLOUDFLARE_DOMAIN=your-domain.com' >> .env

# 5. Generate the config and copy credentials
make tunnel-setup

# 6. Start the tunnel
make tunnel-up
```

### Configure DNS

For each service, add a DNS record via the cloudflared CLI:

```bash
# Route subdomains to the tunnel
cloudflared tunnel route dns <tunnel-id> portal.<domain>
cloudflared tunnel route dns <tunnel-id> api.<domain>
cloudflared tunnel route dns <tunnel-id> web.<domain>
# ... etc
```

Or manage DNS records directly in your Cloudflare DNS settings (CNAME → `<tunnel-id>.cfargotunnel.com`).

### Ingress Rules (cloudflared/config.yml)

The config file is auto-generated by `make tunnel-setup`. It maps subdomains to internal Docker services:

| Subdomain | Internal Service | Local Port |
|-----------|-----------------|------------|
| `portal.<domain>` | `http://portal:80` | 8093 |
| `web.<domain>` | `http://garamatic-web:8080` | 8090 |
| `masala.<domain>` | `http://masala-web:8080` | 8091 |
| `showcase.<domain>` | `http://showcase:80` | 8092 |
| `api.<domain>` | `http://gatekeeper-api:8080` | 8086 |
| `tickets.<domain>` | `http://ticket-masala:8080` | 8085 |
| `agentic.<domain>` | `http://agentic-service:3001` | 3001 |
| `odoo-bridge.<domain>` | `http://odoo-integration:8080` | 8089 |
| `mailhog.<domain>` | `http://mailhog:8025` | 8025 |
| `rabbitmq.<domain>` | `http://rabbitmq:15672` | 15672 |
| `odoo.<domain>` | `http://odoo:8069` | 8069 |

You can edit `cloudflared/config.yml` after generation to add, remove, or modify hostnames.

### Commands

```bash
make tunnel-setup    # Generate config.yml + copy credentials.json
make tunnel-up       # Start the Cloudflare Tunnel container
make tunnel-down     # Stop the tunnel container
make tunnel-logs     # Tail tunnel logs
make tunnel-status   # Check tunnel container status
```

### Reconfiguring

If you change `CLOUDFLARE_DOMAIN` or want to add new subdomains:

```bash
# 1. Edit .env (or cloudflared/config.yml directly)
# 2. Regenerate config
make tunnel-setup
# 3. Restart tunnel
make tunnel-down && make tunnel-up
```

## Troubleshooting

### Submodules show as "modified" after no changes

```bash
# This usually means the submodule commit changed on the remote
make pull            # Pull root repo and submodules
# Or, if you want the latest submodule branches:
make update          # Pull latest submodule commits
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

We use **3 separate pipelines** for different branches, following the DevOps best practice of separating dev, test, and production environments:

| Pipeline | Branch | Jobs | Purpose |
|----------|--------|------|---------|
| **ci-dev.yml** | `dev` | Lint, Secret Scan | Fast feedback on feature branches |
| **ci-test.yml** | `test`/`acc` | Lint, Integration Tests, Smoke Tests, Contract Compliance | Full validation before production |
| **ci-prod.yml** | `main` | Lint, Integration Tests, Artifacts | Production gate with test results |

### GitHub Actions

All pipelines run automatically on push/PR. Test results and logs are uploaded as artifacts.

```bash
# View pipeline status
gh workflow list
```

## License

See individual submodules for their respective licenses.

---

**Maintained by Garamatic.**
