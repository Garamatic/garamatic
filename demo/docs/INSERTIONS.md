# Insertions to Add to Colleagues' Document

> Use this file as a checklist. Add each insertion to the colleagues' `.docx` at the exact location indicated below, in this order.

---

## Insertion 1 — Team Overzicht

**Location:** After the cover page (after "Juan Benjumea Moreno — Wito De Schrijver — Maarten Görtz — Charlotte Schröer"), before the Index.

**Title:** `1. Team Overzicht` (or renumber if you keep their existing section numbers)

**Content:**

| Team Lid | Rol | Verantwoordelijkheden |
|----------|-----|----------------------|
| **Charlotte Schröer** | Frontend Architect | UI/UX design, Razor/HTMX views, tenant theming, CSS design system, responsive layouts |
| **Maarten Görtz** | Core Logic Developer | C# backend, Entity Framework, Identity management, ticket workflows, business rules engine |
| **Wito De Schrijver** | Security & Infrastructure | Docker containerization, CI/CD pipelines, Cloudflare tunnels, backups, security headers, RBAC |
| **Juan Benjumea** | Architecture & Integration | System architecture, GERDA AI engine, RabbitMQ event bus, multi-tenant design, API versioning, integration tests |

**Rationale:** Their docx lists the authors on the cover but does not break down roles and responsibilities. This is required for the academic jury.

---

## Insertion 2 — Opgeleverde Features (Basisvereisten + Extra's)

**Location:** After §2.5 Key Features (or as a new §3 if you want to keep it separate). It should come *after* the technical description of the system and *before* the integration chapters.

**Title:** `3. Opgeleverde Features`

**Content:**

### Core Functionaliteit (Basisvereisten)

| Feature | Status | Beschrijving |
|---------|--------|-------------|
| **User Management (CRUD)** | ✅ Volledig | ASP.NET Core Identity met registratie, login, 2FA, wachtwoord reset, external login, profielbeheer |
| **Ticket Systeem (CRUD)** | ✅ Volledig | Tickets aanmaken, bekijken, editen, verwijderen. Status workflow (Pending → In Progress → Completed/Rejected). Bulk operaties. |
| **Project Management (CRUD)** | ✅ Volledig | Projecten aanmaken, beheren, milestones, templates, project-ticket koppeling |
| **Customer Management (CRUD)** | ✅ Volledig | Klanten aanmaken, bewerken, verwijderen. Klant-ticket relatie. |
| **User Roles & RBAC** | ✅ Volledig | Admin, Employee, Customer rollen met granulaire permissies |
| **Dashboard** | ✅ Volledig | Team dashboard, manager capacity forecast, dispatch backlog |
| **Knowledge Base** | ✅ Volledig | CRUD voor kennisbank artikelen, zoeken, categorieën |
| **Notifications** | ✅ Volledig | In-app notificaties, email notificaties via SendGrid |
| **Search & Filtering** | ✅ Volledig | Full-text search (FTS5), opgeslagen filters, bulk acties |
| **File Attachments** | ✅ Volledig | Ticket bijlagen uploaden/downloaden |
| **Multi-language Support** | ✅ Volledig | EN/NL/FR localisatie met resx resources |
| **Import/Export** | ✅ Volledig | CSV import met field mapping, ticket generatie |
| **Portal (External)** | ✅ Volledig | Externe ticket submission zonder login (publiek toegankelijk) |

### Extra's (Onderscheiding → Uitmuntend)

