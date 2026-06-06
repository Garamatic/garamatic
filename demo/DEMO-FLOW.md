# Garamatic Ecosystem Demo — Advanced Capabilities

> **Focus:** MCP, RabbitMQ event bus, Odoo ERP integration, mailing service, and AI-driven automation.
> **Assumption:** Basic Ticket Masala capabilities (ticket CRUD, assignment, resolution) were demoed in the previous round.
> **Entry point:** `http://localhost:8092` — **Architecture Dashboard** (new). Start here for the interactive service topology, live health, and demo narrative.

---

## Pre-Demo Setup (2 minutes)

```bash
cd /home/juan/Projects/garamatic
docker compose -f demo/docker-compose.yml up --build -d

# Verify all services are healthy
docker compose -f demo/docker-compose.yml ps
```

> **Important:** The AI Agent requires `OPENAI_API_KEY` to be set. For the demo:
> ```bash
> export OPENAI_API_KEY='your-key-here'
> # Or add it to .env in the agentic-service directory
> ```
> If no key is set, the chat UI will show a graceful error: *"The agent is unavailable. Is OPENAI_API_KEY set?"*

### Service Quick-Reference

| Service | URL | What to show |
|---------|-----|--------------|
| **Architecture Dashboard** | **`http://localhost:8092`** | **Start here** — live topology, health, event flow, narrative |
| Portal (Desgoffe) | `http://localhost:8093` | Citizen portal entry point |
| Ticket Masala | `http://localhost:8085` | Ticket lifecycle UI + **AI Chat** |
| RabbitMQ Mgmt | `http://localhost:15672` (guest/guest) | Event bus, bindings, message flow |
| Agentic Service API | `http://localhost:3001/docs` | MCP tools, OpenAPI docs |
| Mailhog | `http://localhost:8025` | All captured emails |
| Odoo Bridge | `http://localhost:8089/health` | Health + LiteDB state |
| Odoo ERP | `http://localhost:8069` (admin/admin) | Invoices, customers |
| Mailing Service | `http://localhost:8087/health` | Email worker health |

> **Screen layout suggestion:** Browser tabs: Showcase (left), RabbitMQ (right), Ticket Masala (center), Mailhog (secondary). Terminal: `docker compose logs -f` for each service.

---

## The Narrative: One Ticket, Seven Services

> **Presenter framing:** "We're not demoing individual features. We're following one real business event — a citizen complaint — as it ripples through our entire microservice ecosystem. Every service reacts independently. No service calls another directly."

---

## Step 1: Citizen Submits Complaint (Showcase Portal)

**Time:** 1 min
**What to show:** Desgoffe portal form submission

### Demo

1. Open `http://localhost:8093`
2. Fill in:
   - **Nom:** `Alice Johnson`
   - **Email:** `alice@example.com`
   - **Type:** `Nuisance Sonore`
   - **Quartier:** `Centre-Ville`
   - **Priorité:** `Urgent`
   - **Description:** `"Loud construction noise at 6am on Rue de la Loi. No permit visible."`
3. Submit

### What Happens (Backend)

- `PortalForm` POSTs `multipart/form-data` to `http://localhost:8085/api/portal/submit`
- `TicketMasala` creates a `Ticket` + `ApplicationUser` (if new customer)
- `TicketLifecycle.HandleCreateAsync()` atomically:
  1. Persists ticket to SQLite
  2. Queues `ticket.created` event to outbox table
  3. Commits transaction
- `OutboxPublisher` (background service, polls every 5s) picks up the outbox message
- Publishes to RabbitMQ exchange `event_exchange` with routing key `event.ticket.created`

> **Presenter says:** "Even if RabbitMQ is down right now, the event is safe in the SQLite outbox. It will be retried until delivery succeeds. That's the outbox pattern — atomic transaction + eventual delivery."

### Verification

```bash
# Check outbox has the message (inside ticket-masala container)
docker exec garamatic_demo_ticket_masala sqlite3 /app/data/masala_demo.db "SELECT * FROM OutboxMessages ORDER BY Id DESC LIMIT 1;"

# Check RabbitMQ exchange
curl -u guest:guest http://localhost:15672/api/exchanges/%2f/event_exchange/bindings/source
```

---

## Step 2: RabbitMQ — The Event Bus (Fan-Out)

**Time:** 2 min
**What to show:** RabbitMQ Management Dashboard

### Demo

1. Open `http://localhost:15672` (guest/guest)
2. Navigate to **Exchanges** → `event_exchange` (topic type)
3. Click **Bindings** tab — show three queues bound:
   - `agentic_consumer` — `event.ticket.*`, `event.invoice.*`, `event.payment.*`
   - `mailing.queue` — `event.ticket.*`, `event.invoice.*`, `event.payment.*`, `event.email.send`
   - `odoo-bridge` — `event.ticket.resolved`, `event.invoice.create_requested`
