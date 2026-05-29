# Garamatic Demo Flow — Corrected Script

> **After fixes applied:** mailing-service queue bindings, exchange name consistency, and missing `ticket.created`/`ticket.assigned` outbox publishing.

---

## Scenario

A customer creates a support ticket through the frontend. The system processes the ticket through multiple independent services using RabbitMQ events.

---

## 1. Customer Creates Ticket

### Demo

1. Open browser to **Masala Web portal** (tenant-specific form)
   - Desgoffe: `http://localhost:8091/tenants/desgoffe/client/index.html`
   - Liberty: `http://localhost:8091/tenants/liberty/client/index.html`
   - Hennessey: `http://localhost:8091/tenants/hennessey/client/index.html`
2. Fill in customer data and ticket details
3. Submit the form

### What Happens

- **masala-web** form submits via `PortalForm` to `http://localhost:8085/api/portal/submit`
- **ticket-masala** (`TicketLifecycle.HandleCreateAsync`) creates the ticket and:
  - Calls `QueueCreatedEventAsync()` → queues `ticket.created` outbox message (routing: `event.ticket.created`)
  - Commits the transaction (ticket + outbox message atomically)
- **OutboxPublisher** (background service) polls every 5 seconds and publishes the event to RabbitMQ exchange `event_exchange`

### Verification

```bash
# Check RabbitMQ Management UI
curl -u guest:guest http://localhost:15672/api/exchanges/%2f/event_exchange/bindings/source

# Check ticket was created
curl http://localhost:8085/api/portal/health
```

---

## 2. RabbitMQ Processes Event

### Demo

1. Open RabbitMQ Management Dashboard: `http://localhost:15672` (guest/guest)
2. Navigate to **Exchanges** → `event_exchange` → see bindings
3. Show message flow diagram

### Explain

- All services use the **same exchange**: `event_exchange` (topic type)
- Routing keys follow pattern: `event.{event_type}`
- Dead-letter exchange: `event_exchange.dlx` for failed messages

### Queue Bindings (after fixes)

| Queue | Bindings | Consumer |
|-------|----------|----------|
| `agentic_consumer` | `event.ticket.*`, `event.invoice.*`, `event.payment.*` | agentic-service |
| `mailing.queue` | `event.ticket.*`, `event.invoice.*`, `event.payment.*`, `event.email.send` | mailing-service |
| `odoo-bridge` | `event.ticket.resolved`, `event.invoice.create_requested` | odoo-integration |

---

## 3. Agentic Service Sends Confirmation Email

### Demo

1. Show agentic-service logs: `docker compose logs -f agentic-service`
2. Show Mailhog UI: `http://localhost:8025` — captured email appears

### Explain

- **agentic-service** consumes `event.ticket.created` from `event_exchange`
- `NotificationComposer` renders the email template (`_ticket_created_template`)
- Email is sent via `MessageQueueEmailSender` or `ServiceEmailSender`
- **Mailhog** captures the email for demo inspection

### Email Template

- Subject: `Ticket #{ticket_id} Created - {title}`
- Body: Welcome message with ticket details
- Sender: `support@garamatic.com`

---

## 4. Ticket Gets Assigned

### Demo

1. Log in to **ticket-masala** at `http://localhost:8085` (admin account)
2. Find the ticket and assign a technician
3. Show assignment event in RabbitMQ

### What Happens

- **ticket-masala** (`TicketLifecycle.HandleAssignAsync`) assigns the ticket and:
  - Calls `QueueAssignedEventAsync()` → queues `ticket.assigned` outbox message (routing: `event.ticket.assigned`)
  - Commits the transaction atomically
- **OutboxPublisher** publishes the event
- **agentic-service** and **mailing-service** both consume the event

### Result

- **agentic-service** sends assignment notification email
- **mailing-service** (if templates are configured) also processes the event

---

## 5. Ticket Gets Resolved

### Demo

1. Mark the ticket as resolved in ticket-masala
2. Enter resolution notes and billable amount
3. Show `ticket.resolved` event published

### Explain

- **ticket-masala** (`TicketLifecycle.HandleResolveAsync`) resolves the ticket and:
  - Calls `QueueResolvedEventAsync()` → queues `ticket.resolved` outbox message
  - Commits the transaction
- **OutboxPublisher** publishes to `event.ticket.resolved`