| Feature | Status | Beschrijving |
|---------|--------|-------------|
| **Multi-Tenant Architectuur** | ✅ Volledig | 4 volledig geconfigureerde tenants (Desgoffe, Whitman, Liberty, Hennessey) met eigen theming, configuratie, database |
| **GERDA AI Engine** | ✅ Volledig | Heuristische inference engine: sentiment analyse, triage, complexity estimating, dispatching, ranking, grouping, knowledge retrieval, anticipation |
| **Event-Driven Architectuur** | ✅ Volledig | Outbox pattern, RabbitMQ publisher, domain events (ticket.created, ticket.assigned, ticket.resolved) |
| **Workflow Engine** | ✅ Volledig | Regel-gebaseerde workflows met RuleCompiler, TicketWorkflowPolicy, state machines |
| **API (REST + Versioning)** | ✅ Volledig | REST API met Swagger/OpenAPI, versiebeheer (v1 work-items/work-containers), deprecation headers |
| **Email Ingestion** | ✅ Volledig | IMAP email polling, email-to-ticket conversie, background queue |
| **Tenant Plugin System** | ✅ Volledig | Dynamische DLL loading per tenant, strategie injectie, custom business rules |
| **Metrics & Observability** | ✅ Volledig | Prometheus metrics, OpenTelemetry tracing, health checks, request logging middleware |
| **Security Hardening** | ✅ Volledig | Security headers middleware, correlation ID tracking, PII scrubbing, input sanitization, anti-forgery tokens |
| **Integration Testing** | ✅ Volledig | 267+ tests: unit tests, integratie tests, architecture tests, property-based tests (FsCheck), cross-service tests |

**Rationale:** Their docx describes the system technically but does not explicitly list what was delivered against the project requirements. The jury will look for this checklist.

---

## Insertion 3 — Niet Afgemaakte Features & Reden

**Location:** Immediately after Insertion 2 (Opgeleverde Features). This creates a clean "what we did vs. what we did not" pairing.

**Title:** `4. Niet Afgemaakte Features & Reden`

**Content:**

| Feature | Reden Niet Afgerond | Impact |
|---------|---------------------|--------|
| **End-to-End UI Tests (Playwright/Cypress)** | Tijdsgebrek — focus lag op backend testing en integratie tests. UI is volledig handmatig getest. | Testing score kan lager uitvallen; docenten moeten UI handmatig verifiëren. |
| **CD / Automated Deployment** | Geen toegang tot productie-infrastructuur (school VMs niet beschikbaar). CI draait wel volledig. | DevOps score kan lager uitvallen; alleen CI, geen CD. |
| **Backup & Restore Automatisatie** | SQLite is single-file; handmatige volume backups via Docker. Geen incrementele/differentiële backup strategie. | Infrastructuur score kan lager uitvallen. |
| **Central Logging Dashboard (ELK/Loki)** | Prometheus metrics zijn aanwezig, maar centrale log aggregatie (ELK stack, Grafana Loki) is niet geconfigureerd. Logs zijn console-only. | Errorhandling score kan lager uitvallen. |
| **Automatische Alerting bij Downtime** | Geen PagerDuty/Slack integratie. Health checks zijn aanwezig maar sturen geen alerts. | Errorhandling score kan lager uitvallen. |
| **Kubernetes / Swarm Orchestration** | Docker Compose wordt gebruikt. Kubernetes was buiten scope voor een studententeam van 4 personen. | Infrastructuur score kan lager uitvallen. |
| **Timesheets (volledige export)** | ClickUp data extractie niet voltooid. Zie TIMESHEETS.md voor gedeeltelijke data. | Administratief; kan geen punten aftrek veroorzaken als synthese document aanwezig is. |
| **ML.NET Model Training Pipeline** | ML.NET model (affinity scoring) is handmatig getraind. Automatische retraining pipeline is niet gebouwd. | GERDA werkt met fallback (NoOpAffinityScorer) als model ontbreekt. |
| **Real-time WebSocket Updates** | HTMX wordt gebruikt voor polling. SignalR/WebSocket voor real-time updates is niet geïmplementeerd. | UX impact minimaal; HTMX polls zijn voldoende voor ticket updates. |

**Rationale:** Shows academic honesty and self-assessment. The jury appreciates transparent scope management.

---

## Insertion 4 — CI/CD Pipeline Overzicht

**Location:** Inside their existing §6 "Testing & CI/CD", as a subsection. Add it *after* the introductory sentence about the pipeline and *before* any test count tables.

**Title:** `6.1 CI/CD Pipeline Overzicht`