4. Click **Publish message** (or wait for next event) to inspect the `event.ticket.created` payload

### What Happens

- One message is published to `event_exchange`
- Three queues receive a **copy** of the message (fan-out)
- Each consumer processes independently — no coupling, no coordination

> **Presenter says:** "This is the heart of our architecture. One event, three consumers, zero coupling. If the Odoo bridge is down, the agentic service and mailing service still process the event. If mailing is slow, Odoo doesn't care."

### Verification

```bash
# Check queue depths
curl -u guest:guest http://localhost:15672/api/queues | jq '.[] | {name: .name, messages: .messages_ready}'

# Watch message rates
curl -u guest:guest http://localhost:15672/api/overview | jq '.message_stats'
```

---

## Step 3: Agentic Service — MCP + AI Notification

**Time:** 3 min
**What to show:** Agentic service logs + Mailhog captured email + MCP API docs

### Demo

1. **Terminal:** `docker compose -f demo/docker-compose.yml logs -f agentic-service`
2. **Browser:** Open `http://localhost:8025` — refresh, see `Ticket #... Created` email
3. **Browser:** Open `http://localhost:3001/docs` — show the OpenAPI docs

### What Happens

- `agentic-service` consumes `event.ticket.created` from `agentic_consumer` queue
- `NotificationComposer` selects `_ticket_created_template`
- Renders email with ticket ID, customer name, priority, description
- Sends via `MessageQueueEmailSender` (or `ServiceEmailSender`) to Mailhog

> **Presenter says:** "The agentic service doesn't just send emails. It exposes an MCP server — meaning Claude, GPT, or any AI agent can directly call our business tools."

### MCP Demo — Interactive Chat in Ticket Masala

**The most impressive demo:** Open the AI chat directly inside Ticket Masala.

1. **Browser:** Log in to `http://localhost:8085` → open any ticket detail page
2. Click **"Ask AI about this ticket"** (purple button at bottom, or "Ask AI" in the GERDA sidebar)
3. The chat opens and immediately asks: *"I'm looking at ticket #XYZ. What can you tell me about it?"*
4. Watch the agent respond with ticket status, customer context, and invoice info
5. Type follow-ups like:
   - *"Create a €200 invoice for this ticket"*
   - *"Send an email to the customer"*
   - *"Show me Alice's full context"*

> **Presenter says:** "This isn't just a chatbot. The agent has direct access to the same MCP tools that Claude or GPT would use. It can query tickets, create invoices, send emails — all through the same business layer. The AI doesn't just read data; it can act on it."

### MCP Demo (API — for developers)

```bash
# Direct API call — get ticket status
curl http://localhost:3001/tickets/{ticket-id}

# Get customer full context
curl http://localhost:3001/customers/alice@example.com/context
```

Response:
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

> **Presenter says:** "This is the Model Context Protocol. The AI doesn't just read data — it can call `create_invoice`, `send_email`, `get_ticket_status`. The same business logic, exposed to both humans and AI agents."

### Quick Actions (No Typing Required)

The chat also has **quick action buttons** for common queries:
- **Customer tickets** — "What tickets does alice@example.com have?"
- **Customer context** — "Show me Alice Johnson's full context"
- **Create invoice** — "Create a €200 invoice for ticket #123"
- **Invoice status** — "What is the invoice status for ticket #123?"
- **This ticket** — (only when opened from ticket detail) queries the current ticket
- **Invoice this ticket** — (only when opened from ticket detail) creates invoice with €150

### Floating Chat Button

A floating AI chat button appears on **every page** in Ticket Masala (bottom-right corner). Click it to open the chat from anywhere — you don't need to navigate to a specific page.

### Verification

```bash
# Check agentic service processed the event
docker compose -f demo/docker-compose.yml logs agentic-service | grep "ticket.created"

# Check Mailhog has the email
curl http://localhost:8025/api/v2/messages | jq '.count'
```

---

## Step 4: Mailing Service — Event-Driven Email Worker

**Time:** 1 min
**What to show:** Mailing service logs + RabbitMQ queue consumption

### Demo

1. **Terminal:** `docker compose -f demo/docker-compose.yml logs -f mailing-service`
2. **RabbitMQ:** Show `mailing.queue` — message delivered, consumer acked

### What Happens

- `mailing-service` consumes `event.ticket.created` from `mailing.queue`
- Processes the event (if email templates are configured, sends email)
- If no template configured, logs the event for inspection

