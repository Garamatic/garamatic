# Garamatic Demo Flow — Enhanced Script

> **Showcases Odoo integration complexity and Agentic service AI capabilities with clear UI paths and seeding data.**

---

## Pre-Demo Setup

### Seeding Data (Recommended)

Use the pre-seeded accounts from `ticket-masala/config/seed_data.json`:

| Role | Username | Password | Purpose |
|------|----------|----------|---------|
| **Admin** | `admin` | `Admin123!` | Full system access |
| **Manager** | `manager.john` | `Employee123!` | Assign tickets |
| **Agent** | `agent.sarah` | `Employee123!` | Resolve tickets |
| **Customer** | `customer.alice` | `Customer123!` | Submit tickets |
| **Specialist** | `specialist.mike` | `Employee123!` | Technical tickets |

> **Note:** The login page accepts either **Username** or **Email**. You can type `admin` or `admin@localhost.dev` — both work.

**Seed tickets before demo** (use API or run `dotnet run --seed`):
```bash
# Create a pre-seeded ticket for the demo
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Demo: Network outage in Building A",
    "description": "All computers on floor 3 lost network connectivity at 9am. Switch lights are off.",
    "customer_email": "alice@example.com",
    "customer_name": "Alice Johnson",
    "priority": "high"
  }'
```

**Or** use the Masala Web portal directly (customer.alice can log in and create tickets).

### Service URLs

| Service | URL | Demo Use |
|---------|-----|----------|
| Ticket Masala | `http://localhost:8085` | Ticket UI, assignment, resolution |
| Masala Web (Desgoffe) | `http://localhost:8091/tenants/desgoffe/client/index.html` | Customer portal |
| Agentic API | `http://localhost:3001/docs` | OpenAPI docs, direct API calls |
| Agentic MCP | `http://localhost:3001` (SSE) | AI tool exposure |
| Odoo | `http://localhost:8092` | ERP invoice viewing |
| RabbitMQ Mgmt | `http://localhost:15672` | Event flow visualization |
| Mailhog | `http://localhost:8025` | Captured emails |
| Odoo-Bridge Health | `http://localhost:8080/health` | Health checks (inside container) |

---

## 1. Customer Creates Ticket via Portal

### UI Path

1. Open **Masala Web portal**: `http://localhost:8091/tenants/desgoffe/client/index.html`
2. Fill in:
   - **Name**: `Alice Johnson`
   - **Email**: `alice@example.com`
   - **Type**: `Demande Générale`
   - **Quartier**: `Centre-Ville`
   - **Priorité**: `Urgent`
   - **Description**: `"Network outage in Building A — all computers on floor 3 lost connectivity at 9am. Switch lights are off."`
3. Submit

### What Happens (Backend)

- `PortalForm` POSTs to `http://localhost:8085/api/portal/submit`
- `PortalsApiController` creates a new `ApplicationUser` for Alice (if first time) or finds existing
- `TicketLifecycle.HandleCreateAsync`:
  - Creates `Ticket` entity via `Ticket.CreateFromPortal()`
  - Calls `QueueCreatedEventAsync()` → serializes `TicketCreatedEvent` to outbox
  - Commits transaction (ticket + outbox message atomically)
- `OutboxPublisher` (background service, polls every 5s) picks up the message
- Publishes to RabbitMQ exchange `event_exchange` with routing key `event.ticket.created`

### Demo Narration

> "The customer submits through a branded portal. Behind the scenes, Ticket Masala creates the customer account, generates the ticket, and **atomically** queues an event — even if RabbitMQ is down, the event won't be lost. The outbox pattern guarantees eventual delivery."

---

## 2. RabbitMQ Event Flow

### UI Path

1. Open **RabbitMQ Management**: `http://localhost:15672` (guest/guest)
2. Navigate to **Exchanges** → `event_exchange`
3. Click **Bindings** tab — see `agentic_consumer`, `mailing.queue`, `odoo-bridge` queues
4. Click **Publish message** to inspect the `event.ticket.created` payload

