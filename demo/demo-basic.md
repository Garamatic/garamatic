# Garamatic Demo — Basic Flow

> **Entry point:** `http://localhost:8092` — the **Architecture Dashboard** shows the full topology, live health, and guides you through this flow interactively.

## Scenario
A citizen creates a support ticket through the Desgoffe citizen portal. The system processes the ticket through multiple independent microservices using RabbitMQ events.

---

## 1. Customer Creates Ticket
**Demo:** Open the citizen portal at `http://localhost:8093` → fill in data → submit ticket.
**What happens:** Frontend calls Ticket Masala → Ticket Masala publishes `ticket.created` via the outbox pattern.

## 2. RabbitMQ Processes Event
**Demo:** Open the Architecture Dashboard's "Event Flow" tab or the RabbitMQ dashboard at `http://localhost:15672`.
**What happens:** One message is published to `event_exchange` and fans out to three independent queues.

## 3. Mailing Service Sends Confirmation
**Demo:** Check Mailhog at `http://localhost:8025` or the dashboard's live metrics.
**What happens:** The mailing service listens for `ticket.created` and automatically sends confirmation emails.

## 4. Ticket Gets Assigned
**Demo:** Log in to Ticket Masala (`http://localhost:8085`) and assign a technician.
**What happens:** `ticket.assigned` event is published → both mailing and agentic services react independently.

## 5. Ticket Gets Resolved
**Demo:** Resolve the ticket with a billable amount.
**What happens:** `ticket.resolved` event is emitted — this is the trigger for the entire billing workflow.

## 6. Invoice Automatically Created in Odoo
**Demo:** Open the Odoo ERP at `http://localhost:8069` (admin/admin) and navigate to Invoicing.
**What happens:** The Odoo Bridge receives `ticket.resolved`, creates a customer and invoice via JSON-RPC, then publishes `invoice.created`.

## 7. Invoice Email Sent
**Demo:** Refresh Mailhog — the invoice email appears.
**What happens:** `invoice.created` fans out to agentic and mailing services. The customer now has an invoice in Odoo and an email notification.

---

**For the full 18-minute narrative with MCP chat, GERDA AI, and payment detection, see [DEMO-FLOW.md](DEMO-FLOW.md).**