> **Presenter says:** "The mailing service is a dedicated email worker. It receives events from RabbitMQ, renders templates, and sends via SendGrid. In this demo, it logs to Mailhog so we can inspect every email without sending real ones."

### Verification

```bash
# Check mailing service received the event
docker compose -f demo/docker-compose.yml logs mailing-service | grep "Event received"
```

---

## Step 5: Ticket Assignment — GERDA AI + Human Decision

**Time:** 2 min
**What to show:** Ticket Masala UI → assignment → new event published

### Demo

1. Open `http://localhost:8085` — log in as `manager.john` / `Employee123!`
2. Find the ticket Alice just created
3. On **Ticket Detail** page, observe the **GERDA AI Insights** sidebar:
   - **Complexity:** Estimated effort points
   - **Priority Score:** WSJF ranking
   - **AI Tags:** Auto-generated from description
   - **Recommended Agent:** `Sarah Chen` (highest affinity, workload `12/35 pts`)
4. Click **"Assign to Sarah Chen"**
5. Save

### What Happens

- `TicketLifecycle.HandleAssignAsync()`:
  1. Updates `ticket.ResponsibleId`
  2. Queues `ticket.assigned` outbox message
  3. Commits transaction
- `OutboxPublisher` publishes `event.ticket.assigned`
- **Agentic Service** consumes → sends assignment notification
- **Mailing Service** consumes → processes event

> **Presenter says:** "GERDA is our embedded AI. It reads the description, estimates complexity, calculates priority, and recommends the best agent based on workload and specialization. The assignment itself triggers another event — the cycle continues."

### Verification

```bash
# Watch assignment event in RabbitMQ
curl -u guest:guest http://localhost:15672/api/queues/%2f/agentic_consumer | jq '.messages_ready'

# Check agentic service sent assignment email
docker compose -f demo/docker-compose.yml logs agentic-service | grep "ticket.assigned"
```

---

## Step 6: Agent Resolves Ticket — The Billing Trigger

**Time:** 2 min
**What to show:** Ticket status change → `ticket.resolved` event → billable amount

### Demo

1. Log in as `agent.sarah` / `Employee123!`
2. Find the assigned ticket
3. Click **Edit** → Change **Status** to `Completed`
4. Enter:
   - **Resolution notes:** `"Contacted contractor. Verified no permit. Issued cease order."`
   - **Billable amount:** `€150.00`
5. Save

### What Happens

- `TicketLifecycle.HandleResolveAsync()`:
  1. Sets `ticket.TicketStatus = Completed`
  2. Sets `ticket.BillableAmount = 150.00`
  3. Queues `ticket.resolved` outbox message
  4. Commits transaction
- Event payload:
```json
{
  "event_type": "ticket.resolved",
  "ticket_id": "...",
  "customer_email": "alice@example.com",
  "customer_name": "Alice Johnson",
  "service_description": "Nuisance Sonore — Centre-Ville",
  "amount": 150.00,
  "resolution_notes": "Contacted contractor..."
}
```

> **Presenter says:** "Resolution is the trigger for the entire billing workflow. The ticket carries a billable amount — this is what Odoo will invoice. The event is published with full context: customer, service, amount."

### Verification

```bash
# Check ticket is resolved and has billable amount
curl http://localhost:8085/api/tickets/{ticket-id} | jq '{status: .ticketStatus, amount: .billableAmount}'

# Check RabbitMQ for resolved event
curl -u guest:guest http://localhost:15672/api/queues/%2f/odoo-bridge | jq '.messages_ready'
```

---

## Step 7: Odoo Bridge — The Complex Integration (JSON-RPC, State Machine, Polling)

**Time:** 4 min
**What to show:** Odoo Bridge logs → Odoo ERP → invoice created → LiteDB state

### Demo

1. **Terminal:** `docker compose -f demo/docker-compose.yml logs -f odoo-integration`
2. **Browser:** Open `http://localhost:8069` (Odoo ERP) — log in `admin` / `admin`
3. Navigate to **Invoicing** → **Customers** → search `Alice Johnson` (auto-created)
4. Navigate to **Invoicing** → **Invoices** — see the new invoice

### What Happens (Step by Step)

1. **Consume:** `TicketResolvedConsumer` receives `event.ticket.resolved`
2. **Deduplicate:** Checks LiteDB — "Has this ticket been processed?"
3. **Auth:** Calls `authenticate()` on Odoo JSON-RPC → gets UID (session-based auth)
4. **Customer Lookup:** `res.partner` search by email — if not found, creates:
   ```json
   { "name": "Alice Johnson", "email": "alice@example.com", "customer_rank": 1 }
   ```