### Demo Narration

> "All Garamatic services communicate through a single topic exchange. When a ticket is created, the event fans out to three consumers: the AI agent for notifications, the email worker, and — later — the Odoo bridge. This is event-driven architecture: services don't call each other directly, they react to events."

---

## 3. Agentic Service — AI-Powered Notification

### UI Path — Two Avenues

#### Avenue A: Event-Driven (Automatic)
1. Open **Mailhog**: `http://localhost:8025`
2. Wait 5-10 seconds, refresh — see `Ticket #... Created` email
3. Show email body with ticket details, customer name, priority

#### Avenue B: Agentic API (Interactive)
1. Open **Agentic API Docs**: `http://localhost:3001/docs`
2. Execute `GET /tickets/{ticket_id}` — shows ticket fetched from Ticket Masala
3. Execute `GET /customers/{email}/context` — shows Alice's full profile:
   ```json
   {
     "customer_email": "alice@example.com",
     "summary": {
       "total_tickets": 1,
       "open_tickets": 1,
       "total_invoiced": 0,
       "outstanding_balance": 0
     }
   }
   ```

### Demo Narration

> "The Agentic Service does more than send emails. It maintains a **customer context view** across all services — tickets, invoices, payments. When `ticket.created` arrives, it looks up the customer, renders a personalized notification, and can even trigger multi-step workflows."

> "This same service exposes an **MCP server** — meaning Claude, GPT, or any AI agent can directly call Garamatic tools: `get_ticket_status`, `create_invoice`, `send_email`. The AI doesn't just read data, it can act on it."

---

## 4. Ticket Gets Assigned (with GERDA AI)

### UI Path

1. Log in to **Ticket Masala** as `manager.john` / `Employee123!`
2. Navigate to the ticket list → click the demo ticket
3. On the **Ticket Detail** page, observe the **GERDA AI Insights** sidebar:
   - **Complexity**: Estimated effort points (e.g., `8 points`)
   - **Priority Score**: WSJF ranking (e.g., `15.2`)
   - **AI Tags**: Auto-generated tags from description
   - **Recommended Agent**: `✨ Recommended Agent` card with:
     - `Sarah Chen` (highest affinity score)
     - Current workload: `12/35 pts`
     - Specializations: `General Inquiries, Documentation, Onboarding`
4. Click **"Assign to Sarah Chen"** (or use Edit → Responsible dropdown)
5. Save

### What Happens (Backend)

- `TicketLifecycle.HandleAssignAsync` updates `ticket.ResponsibleId`
- Calls `QueueAssignedEventAsync()` → outbox message `event.ticket.assigned`
- `OutboxPublisher` publishes the event
- **Agentic Service** consumes it → sends assignment notification
- **Mailing Service** also receives it (if templates are configured)

### Demo Narration

> "GERDA is our embedded AI. It reads the ticket description, estimates complexity, calculates priority, and **recommends the best agent** based on workload and specialization. This isn't just assignment — it's intelligent triage."

> "When assignment happens, another event fires. The agentic service sends a notification, and the audit log captures who assigned what and when."

---

## 5. Agent Resolves Ticket (with Billable Amount)

### UI Path

1. Log in as `agent.sarah` / `Employee123!`
2. Find the assigned ticket
3. Click **Edit** → Change **Status** to `Completed`
4. Or use the **API** (for demo speed):
   ```bash
   curl -X POST http://localhost:8085/api/tickets/{ticket-id}/resolve \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer {token}" \
     -d '{
       "resolution_notes": "Replaced faulty switch on floor 3. All devices reconnected.",
       "billable_amount": 250.00
     }'
   ```
5. Check the ticket detail — status shows `Completed`, resolution notes visible

### What Happens (Backend)

- `TicketLifecycle.HandleResolveAsync`:
  - Sets `ticket.TicketStatus = Completed`
  - Sets `ticket.BillableAmount = 250.00`
  - Calls `QueueResolvedEventAsync()` → outbox message `event.ticket.resolved`
  - Commit (ticket + outbox atomic)
