# Showcase

Static tenant demo pages for the Garamatic ecosystem.

This directory is served by the `showcase` service in [`../docker-compose.yml`](../docker-compose.yml) and is the canonical home for the public form demos.

## Local URLs

- Landing page: `http://localhost:8092/`
- Tenant demo pages: `http://localhost:8092/tenants/<tenant>/client/index.html`
- Config viewer: `http://localhost:8092/config-viewer.html?tenant=<tenant>`

## Purpose

The pages here demonstrate:

- tenant-specific theming
- route-level personalization
- form submission into the Ticket Masala API
- config-driven variations per tenant