5. **Invoice Create:** `account.move` with `move_type='out_invoice'`:
   ```json
   {
     "partner_id": 123,
     "invoice_line_ids": [[0, 0, {
       "name": "Nuisance Sonore — Centre-Ville",
       "quantity": 1,
       "price_unit": 150.00,
       "account_id": 21
     }]]
   }
   ```
6. **Post:** `action_post` validates the invoice (draft → posted)
7. **Persist:** LiteDB stores: `ticket_id`, `odoo_invoice_id`, `status`, `due_date`
8. **Publish:** `IOutbox` publishes `invoice.created` event atomically:
   ```json
   {
     "event_type": "invoice.created",
     "invoice_id": "inv-...",
     "odoo_invoice_id": "1234",
     "ticket_id": "...",
     "customer_email": "alice@example.com",
     "amount": 150.00,
     "status": "posted"
   }
   ```

> **Presenter says:** "This is where the real complexity lives. Odoo Community Edition has no REST API. We use JSON-RPC with session-based authentication. Every call requires a database name, a user ID, and a password. Creating an invoice requires nested array syntax — `[0, 0, {...}]` means 'create new relation record.'"

> **Presenter says:** "The invoice starts in `draft`. We must explicitly call `action_post` to validate it. Without this, the invoice can't be paid. And because Odoo has no webhooks, we poll every 5 minutes to detect payment status changes."

> **Presenter says:** "Notice the deduplication check: if the same ticket is resolved twice, we don't create a duplicate invoice. The LiteDB state machine tracks every processed ticket."

### Verification

```bash
# Check LiteDB state
docker exec garamatic_demo_odoo cat /app/data/seeded_state.db

# Or via the bridge API
curl http://localhost:8089/health

# Check Odoo Bridge processed the event
docker compose -f demo/docker-compose.yml logs odoo-integration | grep "invoice created"
```

---

## Step 8: Invoice Email — Closing the Loop

**Time:** 1 min
**What to show:** Mailhog → invoice email + agentic service logs

### Demo

1. **Mailhog:** `http://localhost:8025` — refresh, see `New Invoice #...` email
2. **Agentic Logs:** `docker compose logs agentic-service | grep "invoice.created"`

### What Happens

- `invoice.created` event fans out to `agentic_consumer` and `mailing.queue`
- **Agentic Service** renders `_invoice_created_template` → sends email
- **Mailing Service** also receives and processes the event
- Customer now has an invoice in Odoo + an email in their inbox

> **Presenter says:** "The invoice.created event triggers both the agentic service and the mailing service. The customer now has an invoice in Odoo and an email notification. The loop is almost closed — we just need to detect payment."

### Verification

```bash
# Check Mailhog for invoice email
curl http://localhost:8025/api/v2/messages | jq '.items[] | {subject: .Content.Headers.Subject[0]}'
```

---

## Step 9: (Bonus) Payment Detection — Polling + Thank-You Email

**Time:** 2 min
**What to show:** Manual payment in Odoo → poller detects → `payment.received` → thank-you email

### Demo

1. In **Odoo**, open the invoice → click **Register Payment**
2. Select payment method, confirm
3. **Odoo Bridge Logs:** Watch for:
   ```
   Invoice 1234 status changed from posted to paid
   Published payment.received for invoice 1234
   ```
4. **Mailhog:** Refresh — see `Payment Received — Thank You` email

### What Happens

- `InvoiceStatusPoller` (runs every 5 minutes) queries Odoo for invoice status
- Detects change from `posted` → `paid`
- Publishes `payment.received` event
- **Agentic Service** consumes → sends thank-you email

> **Presenter says:** "Odoo doesn't tell us when payment happens. We poll every 5 minutes. When the status changes, the bridge publishes `payment.received`. The agentic service sends a thank-you email — closing the loop."

### Verification

```bash
# Check poller logs
docker compose -f demo/docker-compose.yml logs odoo-integration | grep "payment.received"

# Check thank-you email in Mailhog
curl http://localhost:8025/api/v2/messages | jq '.count'
```

---

## Architecture Patterns Summarized

| Pattern | Where | Why It Matters |
|---------|-------|--------------|
| **Outbox Pattern** | Ticket Masala | Atomic event publishing — events survive crashes |
| **Event-Driven** | RabbitMQ | Services are decoupled — no direct HTTP calls |
| **Circuit Breaker** | Odoo Bridge | Prevents cascade failure when Odoo is down |
| **Polling** | InvoiceStatusPoller | Odoo has no webhooks — required for payment detection |
| **JSON-RPC** | Odoo Client | Odoo CE has no REST API — legacy integration pattern |
| **MCP** | Agentic Service | AI agents can directly call business tools |
| **Template Registry** | NotificationComposer | Clean separation of event types from rendering |
| **LiteDB State** | Odoo Bridge | Tracks processed tickets — prevents duplicate invoices |