- Event payload:
  ```json
  {
    "event_type": "ticket.resolved",
    "ticket_id": "550e8400-e29b-41d4-a716-446655440000",
    "customer_email": "alice@example.com",
    "customer_name": "Alice Johnson",
    "service_description": "Network outage in Building A",
    "amount": 250.00,
    "resolution_notes": "Replaced faulty switch..."
  }
  ```

### Demo Narration

> "Resolution is the trigger for the entire billing workflow. The ticket carries a billable amount — this is what Odoo will invoice. The event is published with all context: customer, service description, amount."

---

## 6. Odoo Integration — Invoice Creation (The Complex Part)

### UI Path — Multiple Windows

1. **Odoo-Bridge Logs** (Terminal): `docker compose logs -f odoo-bridge`
2. **Odoo ERP** (Browser): `http://localhost:8092`
   - Log in with `admin` / `admin`
   - Navigate to **Invoicing** → **Customers** → `Alice Johnson` (auto-created)
   - Navigate to **Invoicing** → **Invoices** — see the new invoice
3. **Odoo-Bridge Health** (optional): `curl http://localhost:8080/health` (from inside container)

### What Happens (Backend — Step by Step)

1. **Consume**: `TicketResolvedConsumer` receives `event.ticket.resolved`
2. **Deduplicate**: Checks LiteDB — "Has this ticket been processed?"
3. **Auth**: Calls `authenticate()` on Odoo JSON-RPC → gets UID (session-based auth)
4. **Customer Lookup**: `res.partner` search by email — if not found, create:
   ```json
   {
     "name": "Alice Johnson",
     "email": "alice@example.com",
     "customer_rank": 1,
     "is_company": false
   }
   ```
5. **Invoice Create**: `account.move` with `move_type='out_invoice'`:
   ```json
   {
     "partner_id": 123,
     "invoice_line_ids": [
       [0, 0, {
         "name": "Network outage in Building A",
         "quantity": 1,
         "price_unit": 250.00,
         "account_id": 21
       }]
     ]
   }
   ```
6. **Post**: `action_post` to validate the invoice (draft → posted)
7. **Persist**: LiteDB stores: `ticket_id`, `odoo_invoice_id`, `status`, `due_date`
8. **Publish**: `IOutbox` publishes `invoice.created` event atomically:
   ```json
   {
     "event_type": "invoice.created",
     "invoice_id": "inv-550e8400-...",
     "odoo_invoice_id": "1234",
     "ticket_id": "550e8400-...",
     "customer_email": "alice@example.com",
     "amount": 250.00,
     "status": "posted"
   }
   ```

### Demo Narration

> "This is where the real complexity lives. Odoo Community Edition has **no REST API**. We use JSON-RPC with session-based authentication. Every call requires a database name, a user ID, and a password. Creating an invoice requires nested array syntax for line items — `[0, 0, {...}]` means 'create new relation record.'"

> "The invoice starts in `draft`. We must explicitly call `action_post` to validate it. Without this, the invoice can't be paid. And because Odoo has no webhooks, we **poll** every 5 minutes to detect payment status changes."

> "Notice the deduplication check: if the same ticket is resolved twice, we don't create a duplicate invoice. The LiteDB state machine tracks every processed ticket."

---

## 7. Invoice Email Sent

### UI Path

1. **Mailhog**: `http://localhost:8025` — refresh, see `New Invoice #...` email
2. **Agentic Logs**: `docker compose logs -f agentic-service` — show:
   ```
   consumer.received routing_key=event.invoice.created
   notification.result routing_key=invoice.created status=queued
   ```

### Demo Narration

> "The invoice.created event triggers two things: the Agentic Service sends a notification email, and the Odoo-Bridge adds the invoice to its pending list for polling. The customer now has an invoice in Odoo and an email in their inbox."

---

## 8. (Bonus) Payment Detection

### UI Path

