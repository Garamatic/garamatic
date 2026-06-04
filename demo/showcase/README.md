# Showcase

Static tenant demo pages for the Garamatic ecosystem.

This directory is served by the `showcase` service in [`../docker-compose.yml`](../docker-compose.yml) and is the canonical home for the public form demos.

## Local URLs

- **Architecture Dashboard** (new): `http://localhost:8092/` — interactive service topology, live health, event flow, demo narrative, API explorer
- Tenant demo pages: `http://localhost:8092/tenants/<tenant>/client/index.html`
- Config viewer: `http://localhost:8092/config-viewer.html?tenant=<tenant>`

## Architecture Dashboard

The `index.html` landing page is an interactive single-page dashboard that showcases the microservices architecture:

- **Live Service Topology** — real-time health polling of all 8 services every 5 seconds
- **Event Flow Visualization** — animated diagram showing a ticket's journey through RabbitMQ
- **Interactive Demo Narrative** — step-by-step 18-minute demo guide with clickable steps
- **API Explorer** — all endpoints with method badges, descriptions, and direct links
- **Quick Links Panel** — one-click access to every service UI
- **Curl Quickies** — copy-paste ready commands for common API calls

Open `http://localhost:8092` and start the demo narrative to walk through the entire architecture.

## Purpose

The pages here demonstrate:

- tenant-specific theming
- route-level personalization
- form submission into the Ticket Masala API
- config-driven variations per tenant
- the microservices architecture built on top of ticket-masala