### Event Payload

```json
{
  "event_type": "ticket.resolved",
  "timestamp": "2024-01-15T10:30:00Z",
  "source": "ticket-masala",
  "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
  "customer_email": "user@example.com",
  "customer_name": "Jane Customer",
  "service_description": "Network issue",
  "amount": 150.00,
  "resolution_notes": "Fixed router configuration"
}
```

---

## 6. Invoice Automatically Created in Odoo

### Demo

1. Show **odoo-integration** logs processing the event
2. Open Odoo at `http://localhost:8092` and show the new invoice
3. Show invoice state in LiteDB

### Explain

- **odoo-integration** (`TicketResolvedConsumer`) consumes `event.ticket.resolved`
- `InvoiceStateMachine` orchestrates:
  1. Deduplication check (LiteDB)
  2. Create customer in Odoo (`res.partner`) if new
  3. Create invoice (`account.move`) with line items
  4. Post invoice (if `AutoPostInvoices=true`)
  5. Publish `invoice.created` event via `IOutbox` (atomic: event + persistence)
- **InvoiceStatusPoller** polls Odoo every 5 minutes for payment status

### Event Chain

```
ticket.resolved → odoo-integration → invoice.created → RabbitMQ
```

---

## 7. Invoice Email Sent

### Demo

1. Show **agentic-service** processing `invoice.created`
2. Show **mailing-service** processing `invoice.created`
3. Show invoice email in Mailhog UI

### Explain

- **agentic-service** consumes `event.invoice.created`
- `NotificationComposer` renders `_invoice_created_template`
- Email sent to customer with invoice details
- **mailing-service** also receives the event and can process it (if handler configured)

### Email Template

- Subject: `New Invoice #{invoice_id} - €{amount}`
- Body: Invoice details with link to Odoo

---

## 8. (Bonus) Payment Received

### Demo

1. Mark invoice as paid in Odoo
2. Show `payment.received` event published by `InvoiceStatusPoller`

### Explain

- **odoo-integration** (`InvoiceStatusPoller`) detects payment status change
- Publishes `payment.received` event
- **agentic-service** sends "Thank you for your payment" email

---

## Service URLs (Docker Compose)

| Service | URL | Purpose |
|---------|-----|---------|
| Ticket Masala | `http://localhost:8085` | Ticket management + API |
| Gatekeeper | `http://localhost:8086` | External ingestion API |
| Mailing Service | `http://localhost:8087` | Email worker + API |
| Event Planner | `http://localhost:8088` | Drupal CMS |
| Garamatic Web | `http://localhost:8090` | Marketing site |
| Masala Web | `http://localhost:8091` | Ticket portals (desgoffe/liberty/hennessey) |
| Agentic | `http://localhost:3001` | MCP server + API |
| Odoo | `http://localhost:8092` | ERP / CRM |
| RabbitMQ Mgmt | `http://localhost:15672` | Message broker dashboard |
| Mailhog | `http://localhost:8025` | Test email capture |

---

## Quick Start Commands

```bash
# Start the entire stack
docker compose up --build

# Check health
./scripts/health-check.sh

# View logs per service
docker compose logs -f ticket-masala
docker compose logs -f agentic-service
docker compose logs -f odoo-bridge
docker compose logs -f mailing-service

# Check RabbitMQ queues
curl -u guest:guest http://localhost:15672/api/queues

# Check Mailhog messages
curl http://localhost:8025/api/v2/messages
```

---

## Fixes Applied

1. ✅ **mailing-service queue bindings**: Added `QueueBindAsync` to bind `mailing.queue` to `event_exchange` with all relevant routing keys
2. ✅ **Exchange name consistency**: Changed all references from `garamatic.events` to `event_exchange` across docker-compose, appsettings, integration-contracts docs, agentic-service, and mailing-service
3. ✅ **ticket.created publishing**: Added `QueueCreatedEventAsync` in `TicketLifecycle.HandleCreateAsync` to queue outbox message
4. ✅ **ticket.assigned publishing**: Added `QueueAssignedEventAsync` in `TicketLifecycle.HandleAssignAsync` to queue outbox message
5. ✅ **Messaging event classes**: Created `TicketCreatedEvent` and `TicketAssignedEvent` in `TicketMasala.Web.Messaging.Events` namespace