1. In **Odoo**, open the invoice → click **Register Payment**
2. Select payment method, confirm
3. **Odoo-Bridge Logs**: Watch for:
   ```
   Invoice 1234 status changed from posted to paid
   Published payment.received for invoice 1234
   ```
4. **Mailhog**: Refresh — see `Payment Received` thank-you email

### Demo Narration

> "Odoo doesn't tell us when payment happens. We poll every 5 minutes. When the status changes from `posted` to `paid`, the bridge publishes `payment.received`. The Agentic Service sends a thank-you email — closing the loop."

---

## 9. (Bonus) Agentic MCP — AI Agent Interaction

### Demo Path

1. Open a terminal with `claude` or any MCP client configured:
   ```json
   {
     "mcpServers": {
       "garamatic": {
         "command": "uv",
         "args": ["run", "garamatic-mcp"],
         "cwd": "/path/to/agentic-service"
       }
     }
   }
   ```
2. Ask the AI:
   - `"What is the status of ticket #...?"` → AI calls `get_ticket_status`
   - `"Create an invoice for €300 for ticket #..."` → AI calls `create_invoice`
   - `"Send a follow-up email to alice@example.com"` → AI calls `send_email`
   - `"Show me Alice Johnson's full context"` → AI calls `get_customer_context`

### Demo Narration

> "This is the Agentic Service's core capability. Through the Model Context Protocol, AI agents can directly interact with Garamatic. They can query tickets, create invoices, send emails — all with the same business logic as the REST API. The AI doesn't just read data; it can execute multi-step workflows."

---

## Quick Demo Cheat Sheet

```bash
# Start stack
docker compose up --build -d

# Check all services healthy
./scripts/health-check.sh

# Watch events flow
docker compose logs -f ticket-masala | grep -E "outbox|Queued|Published"
docker compose logs -f agentic-service | grep -E "consumer|notification"
docker compose logs -f odoo-bridge | grep -E "Processing|Customer|Invoice|Published"
docker compose logs -f mailing-service | grep -E "Event received|Raw message"

# Check RabbitMQ
curl -u guest:guest http://localhost:15672/api/queues | jq '.[].name'

# Check Mailhog
curl http://localhost:8025/api/v2/messages | jq '.count'

# Agentic API health
curl http://localhost:3001/health

# Create ticket via API (fast)
curl -X POST http://localhost:8085/api/tickets \
  -H "Content-Type: application/json" \
  -d '{"title":"Demo ticket","description":"Demo","customer_email":"alice@example.com","customer_name":"Alice","priority":"medium"}'

# Resolve ticket via API
curl -X POST http://localhost:8085/api/tickets/{id}/resolve \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes":"Fixed","billable_amount":150}'

# Create invoice via Agentic API
curl -X POST http://localhost:3001/invoices/{ticket_id} \
  -H "Content-Type: application/json" \
  -d '{"amount":150,"description":"Demo invoice"}'

# Send email via Agentic API
curl -X POST http://localhost:3001/emails \
  -H "Content-Type: application/json" \
  -d '{"to_email":"alice@example.com","subject":"Test","body":"Hello"}'

# Get customer context
curl http://localhost:3001/customers/alice@example.com/context
```

---

## Architecture Takeaways

| Pattern | Where | Why It Matters |
|---------|-------|---------------|
| **Outbox Pattern** | Ticket Masala | Atomic event publishing — events survive crashes |
| **Event-Driven** | RabbitMQ | Services are decoupled — no direct HTTP calls |
| **Circuit Breaker** | Odoo Bridge | Prevents cascade failure when Odoo is down |
| **Polling** | InvoiceStatusPoller | Odoo has no webhooks — required for payment detection |
| **JSON-RPC** | Odoo Client | Odoo CE has no REST API — legacy integration pattern |
| **MCP** | Agentic Service | AI agents can directly call business tools |
| **Template Registry** | NotificationComposer | Clean separation of event types from rendering |
| **LiteDB State** | Odoo Bridge | Tracks processed tickets — prevents duplicate invoices |