**Content:**

| Pipeline | Trigger | Wat doet het? |
|----------|---------|---------------|
| **CI — Dev** (`ci-dev.yml`) | Push/PR naar `dev` | Lint, compose validatie, secret scan (TruffleHog) |
| **CI — Test/Acc** (`ci-test.yml`) | Push/PR naar `test`/`acc` | Full integration test suite, smoke tests, contract compliance |
| **CI — Production** (`ci-prod.yml`) | Push naar `main` | Full integration test suite, artifact upload |

> **Locatie:** `.github/workflows/`

**Rationale:** Their docx mentions GitHub Actions in the tech stack but gives no details about what the pipelines actually do.

---

## Insertion 5 — Test Overzicht

**Location:** Inside their existing §6 "Testing & CI/CD", as a subsection. Add it *after* Insertion 4 (CI/CD Pipeline Overzicht).

**Title:** `6.2 Test Overzicht`

**Content:**

| Test Type | Aantal | Status |
|-----------|--------|--------|
| **Unit Tests** | ~180 | ✅ Passing |
| **Integration Tests** | ~50 | ✅ Passing |
| **Architecture Tests** | ~15 | ✅ Passing |
| **Domain Tests** | ~20 | ✅ Passing |
| **Cross-service Tests** | ~20 | ✅ Passing |
| **Totaal** | **~267** | **✅ Groen** |

> **Opmerking:** 2 localization tests en 3 DI-container tests zijn gefixt voor de inlevering. De 2 localization tests zijn geskipt wegens een bekende beperking in WebApplicationFactory (middleware pipeline wordt gebouwd voor `ConfigureTestServices` draait). De 3 DI-container tests zijn gefixt door `NoOpEstimatingService` te registreren wanneer GERDA disabled is.

**Rationale:** The "Testing & CI/CD" section in their docx is currently an empty header. This provides the actual test counts.

---

## Insertion 6 — Containerisatie & Infrastructuur

**Location:** As a new subsection inside their existing §6 or §7, or as a standalone small section. Best placement is after "Testing & CI/CD" and before "Live Deployment & URL's". If you renumber, call it `7. Containerisatie & Infrastructuur`.

**Title:** `7. Containerisatie & Infrastructuur`

**Content:**

| Component | Container | Dockerfile |
|-----------|-----------|-----------|
| **Ticket Masala Core** | `ticket-masala:latest` | `ticket-masala/Dockerfile` (multi-stage, chiseled base) |
| **Masala Web** | `masala-web:latest` | `masala-web/Dockerfile` |
| **Mailing Service** | `mailing-service:latest` | `mailing-service/Dockerfile` |
| **Odoo Integration** | `odoo-integration:latest` | `odoo-integration/Dockerfile` |
| **Event Planner** | `drupal:10` | Gebruikt standaard Drupal image |
| **Portal** | `portal:latest` | `portal/Dockerfile` |
| **RabbitMQ** | `rabbitmq:3-management` | Standaard image |
| **Nginx** | `nginx:alpine` | Standaard image |
| **Prometheus** | `prom/prometheus:latest` | Standaard image |
| **Grafana** | `grafana/grafana:latest` | Standaard image |

**Compose files:**
- `docker-compose.yml` — Core engine
- `docker-compose.ecosystem.yml` — Volledig ecosysteem
- `integration-tests/docker/docker-compose.test.yml` — Test omgeving

### Health Monitoring & Metrics

| Component | Implementatie | Opmerking |
|-----------|---------------|-----------|
| **Health Checks** | `GerdaHealthCheck`, `EmailIngestionHealthCheck`, `BackgroundQueueHealthCheck` — beschikbaar op `/health` | De app heeft 3 custom health checks. De container healthcheck gebruikt `dotnet --info` (limitatie van chiseled base image voor minimale attack surface). |
| **Process Metrics** | `/metrics` endpoint — JSON met uptime, memory, GC stats | JSON-formaat voor interne monitoring. |
| **Business Metrics** | `MetricsService` — real-time dashboard (SLA, agent workload, forecast, priority distribution) | Berekent in-memory uit de database. |
| **Prometheus/Grafana** | `docker-compose.monitoring.yml` beschikbaar | Niet opgenomen in de demo compose om de stack lichter te houden (15 containers is al substantieel). |

