# 🎬 Garamatic Demo Environment

One-command spin-up of a fully populated demo environment with all services seeded via APIs.

## Quick Start

```bash
cd demo
docker compose up --build
```

This will:
1. Start all services (ticket-masala, gatekeeper, mailing-service, agentic-service, odoo-integration, event-planner, showcase, rabbitmq, mailhog)
2. Wait for all services to be healthy
3. Seed realistic data via each service's API
4. Show you access URLs

### Verify the stack

```bash
./scripts/verify.sh
```

Checks health of all 9 services, validates API endpoints, confirms RabbitMQ exchange, and reports demo data counts.

## 🏛️ Architecture Dashboard

The showcase now includes an **interactive architecture dashboard** at:

**http://localhost:8092**

The dashboard provides:
- **Live Service Topology** — Real-time health status of all 8 services, polled every 5 seconds
- **Event Flow Visualization** — Animated diagram showing how a ticket ripples through RabbitMQ to consumers
- **Interactive Demo Narrative** — Step-by-step 18-minute demo guide with clickable steps that highlight relevant services
- **API Explorer** — All service endpoints with method badges, descriptions, and direct links
- **Quick Links Panel** — One-click access to every service UI (Ticket Masala, RabbitMQ, Mailhog, etc.)
- **Curl Quickies** — Copy-paste ready commands for common API calls
- **Live Metrics** — Services up, messages queued, emails captured

Open the dashboard and start the demo narrative to walk through the entire microservices architecture.

## Architecture

```
demo/
├── docker-compose.yml          # Orchestrates all services + seeder
├── showcase/                   # Static tenant demo pages + architecture dashboard
│   ├── index.html              # 🆕 Interactive architecture dashboard
│   ├── config-viewer.html      # Tenant config inspector
│   └── tenants/                # 4 branded portal demos
├── seeding/                    # Seeder container image
│   ├── Dockerfile              # Node.js + curl image
│   ├── seed.js                 # Main orchestrator
│   ├── lib/
│   │   └── api-client.js     # Reusable API client
│   ├── data/
│   │   ├── customers.json    # 10 shared customers
│   │   ├── tickets.json      # 20 realistic tickets
│   │   └── events.json       # 10 integration events
│   └── scripts/
│       ├── seed-ticket-masala.js
│       ├── seed-gatekeeper.js
│       ├── seed-agentic-service.js
│       ├── seed-event-planner.sh
│       └── seed-odoo-integration.sh
└── README.md
```

## Services

| Service | URL | Notes |
|---------|-----|-------|
| Ticket Masala | http://localhost:8085 | 20 tickets seeded via API |
| Gatekeeper | http://localhost:8086 | 10 events published |
| Mailing Service | http://localhost:8087 | Processes RabbitMQ events |
| Agentic Service | http://localhost:3001 | 8 tickets + 4 emails |
| Event Planner | http://localhost:8088 | 12 contact submissions |
| Showcase | http://localhost:8092 | Interactive architecture dashboard |
| Odoo ERP | http://localhost:8069 | admin / admin |
| Odoo Bridge | http://localhost:8089 | LiteDB state seeded |
| Mailhog | http://localhost:8025 | Captures all emails |
| RabbitMQ | http://localhost:15672 | guest/guest |
| API Desgoffe | http://localhost:5081 | Tenant-specific API |
| API Whitman | http://localhost:5082 | Tenant-specific API |
| API Liberty | http://localhost:5083 | Tenant-specific API |
| API Hennessey | http://localhost:5084 | Tenant-specific API |
| Portal Desgoffe | http://localhost:8081 | Branded portal frontend |
| Portal Whitman | http://localhost:8082 | Branded portal frontend |
| Portal Liberty | http://localhost:8083 | Branded portal frontend |
| Portal Hennessey | http://localhost:8084 | Branded portal frontend |

## Data Flow

The seeding creates realistic cross-service interactions:

1. **Tickets** created via ticket-masala API → trigger `ticket.created` events
2. **Events** published via gatekeeper → flow through RabbitMQ to mailing-service and odoo-integration
3. **Emails** sent via agentic-service → captured in Mailhog
4. **Invoices** created via ticket resolution → picked up by odoo-integration
5. **Contacts** submitted to event-planner → forwarded to RabbitMQ
6. **Static tenant forms** opened from the showcase → submit to ticket-masala API

## Reset

```bash
# Tear down everything (including volumes)
docker compose down -v

# Start fresh
docker compose up --build
```

## Customization

Edit the JSON files in `seeding/data/` to change the demo data:

```bash
# Add more customers
vim seeding/data/customers.json

# Add more tickets
vim seeding/data/tickets.json

# Add more events
vim seeding/data/events.json
```

Then rebuild:
```bash
docker compose up --build
```

## Troubleshooting

### Seeder fails

```bash
# Check service logs
docker compose logs ticket-masala
docker compose logs gatekeeper-api

# Re-run seeding manually
docker compose run --rm seeder
```

### Service not starting

```bash
# Check health status
docker compose ps

# Inspect a specific service
docker compose logs -f ticket-masala
```

## Comparison: Demo vs Test

| | Demo (`demo/`) | Integration Tests (`integration-tests/`) |
|---|----------------|------------------------------------------|
| Purpose | Show realistic populated system | Verify integration correctness |
| Data | Rich, realistic, cross-service | Minimal, focused on test cases |
| Seeding | Via APIs (realistic flow) | Via direct DB if needed |
| Persistence | Volumes survive restarts | Clean slate per run |
| Events | Full RabbitMQ flow | Selective event testing |
