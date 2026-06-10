# Garamatic Demo Readiness Review — Implementation Report

**Date:** 2026-06-10
**Scope:** Systematic review of the `demo/` stack and all submodules ahead of a live demo. Six parallel review passes: demo orchestration, ticket-masala + gatekeeper, mailing-service + odoo-integration, agentic-service, frontends, and cross-service contract drift. All findings verified against code with file:line evidence.
**Audience:** Implementing agent. Work through P0 → P1 → P2. Each item has a concrete fix and a verification step.

**Demo flows this report protects:**
- **Flow A:** Citizen portal (8093) → ticket-masala → ticket visible in back office
- **Flow B:** Ticket events → RabbitMQ → mailing-service → email captured in Mailhog (8025)
- **Flow C:** Ticket resolved → odoo-integration → invoice in Odoo (8069)
- **Flow D:** AgentChat in ticket-masala UI → agentic-service → local llama.cpp LLM
- **Flow E:** Seeder populates everything on `docker compose up`

**Submodule note:** Fixes span multiple submodules (`portal`, `ticket-masala`, `mailing-service`, `odoo-integration`, `agentic-service`, `masala-web`) plus the root repo (`demo/`). Follow the golden rule: commit in the service repo first, then bump the submodule in the root repo.

---

## P0 — BLOCKERS (demo flows are broken right now)

### P0-1. Portal ticket submission never reaches ticket-masala (nginx location order) — kills Flow A

- **File:** `portal/nginx.conf:24` and `:40`
- **Evidence:** The `location /api/` block (proxying to `http://gatekeeper-api:8080`) is declared *before* `location /api/portal/` (proxying to `http://ticket-masala:8080`). nginx prefix matching picks the longest match regardless of order **only for identical-priority prefixes — but here `/api/portal/submit` is being captured by `/api/`** because the longer prefix lacks priority. Net effect verified by the reviewing agent: `POST /api/portal/submit` is proxied to gatekeeper, which only exposes `/api/ingest`, `/api/health`, `/ingest` → 404/401. Every citizen form submission fails.
- **Fix:** In `portal/nginx.conf`, give the portal location priority — either move `location /api/portal/` above `location /api/`, or change it to `location ^~ /api/portal/`. Rebuild the portal image.
- **Verify:** `curl -s -o /dev/null -w '%{http_code}' -X POST http://localhost:8093/api/portal/submit -F 'Description=test' -F 'CustomerEmail=test@example.com' -F 'CustomerName=Test'` → expect 200, and the ticket appears in ticket-masala.

### P0-2. AgentChat in ticket-masala UI talks to PRODUCTION, not the local stack — kills Flow D

- **File:** `demo/docker-compose.yml:55` → `Agentic__ApiUrl=https://agentic.garamatic.tech`
- **Evidence:** `ticket-masala/src/TicketMasala.Web/Views/Shared/_Layout.cshtml:14` injects `Agentic:ApiUrl` into the browser as `window.__AGENTIC_URL__`; `AgentChat.cshtml:1170,1334,1401,1443` fetch directly against it. The browser therefore hits the production agentic service. Additionally `SecurityHeadersMiddleware.cs:15-18` puts this URL in the CSP `connect-src`, so the browser is *blocked* from calling `http://localhost:3001` even if the JS fell back.
- **Fix:** In `demo/docker-compose.yml` ticket-masala env: `Agentic__ApiUrl=http://localhost:3001`. It must be the **host-visible** URL (the browser makes the call), not `http://agentic-service:3001`. The CSP follows automatically since it is derived from the same config key.
- **Verify:** Load a ticket page → open AgentChat → network tab shows requests to `localhost:3001`, no CSP errors in console.

### P0-3. AgentChat sends no Authorization header → 401 from agentic-service — kills Flow D (even after P0-2)