---

## Quick Reset (Between Demos)

```bash
cd /home/juan/Projects/garamatic
docker compose -f demo/docker-compose.yml down -v
docker compose -f demo/docker-compose.yml up --build -d

# Verify health
docker compose -f demo/docker-compose.yml ps
```

---

## Quick Demo Cheat Sheet

```bash
# Create ticket via API (fast path for demo)
curl -X POST http://localhost:8085/api/portal/submit \
  -F "CustomerName=Alice Johnson" \
  -F "CustomerEmail=alice@example.com" \
  -F "Description=Loud construction noise" \
  -F "WorkItemType=NUISANCE" \
  -F "PriorityScore=10" \
  -F "Tenant=desgoffe"

# Resolve ticket via API
curl -X POST http://localhost:8085/api/tickets/{id}/resolve \
  -H "Content-Type: application/json" \
  -d '{"resolution_notes":"Fixed","billable_amount":150}'

# Get customer context via Agentic
curl http://localhost:3001/customers/alice@example.com/context

# Check RabbitMQ queues
curl -u guest:guest http://localhost:15672/api/queues | jq '.[].name'

# Check Mailhog messages
curl http://localhost:8025/api/v2/messages | jq '.count'

# Check Odoo Bridge health
curl http://localhost:8089/health

# Watch all service logs
docker compose -f demo/docker-compose.yml logs -f
```

---

## Demo Tips for Presenters

### Timing the Demo

| Section | Target Time | Notes |
|---------|-------------|-------|
| Setup & intro | 2 min | `docker compose up`, verify health |
| Step 1: Portal submission | 1 min | Fill form, submit, show success |
| Step 2: RabbitMQ | 2 min | Show exchange, bindings, fan-out |
| Step 3: MCP + AI Chat | 3 min | **The wow moment** — open chat from ticket detail |
| Step 4: Mailing Service | 1 min | Quick log check |
| Step 5: Assignment | 2 min | Show GERDA insights, assign |
| Step 6: Resolution | 2 min | Resolve with billable amount |
| Step 7: Odoo Bridge | 4 min | The complex part — take your time |
| Step 8: Invoice Email | 1 min | Quick Mailhog check |
| Step 9: Payment (bonus) | 2 min | If time allows |
| **Total** | **~18 min** | Leave buffer for questions |

### The "Wow" Moments

1. **MCP Chat in Ticket Masala** — Open the AI chat from a ticket detail page. The agent already knows which ticket you're looking at. Ask it to create an invoice. This is the most impressive demo feature.

2. **RabbitMQ Fan-Out** — Show one message published to three queues simultaneously. This is the architectural proof.

3. **Odoo JSON-RPC** — Show the actual `[0, 0, {...}]` syntax in the logs. This proves the complexity of the integration.

### Common Pitfalls

- **Don't demo GERDA dispatch** — It's cool but takes too long. The AI chat replaces it as the AI demo.
- **Don't type prompts manually** — Use the quick action buttons for the AI chat. It looks more polished.
- **Don't wait for the 5-minute poller** — If you need the payment detection, manually trigger it or skip it.
- **Do have a pre-seeded ticket** — Create a ticket before the demo starts so you can jump straight to the chat.

### Pre-Demo Checklist

- [ ] `docker compose up` is running
- [ ] All services show healthy
- [ ] RabbitMQ dashboard loads at `localhost:15672`
- [ ] Mailhog has at least one test email
- [ ] Odoo loads at `localhost:8069` (admin/admin)
- [ ] Ticket Masala has a pre-created ticket for the chat demo
- [ ] `OPENAI_API_KEY` is set (or accept the graceful error)

---

## Troubleshooting

| Symptom | Likely Cause | Fix |
|---------|-------------|-----|
| No email in Mailhog | Agentic service not consuming | Check `docker compose logs agentic-service` |
| No invoice in Odoo | Odoo Bridge not processing | Check LiteDB state, Odoo auth |
| RabbitMQ queue empty | OutboxPublisher not running | Check `docker compose logs ticket-masala` |
| Odoo login fails | Odoo not initialized | Wait for `odoo-db` to be healthy, then restart Odoo container |
| Showcase 404 | Nginx not serving | Check `docker compose logs showcase` |
| AI Chat says "unavailable" | OPENAI_API_KEY not set | Export the key or add to .env |
