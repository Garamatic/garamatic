# Credits & Acknowledgments

## Charlotte Schroer — RabbitMQ Integration

Charlotte Schroer (charlotte.schroer@student.ehb.be) contributed the initial RabbitMQ integration concept for the Desgoffe tenant portal in commit `acd43162e5fa6749300f67d31a5944fcca37fe77` (May 2026).

### What she built

- **`rabbitmq.js`** — Configuration for RabbitMQ queues, exchanges, and routing keys
- **`rabbitMQService.js`** — Service class for form submission via RabbitMQ
- **`success.html`** — Redesigned success page with ticket confirmation
- **`rabbitmq-integration.md`** — Handover documentation for the RabbitMQ setup

### How it's used today

The original browser-direct-to-RabbitMQ approach was architecturally adapted:

```
Portal (React) → HTTP POST → Gatekeeper API → RabbitMQ → Ticket Masala
```

- Charlotte's **config structure** (`tenant`, `queues`, `exchange`, `routingKey`) informed the RabbitMQ topology
- The **Gatekeeper API** (`ticket-masala/src/GatekeeperApi/`) now handles the RabbitMQ publishing
- The portal posts JSON to `/api/ingest` with `event_type: "ticket.created"`
- The Gatekeeper validates, publishes to RabbitMQ, and Ticket Masala consumes

### Files preserved in `masala-web` submodule

Charlotte's original work remains in the `masala-web` submodule:
- `masala-web/tenants/desgoffe/config/rabbitmq.js`
- `masala-web/src/shared/rabbitMQService.js`
- `masala-web/rabbitmq-integration.md`

This preserves full git history and attribution.
