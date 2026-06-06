# Showcase

Static demo pages for the Garamatic ecosystem.

This directory is served by the `showcase` service in [`../docker-compose.yml`](../docker-compose.yml) and is the canonical home for the public portal demo.

## Local URLs

- **Architecture Dashboard**: `http://localhost:8092/` — interactive service topology, live health, event flow, demo narrative, API explorer
- **Citizen Portal**: `http://localhost:8093` — the Desgoffe React portal (built from `portal/`)


## Architecture Dashboard

The `index.html` landing page is an interactive single-page dashboard that showcases the microservices architecture:

- **Live Service Topology** — real-time health polling of all 6 services every 5 seconds
- **Event Flow Visualization** — animated diagram showing a ticket's journey through RabbitMQ
- **Interactive Demo Narrative** — step-by-step demo guide with clickable steps
- **API Explorer** — all endpoints with method badges, descriptions, and direct links
- **Quick Links Panel** — one-click access to every service UI
- **Curl Quickies** — copy-paste ready commands for common API calls

Open `http://localhost:8092` and start the demo narrative to walk through the entire architecture.

## Purpose

The pages here demonstrate:

- the citizen portal form submission into the Ticket Masala API
- the microservices architecture built on top of ticket-masala
- real-time health monitoring and event flow visualization