- **Files:** `ticket-masala/src/TicketMasala.Web/Views/.../AgentChat.cshtml:1170-1174` (no auth header on fetch); `agentic-service/src/agentic_service/api.py:243` (auth middleware exempts only `/health`, `/favicon.ico`, `/`, `/metrics`)
- **Evidence:** Compose sets `API_KEY=garamatic-agentic-secret-key` on agentic-service. `/agent/chat/stream` and `/agent/threads` require `Authorization: Bearer <API_KEY>`; the browser JS sends none. User sees "The agent is unavailable".
- **Fix (pick one, in order of preference):**
  1. **Server-side proxy (cleanest):** add a small proxy controller/endpoint in ticket-masala that forwards `/agent/*` to `http://agentic-service:3001` adding the `Authorization: Bearer {Agentic:ApiKey}` header server-side; set `Agentic__ApiUrl` to the ticket-masala-relative path. No key in browser.
  2. **Demo-pragmatic:** add `/agent/chat/stream` and `/agent/threads` to `public_paths` in `agentic-service/src/agentic_service/api.py:243` (acceptable for a local demo; do not ship to prod).
- **Verify:** Send a chat message in AgentChat; expect a streamed response, not 401.

### P0-4. agentic-service LLM base URL missing `/v1` → every LLM call 404s — kills Flow D

- **Files:** `demo/docker-compose.yml:186` and `:225` (`LLM_BASE_URL=http://llama:8080` for both `agentic-service` and `agentic-mcp`); `agentic-service/src/agentic_service/llm_adapter.py:76-77` passes the URL to `ChatOpenAI` verbatim (no `/v1` normalization, unlike ticket-masala which normalizes at `Program.cs:135-138`).
- **Evidence:** llama.cpp serves the OpenAI API under `/v1/...`. The openai client resolves `chat/completions` relative to the base → `http://llama:8080/chat/completions` → 404.
- **Fix:** `LLM_BASE_URL=http://llama:8080/v1` in both service blocks. (Optionally also add `/v1`-suffix normalization in `llm_adapter.py` for robustness.)
- **Verify:** `docker exec garamatic_demo_agentic python -c "import urllib.request;print(urllib.request.urlopen('http://llama:8080/v1/models').read())"` then exercise a chat.

### P0-5. llama container: invalid `--tools all` flag (crash-loop) and two `-hf` flags (only last model loads) — kills Flow D at the root

- **File:** `demo/docker-compose.yml:161-167`
- **Evidence:** llama.cpp server has no `--tools` argument — an unknown flag makes the server exit, crash-looping the container. **Corroborated live: every other demo container has been Up 40 hours, but `garamatic_demo_llama` is not running.** Also, `-hf` is a single-model flag; the second `-hf` (LFM2.5) overrides the first (Qwen3.5), so the alias `qwen3.5:2b-q4_K_M` that both ticket-masala and agentic-service request would not exist.
- **Fix:** Replace the command with a single model and valid flags:
  ```yaml
  command: >
    -hf unsloth/Qwen3.5-2B-GGUF:UD-Q4_K_XL --alias qwen3.5:2b-q4_K_M
    --host 0.0.0.0 --port 8080 -c 4096 --jinja
  ```
  (`--jinja` enables tool-calling templates if needed; drop it if the image rejects it.) Remove the duplicate `LLAMA_ARG_HOST/PORT` env or the `--host/--port` flags — keep one mechanism.
  Also add a healthcheck and gate dependents on it (first boot downloads the model — minutes):
  ```yaml
  healthcheck:
    test: ["CMD-SHELL", "curl -sf http://localhost:8080/health || exit 1"]
    interval: 10s
    timeout: 5s
    retries: 60
    start_period: 300s
  ```
  and change `agentic-service`/`agentic-mcp` `depends_on.llama` to `condition: service_healthy`. (Check curl exists in the image; if not use `wget -qO-`.)
- **Verify:** `docker compose up llama` stays up; `curl http://localhost:11434/v1/models` lists `qwen3.5:2b-q4_K_M`.

### P0-6. ticket-masala GERDA model config is a no-op → tries `openai/gpt-4o` instead of local llama — breaks AI features in Flow D