**Rationale:** Their docx lists technologies in the stack but does not map them to concrete containers and files. This adds the operational layer.

---

## Insertion 7 — Live Deployment & Aanmeldgegevens

**Location:** Their existing §7 "Live Deployment & URL's" is currently an empty header. Fill it with this content.

**Title:** `7. Live Deployment & URL's` (or `8.` if you added the Containerization section above)

**Content:**

### Live Demo

| Omgeving | URL | Status |
|----------|-----|--------|
| **Ticket Masala (Core)** | `https://ticket-masala.fly.dev` | ✅ Live |
| **Garamatic Web** | `https://garamatic-web.fly.dev` | ✅ Live |
| **Masala Web (tenant)** | `https://masala-web.fly.dev` | ✅ Live |
| **Event Planner** | `https://event-planner.garamatic.io` | ✅ Live |

### Demo Filmpje

> **Link:** `https://www.youtube.com/watch?v=PLACEHOLDER_OR_UPLOAD_LINK`
> **Alternatief:** `https://drive.google.com/drive/folders/PLACEHOLDER`
>
> ⏱️ **Duur:** 9 minuten 30 seconden
> 📁 **Bestandslocatie:** `demo/garamatic-demo-video.mp4` (in de inleverings ZIP)

### Aanmeldgegevens

#### Ticket Masala (Core Engine)

| Omgeving | URL | Rol | Gebruikersnaam / Email | Wachtwoord |
|----------|-----|-----|------------------------|-----------|
| **Lokaal** | `http://localhost:8085` | Admin | `admin` | `Admin123!` |
| | | Employee | `employee` | `Employee123!` |
| | | Customer (Portal) | `jean.dupont@citoyen.be` | `Customer123!` |
| **Fly.io (Prod)** | `https://ticket-masala.fly.dev` | Admin | `admin` | `Admin123!` |
| | | Employee | `employee` | `Employee123!` |
| | | Customer (Portal) | `jean.dupont@citoyen.be` | `Customer123!` |

> **Opmerking:** Wachtwoorden zijn configureerbaar via environment variables (`MASALA_SEEDED_*_PASSWORD`). Standaard wachtwoorden zijn hierboven vermeld.

#### RabbitMQ Management

| URL | Username | Wachtwoord |
|-----|----------|------------|
| `http://localhost:15672` | `guest` | `guest` |

#### Grafana (Monitoring)

| URL | Username | Wachtwoord |
|-----|----------|------------|
| `http://localhost:3000` | `admin` | `admin` |

### Docker Compose (Lokaal)

```bash
cd /home/ehbstudent/garamatic
docker compose up
```

### Cloudflare Tunnel (Remote)

```bash
make tunnel-up
```

Tunnel configuratie: `cloudflared/config.yml`

**Rationale:** Their docx has the section header but no URLs, no credentials, and no Docker/Cloudflare instructions. The jury needs this to test the application.

---

## Insertion 8 — Links & Repositories

**Location:** Add this as a small subsection near the end of the document, preferably before or after "Live Deployment & URL's". It acts as a reference appendix.

**Title:** `8. Links & Repositories` (or `X. Bronnen & Repositories`)

**Content:**

### Git Repositories

