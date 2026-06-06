# Legacy Reference

Files preserved from the `masala-web` submodule for reference and documentation.

## Contents

| File | Source | What it is |
|------|--------|-----------|
| `rabbitmq-integration.md` | `masala-web/rabbitmq-integration.md` | Charlotte's handover document — RabbitMQ deployment guide, message contract schema, and deployment steps |
| `rabbitMQService.js` | `masala-web/src/shared/rabbitMQService.js` | HTTP adapter that POSTs JSON payloads to a message bus bridge. Adaptable to the Gatekeeper API |
| `portal-form.js` | `masala-web/src/shared/portal-form.js` | Vanilla JS form handler with ARIA validation, character counter, file upload |
| `portal-form.test.js` | `masala-web/src/shared/portal-form.test.js` | Tests for the vanilla form handler |
| `rabbitmq-config.js` | `masala-web/tenants/desgoffe/config/rabbitmq.js` | Tenant-specific RabbitMQ configuration (queues, exchanges, routing keys) |
| `masala_config.json` | `masala-web/tenants/desgoffe/config/masala_config.json` | Domain configuration for the Desgoffe tenant |
| `masala_domains.yaml` | `masala-web/tenants/desgoffe/config/masala_domains.yaml` | Domain definition (work item types, priorities, routing rules) |
| `seed_data.json` | `masala-web/tenants/desgoffe/config/seed_data.json` | Seed data for demo purposes |

## How these relate to the current portal

The current portal (`portal/src/`) uses:
- React hooks instead of `portal-form.js`
- Inline fetch calls instead of `rabbitMQService.js`
- CSS variables in `index.css` instead of the old Tailwind CDN approach
- The Gatekeeper API (`/api/ingest`) instead of direct RabbitMQ

These legacy files are kept for reference and to preserve Charlotte's work.
