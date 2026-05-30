# 🌱 Demo Seeding Guide

> **Centralized in `demo/`** — All demo seeding is now orchestrated from the main repo's `demo/` directory. Submodules stay clean.

## Quick Start

```bash
cd demo
docker compose up --build
```

This single command:
1. Starts all services
2. Waits for health checks
3. Seeds realistic data via APIs
4. Produces a fully populated demo environment

## Architecture

```
garamatic/
├── demo/                          ← Centralized demo orchestration
│   ├── docker-compose.yml         # All services + seeder
│   ├── seeding/                   # Seeder container
│   │   ├── seed.js                # Orchestrator
│   │   ├── data/                  # Shared demo data
│   │   │   ├── customers.json     # 10 shared customers
│   │   │   ├── tickets.json     # 20 realistic tickets
│   │   │   └── events.json      # 10 integration events
│   │   └── scripts/               # Per-service seeding
│   │       ├── seed-ticket-masala.js
│       ├── seed-gatekeeper.js
│       ├── seed-agentic-service.js
│       ├── seed-event-planner.sh
│       └── seed-odoo-integration.sh
│   └── README.md
│
├── ticket-masala/                 ← Clean submodule
│   └── config/seed_data.json     # Minimal: roles, admin, basic structure
│
├── agentic-service/               ← Clean submodule
├── odoo-integration/              ← Clean submodule
├── event-planner/                 ← Clean submodule
└── integration-tests/             ← Clean submodule
```

## Why Centralized?

| Before (decentralized) | After (centralized) |
|------------------------|---------------------|
| Rich seeding scripts in every submodule | Submodules stay clean |
| Seed data baked into Docker images | No demo bloat in production images |
| Raw DB seeding bypasses business logic | API seeding triggers real events |
| Each service seeded in isolation | Cross-service interactions work |
| Multiple commands to seed everything | Single `docker compose up --build` |

## Data Flow

The seeder creates realistic cross-service interactions:

1. **Tickets** → `POST /api/tickets` to ticket-masala
2. **Events** → `POST /ingest` to gatekeeper → RabbitMQ → mailing-service + odoo-integration
3. **Emails** → `POST /emails` to agentic-service → captured in Mailhog
4. **Invoices** → `POST /invoices` via agentic-service → odoo-integration processes
5. **Contacts** → `POST /api/contact` to event-planner → forwarded to RabbitMQ

## Services

| Service | URL | Seeded Via |
|---------|-----|------------|
| Ticket Masala | http://localhost:8085 | REST API |
| Gatekeeper | http://localhost:8086 | REST API |
| Mailing Service | http://localhost:8087 | RabbitMQ events |
| Agentic Service | http://localhost:3001 | REST API |
| Event Planner | http://localhost:8088 | REST API |
| Odoo Integration | http://localhost:8089 | LiteDB file (via shared volume) |
| Mailhog | http://localhost:8025 | Captures emails automatically |
| RabbitMQ | http://localhost:15672 | guest/guest |

## Customization

Edit the JSON files in `demo/seeding/data/`:

```bash
vim demo/seeding/data/customers.json
vim demo/seeding/data/tickets.json
vim demo/seeding/data/events.json
```

Then rebuild:
```bash
cd demo
docker compose up --build
```

## Reset

```bash
cd demo
docker compose down -v
docker compose up --build
```

## Troubleshooting

```bash
# Check service logs
docker compose logs ticket-masala

# Re-run seeding
docker compose run --rm seeder

# Check health status
docker compose ps
```

## Submodule Cleanup

The following files were moved from submodules to `demo/`:

- `ticket-masala/scripts/generate-rich-seed-data.py` → `demo/seeding/data/tickets.json`
- `ticket-masala/scripts/generate-tenant-seed-data.py` → `demo/seeding/data/tickets.json`
- `agentic-service/scripts/seed_demo_data.py` → `demo/seeding/scripts/seed-agentic-service.js`
- `odoo-integration/scripts/SeedLiteDb.cs` → `demo/seeding/scripts/seed-odoo-integration.sh`
- `event-planner/scripts/seed-demo-contacts.sh` → `demo/seeding/scripts/seed-event-planner.sh`

Submodules now only contain minimal `seed_data.json` for basic startup structure.