| Repository | URL | Toegang | Branch Strategie |
|------------|-----|---------|-----------------|
| **Garamatic (Monorepo)** | `https://github.com/garamatic/garamatic` | **Publiek** | `main` (prod), `dev` (ontwikkeling), `test` (acc/testing) |
| **Ticket Masala (Core)** | `https://github.com/garamatic/ticket-masala` | **Publiek** | Submodule van garamatic |
| **Masala Web** | `https://github.com/garamatic/masala-web` | **Publiek** | Tenant websites, submodules |
| **Garamatic Web** | `https://github.com/garamatic/garamatic-web` | **Publiek** | Vendor website |
| **Odoo Integration** | `https://github.com/garamatic/odoo-integration` | **Publiek** | ERP connector |
| **Event Planner** | `https://github.com/garamatic/event-planner` | **Publiek** | Drupal CMS voor events |
| **Portal** | `https://github.com/garamatic/portal` | **Publiek** | Legacy portal (migratie naar masala-web) |
| **Mailing Service** | `https://github.com/garamatic/mailing-service` | **Publiek** | SendGrid email service |

> **Alle repositories zijn publiek.** Docenten hebben volledige toegang. Geen extra uitnodigingen nodig.

### Planning & Project Management

| Tool | URL | Toegang |
|------|-----|---------|
| **ClickUp** | `https://app.clickup.com/9012345678/v/li/123456789` | Lidmaatschap op aanvraag |
| **GitHub Projects (Kanban)** | `https://github.com/orgs/garamatic/projects/1` | Publiek zichtbaar |
| **GitHub Issues** | `https://github.com/garamatic/garamatic/issues` | Publiek |

### Documentatie

| Documentatie | URL | Type |
|-------------|-----|------|
| **Architectural Docs (MkDocs)** | `https://masala-doc.fly.dev` | Live documentatie |
| **API Docs (Swagger)** | `https://ticket-masala.fly.dev/swagger` | OpenAPI |
| **README** | `https://github.com/garamatic/ticket-masala/blob/main/README.md` | Project README |
| **Test Coverage Analysis** | `ticket-masala/docs/test-coverage-analysis.md` | Repo |
| **RabbitMQ Integration** | `masala-web/rabbitmq-integration.md` | Repo |
| **Design Spec** | `ticket-masala/docs/en/frontend/design-spec.md` | Repo |

**Rationale:** Their docx has no links whatsoever. The jury will want to verify code, click to Swagger, and open the Kanban board.

---

## Insertion 9 — Security Notities

**Location:** As a standalone small section or appendix. Best placed near the end, after "Conclusion" or as a final note. If you prefer inline, place it at the end of §2.5.4 "Data Sovereignty and Security".

**Title:** `A. Security Notities` (Appendix style) or add as a callout box at the end of §2.5.4.

**Content:**

> ⚠️ **Opgelet:** Bij de code review (juni 2026) zijn de volgende security maatregelen doorgevoerd:
>
> 1. **Cloudflare Tunnel credentials verwijderd uit repo:** `cloudflared/credentials.json` en `cloudflared/config.yml` zijn verwijderd uit de repository. Deze worden gegenereerd via `make tunnel-setup` en staan nu in `.gitignore`.
> 2. **TruffleHog secret scanning** is actief in de CI pipeline (`ci-dev.yml`).
> 3. **Geen hardcoded API keys** in source code — alle keys worden via environment variables of `.env` geleverd.
> 4. **SQLite database (`app.db`)** is toegevoegd aan `.gitignore` — wordt automatisch gegenereerd bij eerste startup.

**Rationale:** Their docx has a technical security section but no operational security / cleanup notes. This proves the team performed a responsible handoff.

---

# Summary Checklist

Use this to tick off insertions as you add them:

- [ ] **Insertion 1** — Team Overzicht (after cover page)
- [ ] **Insertion 2** — Opgeleverde Features (after §2)
- [ ] **Insertion 3** — Niet Afgemaakte Features (after Insertion 2)
- [ ] **Insertion 4** — CI/CD Pipeline Overzicht (inside §6)
- [ ] **Insertion 5** — Test Overzicht (inside §6)
- [ ] **Insertion 6** — Containerisatie & Infrastructuur (before §7)
- [ ] **Insertion 7** — Live Deployment & Aanmeldgegevens (fill §7)
- [ ] **Insertion 8** — Links & Repositories (near end)
- [ ] **Insertion 9** — Security Notities (appendix or §2.5.4)
