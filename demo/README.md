# 🎬 Garamatic Demo Environment

One-command spin-up of a fully populated demo environment with all services seeded via APIs.

## Quick Start

```bash
cd demo
docker compose up --build
```

This will:
1. Start all services (ticket-masala, gatekeeper, mailing-service, agentic-service, odoo-integration, event-planner, rabbitmq, mailhog)
2. Wait for all services to be healthy
3. Seed realistic data via each service's API
4. Show you access URLs

## Architecture

```
demo/
├── docker-compose.yml          # Orchestrates all services + seeder
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
| Odoo Integration | http://localhost:8089 | LiteDB state seeded |
| Mailhog | http://localhost:8025 | Captures all emails |
| RabbitMQ | http://localhost:15672 | guest/guest |

## Data Flow

The seeding creates realistic cross-service interactions:

1. **Tickets** created via ticket-masala API → trigger `ticket.created` events
2. **Events** published via gatekeeper → flow through RabbitMQ to mailing-service and odoo-integration
3. **Emails** sent via agentic-service → captured in Mailhog
4. **Invoices** created via ticket resolution → picked up by odoo-integration
5. **Contacts** submitted to event-planner → forwarded to RabbitMQ

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