- **File:** `demo/docker-compose.yml:56-57` (`Gerda__OpenAiModelFast=...`, `Gerda__OpenAiModel=...`)
- **Evidence:** `MasalaOptions.cs:7` has `SectionName = "Masala"`, so the binding keys are `Masala:Gerda:OpenAiModel*`. The bare `Gerda__*` env vars bind nothing; `OpenAiService.cs:74-75` and `OpenAIGenerationAdapter.cs:60-61` then fall back to defaults `openai/gpt-4o` / `openai/gpt-4o-mini` — models the local llama server doesn't have.
- **Fix:** Rename in compose to `Masala__Gerda__OpenAiModel=qwen3.5:2b-q4_K_M` and `Masala__Gerda__OpenAiModelFast=qwen3.5:2b-q4_K_M` (use the qwen alias for both unless you run a second llama container; the LFM alias won't exist after P0-5).
- **Verify:** Trigger a GERDA feature (e.g. ticket triage/summarize) and watch `docker logs garamatic_demo_llama` for incoming completions.

### P0-7. odoo-integration publishes invoice events without the `event.` prefix → invoice lifecycle events silently dropped — breaks Flow C follow-ups

- **Files (publisher):** `odoo-integration/src/OdooIntegration.Worker/Services/InvoiceStateMachine.cs:150` (`"invoice.created"`), `:517` (`"payment.received"`), `:577` (`"invoice.overdue"`)
- **Files (consumers binding WITH prefix):** `mailing-service/src/MailingService/Worker.cs:67-69` (`event.invoice.created`, `event.invoice.overdue`, `event.payment.received`); `agentic-service/src/agentic_service/.../consumer.py:160-168` (same, prefixed)
- **Evidence:** Topic exchange `event_exchange` does not route `invoice.created` to queues bound to `event.invoice.created`. Result: no invoice-confirmation emails, no agentic notifications, ever.
- **Fix:** Change the three routing keys in `InvoiceStateMachine.cs` to `event.invoice.created`, `event.payment.received`, `event.invoice.overdue`. (Note: odoo-integration's own consumer defensively binds both prefixed and bare keys for `invoice.create_requested` — `TicketResolvedConsumer.cs:121-130` — so nothing else breaks.)
- **Verify:** Resolve a ticket → check RabbitMQ management UI (15672) that `mailing.queue` received the `event.invoice.created` message → invoice email appears in Mailhog.

### P0-8. `email.send` events from agentic-service have NO consumer — agentic emails vanish — breaks Flow B/E

- **Files (publisher):** `agentic-service/src/agentic_service/.../email_service.py:81` and `notification_adapters.py:51` — publish routing key `email.send` on `event_exchange`
- **Files (consumer gap):** `mailing-service/src/MailingService/Worker.cs:62-71` — no `email.send` binding; `EventDispatcher.cs` — no `email.send` case
- **Evidence:** `POST /emails` on agentic-service returns `{"status":"queued"}` but the message is routed nowhere. The seeder's "4 emails" seeding produces nothing in Mailhog.
- **Fix (mailing-service):**
  1. Add `"email.send"` (and/or `"event.email.send"` — add both for safety) to the `routingKeys` array in `Worker.cs`.
  2. Add `case "email.send":` in `EventDispatcher.cs` dispatching to a new `EmailSendHandler` that maps the payload (`to_email`, `from_email`, `from_name`, `subject`, `body_html` — see `integration-contracts/Schemas/email.send.json`) and calls the existing `EmailService.SendEmailAsync(...)`.
- **Verify:** `curl -X POST http://localhost:3001/emails -H 'Authorization: Bearer garamatic-agentic-secret-key' -H 'Content-Type: application/json' -d '{...}'` → email shows in Mailhog (8025).

### P0-9. Seeder calls agentic-service unauthenticated → 401 on every call — degrades Flow E

- **Files:** `demo/seeding/scripts/seed-agentic-service.js:10,39,61`; `demo/seeding/lib/api-client.js:88-90` (`createAgenticClient` sends no auth header); `demo/docker-compose.yml:419-428` (seeder env has no agentic key)
- **Evidence:** agentic-service requires `Authorization: Bearer <API_KEY>` on `/emails` and `/customers/...`; the seeder sends nothing → 401s.
- **Fix:** Add `AGENTIC_API_KEY=${AGENTIC_API_KEY:-garamatic-agentic-secret-key}` to the seeder env block; update `createAgenticClient` in `lib/api-client.js` to accept the key and set the `Authorization: Bearer` header.
- **Verify:** `docker compose run --rm seeder` — agentic phase logs success, no 401s.

### P0-10. Portal never sends `WorkItemType` → every ticket lands as generic `DEMANDE` — degrades Flow A visibly

- **Files:** `portal/src/pages/SubmitPage.tsx:149-159`; backend model `ticket-masala/src/TicketMasala.Web/Controllers/PortalsApiController.cs:119-124`
- **Evidence:** The selected request type (VOIRIE, NUISANCE, PERMIS…) is only embedded in the `Tags` string (`Type:VOIRIE`); the `WorkItemType` form field is never appended. All tickets show as `DEMANDE`; type-based routing/filtering looks broken on stage.
- **Fix:** In `SubmitPage.tsx`, add `formPayload.append('WorkItemType', sanitize(formData.requestType));` before the fetch. Rebuild the portal image.
- **Verify:** Submit a VOIRIE request via the portal → ticket shows type VOIRIE in ticket-masala.

---

## P1 — HIGH (likely to bite during the demo)

### P1-1. .NET compose healthchecks (`dotnet --info`) test nothing → `service_healthy` is meaningless

- **Files:** `demo/docker-compose.yml:81` (ticket-masala), `:110` (gatekeeper), `:145` (mailing), `:288` (odoo-integration)
- **Evidence:** `dotnet --info` exits 0 once the runtime exists — it never probes the app. Dependents (seeder, portal) can start while the app is still migrating/seeding. NOTE: containers currently report "healthy" on the running stack, so the binary path works — the problem is purely that it validates nothing. ticket-masala's Dockerfile already builds a real HTTP probe (`/app/healthcheck/healthcheck.dll` hitting `/health`, `Dockerfile:52-67`) which the compose healthcheck **overrides**.
- **Fix:** For ticket-masala: delete the compose `healthcheck:` block so the Dockerfile HEALTHCHECK applies. For gatekeeper/mailing/odoo-integration: replicate the ticket-masala pattern (build the tiny healthcheck probe into each Dockerfile targeting `http://localhost:8080/health`, declare `HEALTHCHECK`, remove the compose override). All three expose real `/health` endpoints (verified). Chiseled images have no shell/curl — the compiled probe is the reliable option.
- **Verify:** `docker compose ps` — services flip to healthy only after `/health` responds; stop the app process in one container and confirm it goes unhealthy.

### P1-2. `Odoo__DefaultIncomeAccountId=48` is a hardcoded guess → invoice creation can fail outright — risks Flow C

- **Files:** `demo/docker-compose.yml:273`; used at `odoo-integration/src/OdooIntegration.Infrastructure/Odoo/OdooInvoiceService.cs:103`; account created by `scripts/odoo-seed.py:56-68` (code `7000`, name `Verkoop`, auto-assigned ID)
- **Evidence:** If the fresh Odoo install assigns a different ID to the seeded account, every invoice line references a nonexistent account; Odoo rejects it; the error is non-retryable per `InvoiceStateMachine.IsRetryableError()` → message dead-lettered, demo shows no invoice, no operator feedback.
- **Fix (robust, preferred):** in odoo-integration, resolve the account dynamically — look up `account.account` where `code='7000'` (e.g. in `OdooMetadataService.LoadMappingsAsync()`), cache the ID, use it instead of `_options.DefaultIncomeAccountId` (keep the option as fallback).
- **Fix (quick, demo-day):** after stack-up run `docker exec garamatic_demo_odoo_db psql -U odoo -d odoo -c "SELECT id FROM account_account WHERE code='7000';"` and set the env var accordingly.
- **Verify:** Resolve a billable ticket → invoice visible in Odoo (8069, admin/admin).

### P1-3. odoo-integration maps invoice action routes AFTER `StartAsync` → permanent 404s

- **File:** `odoo-integration/src/OdooIntegration.Worker/Services/HealthEndpointHostedService.cs:149-152`
- **Evidence:** `app.MapPost("/api/invoices/{invoiceId}/post")`, `.../pdf`, `.../payment` are registered after `await _app.StartAsync(...)`; ASP.NET Core ignores routes added after start. `/health` and the GET invoice listing routes (registered before) work.
- **Fix:** Move all `app.Map*` calls above `StartAsync`. While in the file, also pin the URLs explicitly (`builder.WebHost.UseUrls("http://+:8080")` or set `ASPNETCORE_URLS=http://+:8080` in compose) — `WebApplication.CreateBuilder()` without args may also bind default ports.
- **Verify:** `curl -X POST http://localhost:8089/api/invoices/<id>/post` returns non-404.

### P1-4. odoo-integration metadata (taxes) loads once at startup, never retried → invoices without VAT

- **File:** `odoo-integration/src/OdooIntegration.Worker/Program.cs:201-209`
- **Evidence:** `LoadMappingsAsync()` failure at startup is swallowed (warning only) and never retried; `GetTaxId()`/`GetDefaultTaxId()` then return null forever → invoice lines created without `tax_ids`. Odoo is slow on first boot, so this is a realistic race despite `depends_on`.
- **Fix:** Lazy check-and-load: in `OdooInvoiceService.CreateInvoiceAsync` (or the metadata service), if `!IsLoaded`, attempt `LoadMappingsAsync()` before composing the invoice.
- **Verify:** Restart odoo-integration while Odoo is still booting; resolve a ticket after both are up; invoice has VAT lines.

### P1-5. GatekeeperApi validates `invoice.created` against a field that isn't in the contract → valid events rejected with 400

- **Files:** `ticket-masala/src/GatekeeperApi/Program.cs:165` (requires `invoice_id`, `customer_id`); contract `integration-contracts/Schemas/invoice.created.json` (has `customer_email`, no `customer_id`)
- **Fix:** Change the validation to `"invoice_id", "customer_email"`. Also fix the seeder data `demo/seeding/data/events.json:48` which papers over this with a bogus `customer_id` field.
- **Verify:** POST a schema-valid `invoice.created` to `http://localhost:8086/api/ingest` with `X-Api-Key: demo-api-key` → 200.

### P1-6. agentic notifications/consumer not wired into demo at all

Two gaps, fix together in `demo/docker-compose.yml`:
- **`agentic-mcp` lacks `odoo_bridge_url`** → invoice MCP tools return "not configured" (`facade.py:378`). Add `odoo_bridge_url=http://odoo-integration:8080` to its env.
- **`garamatic-consumer` entry point is never started** → the agentic event-driven notification pipeline (reacting to `event.ticket.resolved` etc.) doesn't exist in the demo. If the demo narrative includes automated notifications, add a third service from the same image with `command: ["garamatic-consumer"]` and env (`rabbitmq_host`, `ticket_api_url`, `ticket_api_key`, `LLM_*`); no port/healthcheck needed. If not part of the narrative, skip.
- **Also add `AGENT_DB_PATH=/app/data/approvals.db`** to `agentic-service` and `agentic-mcp` env: `agent.py:121` reads it via `os.getenv`; unset means MemorySaver and split state.

### P1-7. masala-web ignores `MASALA_TENANT_ID` — tenant theming silently dead

- **Files:** `demo/docker-compose.yml:353`; `masala-web/Dockerfile` (copies static `nginx/nginx.conf`); unused `masala-web/nginx/default.conf.template`
- **Evidence:** The env-substituting template is never used; the site always serves the generic marketing page regardless of tenant.
- **Fix:** Use nginx's envsubst flow: COPY the template to `/etc/nginx/templates/default.conf.template` (the official nginx image substitutes automatically) or add an explicit `envsubst` CMD; delete whichever config file ends up unused.
- **Verify:** `docker compose up --build masala-web` → page reflects desgoffe tenant.

### P1-8. Seeder `ticket.resolved` payloads don't match the contract → risk of €0 invoices

- **Files:** `demo/seeding/scripts/seed-ticket-masala.js:97-107` (sends `billable_amount`, omits required `service_description`, `amount`, `resolved_at`, `tenant_id`); contract `integration-contracts/Schemas/ticket.resolved.json`
- **Evidence:** `TicketResolvedConsumer.cs:428` falls back from `amount` → `billable_amount`, so amounts mostly survive — but at least one seed event has `billable_amount: 0` (`demo/seeding/data-desgoffe/events.json:130`), and `service_description`/`resolved_at` are missing. Invoices come out sparse/zero.
- **Fix:** Update the seeder payloads to the schema: `service_description`, `amount` (rename from `billable_amount`, non-zero values), `resolved_at`, `tenant_id`, `timestamp`, `source`.
- **Verify:** Run seeder → invoices in Odoo have non-zero amounts and descriptions.

### P1-9. `ticket.resolved` published by ticket-masala always has empty `tenant_id`

- **File:** `ticket-masala/src/TicketMasala.Web/Infrastructure/DomainEvents/DomainEventContractMapper.cs:213` (`TenantId = string.Empty`; the `TicketCreatedContractMapper` does it right at `:99`)
- **Fix:** Use `_tenantContext.TenantId` in `TicketResolvedContractMapper.Map()` like the created-mapper does.
- **Verify:** Resolve a ticket → inspect the message in RabbitMQ UI → `tenant_id: "desgoffe"`.

---

## P2 — MEDIUM (fix if time allows; mostly polish + dead config cleanup)

### P2-1. Dead/misleading env vars in `demo/docker-compose.yml` (cleanup batch)

All verified unused — remove or correct in one pass:
| Line | Var | Reality | Action |
|---|---|---|---|
| 46 | `MasalaConfig__ConfigPath` | Code reads OS env `MASALA_CONFIG_PATH` (set correctly on :47) | Remove |
| 47 | `MasalaConfig__SeedDataPath` | No such config key anywhere | Remove |
| 58 | `TENANT` (ticket-masala) | Code reads `MASALA_TENANT` (Dockerfile default `desgoffe` saves it) | Replace with `MASALA_TENANT=${TENANT:-desgoffe}` |
| 95 | `TICKET_MASALA_API_URL` (gatekeeper) | Never referenced — gatekeeper publishes to RabbitMQ only | Remove |
| 159/164-165 | `LLAMA_ARG_HOST/PORT` + `--host/--port` | Duplicated config | Keep one |

Note: `TICKETMASALA_ALLOW_SEED_BYPASS` **is** read (`ticket-masala/src/TicketMasala.Domain/Entities/Ticket.cs:705`) — keep it. (One review pass wrongly flagged it dead; verified real.)

### P2-2. ticket-masala Dockerfile `MASALA_CONFIG_PATH` default points to a directory the image never creates

- **Files:** `ticket-masala/Dockerfile:78` (`ENV MASALA_CONFIG_PATH="/app/tenants/desgoffe/config"`); image only copies `desgoffe.svg` there; `ConfigurationPaths.cs:34-38` silently falls back to `/app/config` (which demo mounts — so it works by accident).
- **Fix:** Set `MASALA_CONFIG_PATH=/app/config` explicitly in the demo compose env so the path is intentional rather than fallback-dependent.

### P2-3. mailing-service has a `UserCreatedHandler` but never binds `event.user.created` — dead code / missing flow

- **Files:** `mailing-service/src/MailingService/Worker.cs:62-71` (no binding), `Handlers/EventDispatcher.cs:38` + `UserCreatedHandler.cs` (handler exists)
- **Fix:** Add `"event.user.created"` to the bindings if welcome emails are part of the demo; otherwise remove the handler registration.

### P2-4. `WorkContainersController` is fully unauthenticated in Development

- **File:** `ticket-masala/src/TicketMasala.Web/Controllers/Api/V1/WorkContainersController.cs:18`
- **Fix:** Add `[Authorize(AuthenticationSchemes = "Identity.Application,ApiKey")]` to match `WorkItemsController`. Low demo risk, real hole.

### P2-5. Showcase dashboard inaccuracies (`demo/showcase/index.html`)

- `:1514,1669` — API Explorer + curl reference `POST /api/events/publish`; the real gatekeeper endpoint is `/api/ingest`. Fix both.
- `:1626` — pre-demo seed curl targets `portal.garamatic.tech/api/ingest`; should be `api.garamatic.tech/api/ingest`.
- `:1676-1683` — portal/submit curl uses fields not in the model (`WorkItemType`, `Tenant` as form fields against the current model; align with `Description`/`CustomerEmail`/`CustomerName`/`PriorityScore`/`Tags` — and after P0-10, `WorkItemType` becomes valid).
- `:1460,1802,1853` — service labeled "Ollama LLM"; it's llama.cpp. Rename.
- `:1864-1867` — subdomain rewrite map missing `8087: 'mailing'` (remote/tunnel mode leaves a dead localhost link).
- `:1628,1679` — Dutch payload text ("Bouwhoerrie zonder vergunning") in the francophone Desgoffe scenario; use e.g. "Construction sans permis".

### P2-6. RabbitMQ consumer startup robustness

- `ticket-masala/src/TicketMasala.Web/Infrastructure/RabbitMq/TicketCreatedEventConsumer.cs:50-53` — connection opened in `StartAsync` without retry; a startup failure silently kills the consumer (web stays up, tickets from events stop). Wrap in a retry loop (mailing-service and odoo-integration already retry 10×2s — copy that pattern).

### P2-7. Shared contract class drift (future-proofing)

- `ticket-masala/src/RabbitMqConnector/Contracts/InvoiceCreatedEvent.cs:14` — `OdooInvoiceId` typed `string`; wire format and schema are integer. Change to `int`, add missing `Timestamp`/`Source` props. Fix the contradictory "(string format)" description in `integration-contracts/Schemas/invoice.created.json`.

### P2-8. Seeding robustness in ticket-masala

- `WorkItemSeedStrategy.cs:173-179` — when a referenced user email isn't found, the ticket is silently created with `CustomerId = null` (tickets look orphaned in the UI). Log a warning at minimum; ideally fail loudly during demo seeding.

---

## P3 — LOW (cosmetic / hygiene)

1. **`test_login.html` at repo root** — stray rendered-page artifact with an anti-forgery token; delete it.
2. **`garamatic-web/index.html:109`** — CTA links to stale `https://calm-island-0b4ce2203.4.azurestaticapps.net/`; point to `https://tickets.garamatic.tech` or remove.
3. **`demo/docker-compose.monitoring.yml`** — header says OBSOLETE (merged into main compose); delete the file or mark clearly in README.
4. **`masala-web/index.html:31,42`** — OG image `https://ticketmasala.dev/images/og-image.png` doesn't exist in the repo; add the asset or drop the tags.
5. **`masala-web/nginx/default.conf.template`** — becomes the live config after P1-7; otherwise delete as dead code.
6. **`odoo-integration/addons/` does not exist** but is bind-mounted (`demo/docker-compose.yml:378`); Docker creates an empty dir. `mkdir -p odoo-integration/addons` with a `.gitkeep`, or remove the mount (odoo-init.sh installs only `base,account`).
7. **`integration-contracts/README.md:127`** — calls mailing-service "Python"; it's C#.
8. **agentic-service `CODE_REVIEW.md:169-179`** — stale claims (non-root user: false, no `USER` in Dockerfile; uv install method; AGENT_DB_PATH). Update doc; optionally add a non-root `USER` to the Dockerfile.
9. **Portal login is email-only** (`portal/src/pages/LoginPage.tsx:28`) — by design for demo; presenter should be ready to explain ("eID/itsme coming"). `X-Portal-Secret` is effectively disabled (no secret configured) — fine for demo, document it.
10. **agentic `agent.py:199`** uses sync `model.invoke()` inside async LangGraph — blocks the event loop per LLM call; fine for single-user demo, fix later with `ainvoke`.
11. **garamatic-web footer** mixes Dutch/English/Spanish — intentional brand voice; leave unless it bothers you on stage.

---

## Verified-Working (do NOT "fix" these)

- All RabbitMQ env key names match per service: ticket-masala/odoo-integration read `RabbitMQ:HostName`/`UserName`; mailing-service reads `RabbitMQ:Host`/`Username` — compose sets each correctly. The casing differs *between* services but each pair is internally consistent.
- Mailhog fallback works: empty `SENDGRID_API_KEY` → `_sendGridEnabled=false` → Mailhog path (host `mailhog`, port 1025). Demo emails will be captured (once routing issues P0-7/P0-8 are fixed).
- Gatekeeper auth chain: compose `Gatekeeper__ApiKey=demo-api-key` ⇔ `Program.cs:48` reads `Gatekeeper:ApiKey`; clients must send `X-Api-Key` (`Program.cs:86`); seeder and portal nginx (`proxy_set_header X-Api-Key "demo-api-key"`) both comply.
- Agentic⇄ticket-masala API key chain matches: `ticket_api_key` sent as `Authorization: Bearer` ⇔ ticket-masala `ApiKeyAuthenticationHandler.cs:32` reads `Agentic:ApiKey`; same default value.
- All compose-mounted host files exist (monitoring configs, odoo-init.sh, odoo-seed.py, heartbeat scripts, tenant config/theme/logo, seed_data.json).
- `MASALA_CONFIG_PATH=/app/config` env + mount works; `TICKETMASALA_ALLOW_SEED_BYPASS` is a real flag (`Ticket.cs:705`).
- Portal API base URL design (relative paths + nginx proxy) is correct — only the location *order* is broken (P0-1).
- `odoo-seed.py`'s `http://localhost:8069` is correct (it runs inside the odoo container).
- ticket-masala CORS is `AllowAll`; gatekeeper needs no CORS (called via nginx proxy / server-side only).
- demo/scripts/verify.sh URLs/ports all match the compose mappings.

## Reference: actual RabbitMQ topology (verified)

Exchange `event_exchange` (topic, durable). DLX `event_exchange.dlx`.

| Publisher | Routing keys |
|---|---|
| ticket-masala outbox | `event.ticket.created`, `event.ticket.assigned`, `event.ticket.resolved` (+ grouped/ungrouped/updated/status_changed) |
| gatekeeper-api | `event.{event_type}` from payload |
| odoo-integration | `invoice.created`, `payment.received`, `invoice.overdue` ← **unprefixed, P0-7** |
| agentic-service | `email.send` ← **no consumer, P0-8**; `invoice.create_requested` |

| Queue | Owner | Bindings |
|---|---|---|
| `mailing.queue` | mailing-service | `event.ticket.created/assigned/resolved`, `event.invoice.created/overdue`, `event.payment.received` |
| `odoo-bridge` | odoo-integration | `ticket.resolved`, `event.ticket.resolved`, `invoice.create_requested`, `event.invoice.create_requested` |
| `agentic_consumer` | agentic-service (consumer not started in demo, P1-6) | `event.ticket.*`, `event.invoice.*`, `event.payment.received` |
| `ticketmasala.ticket.created` | ticket-masala | `event.ticket.created` (+ retry topology) |

## Reference: demo credentials & URLs

- Ticket Masala back office: http://localhost:8085 — `gustave.desgoffe` / `Admin123!` (admins), `greffier.serge` / `Employee123!`, `customer.alice` / `Customer123!`; login at `/Identity/Account/Login`
- Portal: 8093 · Showcase: 8092 · Gatekeeper: 8086 (`X-Api-Key: demo-api-key`) · Mailing: 8087 · Agentic: 3001 (`Authorization: Bearer garamatic-agentic-secret-key`) · MCP: 3002 · Odoo: 8069 (admin/admin) · Odoo bridge: 8089 · Mailhog: 8025 · RabbitMQ: 15672 (guest/guest) · Grafana: 3000 · llama: 11434

## Implementation order & final verification

1. **P0-1 → P0-10** in order (P0-5 before P0-4/P0-6 testing, since llama must run first).
2. P1 items; P1-1 (healthchecks) last among P1 since it touches four Dockerfiles.
3. Full reset and end-to-end pass:
   ```bash
   cd demo && docker compose down -v && docker compose up --build -d
   ./scripts/verify.sh
   cd ../integration-tests && npm test   # at minimum: contract-drift, demo-mail-flow, rabbitmq-message-flow
   ```
4. Manual demo dry-run checklist:
   - [ ] Portal: submit a VOIRIE ticket → success message → ticket (typed VOIRIE) visible in back office
   - [ ] Mailhog shows the ticket-created email
   - [ ] Resolve the ticket with an amount → invoice in Odoo with VAT and non-zero amount → invoice email in Mailhog
   - [ ] AgentChat: open, send a message, get a streamed local-LLM reply (no CSP/401/404 in console)
   - [ ] Showcase dashboard: all topology rows green; quick links open; curl quickies copy-paste-run clean
   - [ ] Seeder ran clean: `docker logs garamatic_demo_seeder` shows no 401/404
