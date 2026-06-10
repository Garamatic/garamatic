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
| **Multi-Tenant Architectuur** | ✅ Volledig | 1 volledig geconfigureerde tenant (Desgoffe) met eigen theming, configuratie, database |
| **GERDA AI Engine** | ✅ Volledig | Heuristische inference engine: sentiment analyse, triage, complexity estimating, dispatching, ranking, grouping, knowledge retrieval, anticipation |
| **Event-Driven Architectuur** | ✅ Volledig | Outbox pattern, RabbitMQ publisher, domain events (ticket.created, ticket.assigned, ticket.resolved) |
| **Workflow Engine** | ✅ Volledig | Regel-gebaseerde workflows met RuleCompiler, TicketWorkflowPolicy, state machines |
| **API (REST + Versioning)** | ✅ Volledig | REST API met Swagger/OpenAPI, versiebeheer (v1/work-items en v1/work-containers), deprecation headers |
| **Email Ingestion** | ✅ Volledig | Background worker (`EmailIngestionService`) voor IMAP email polling en automatische email-to-ticket conversie |
| **Tenant Plugin System** | ✅ Volledig | Dynamische DLL loading (`TenantPluginLoader.cs`) per tenant voor runtime strategie-injectie |
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
| **End-to-End UI Tests (Playwright/Cypress)** | Tijdsgebrek — focus lag op uitgebreide unit-, integratie- en architectuur-tests in de backend. | UI-interacties zijn handmatig getest. Docenten moeten de frontend flow handmatig verifiëren. |
| **Kubernetes / Swarm Orchestration** | Docker Compose is gebruikt voor de orchestration van de 25 containers in het ecosysteem. Kubernetes was buiten scope voor de complexiteit en teamgrootte. | Ecosysteem draait stabiel via Docker Compose op de Azure VM. |
| **Timesheets (volledige export)** | ClickUp data-extractie is niet volledig geautomatiseerd. Zie TIMESHEETS.md voor de handmatige urenverantwoording. | Administratief; de urenverantwoording is via het synthese-document en TIMESHEETS.md aangeleverd. |
| **ML.NET Model Training Pipeline** | Het ML.NET model voor affinity scoring (ticket toewijzing) is vooraf handmatig getraind en meegeleverd. Een automatische retraining pipeline is niet gebouwd. | De functionaliteit is volledig operationeel via het getrainde model, met een fallback (NoOpAffinityScorer) indien afwezig. |
| **Real-time WebSocket Updates** | Er is gekozen voor HTMX polling voor UI-updates. SignalR/WebSocket updates zijn wegens tijdsgebrek niet geïmplementeerd. | De UX-impact is minimaal; polling via HTMX is voldoende voor ticket-updates in het dashboard. |

**Rationale:** Shows academic honesty and self-assessment. The jury appreciates transparent scope management.

---

## Insertion 4 — CI/CD Pipeline Overzicht

**Location:** Inside their existing §6 "Testing & CI/CD", as a subsection. Add it *after* the introductory sentence about the pipeline and *before* any test count tables.

**Title:** `6.1 CI/CD Pipeline Overzicht`

**Content:**

| Pipeline | Trigger | Wat doet het? |
|----------|---------|---------------|
| **CI — Dev** (`ci-dev.yml`) | Push/PR naar `dev` | Code linting, docker-compose syntax validatie, en security scanning (TruffleHog) voor hardcoded secrets. |
| **CI — Test/Acc** (`ci-test.yml`) | Push/PR naar `test`/`acc`/`acceptance` | Draait smoke-tests en verifieert API-contract compliance van de services in een test-omgeving. |
| **CI/CD — Production** (`ci-prod.yml`) | Push naar `main` | Code linting, secret scan, build & push van alle 10 service Docker images naar GitHub Container Registry (GHCR), en triggert deployment. |
| **CD — Deploy to Azure VM** (`cd.yml`) | Succesvolle afronding van `CI — Test/Acc` of `CI/CD — Production` | Automatische deployment op de Azure VM via een self-hosted runner. Voert database back-ups uit en valideert de gezondheid van alle services via healthcheck scripts. |
| **Health Alert — Monitoring** (`health-alert.yml`) | Periodiek (elke 5 minuten via cron) | Monitort de live productie endpoints. Maakt automatisch GitHub Issues aan bij downtime (en sluit ze bij herstel) als actieve alerting. |
| **Backup — Scheduled** (`backup.yml`) | Dagelijks om 02:00 UTC of handmatig | Voert automatische back-ups uit van de productie databases en uploads de back-up archieven als workflow artifacts. |

> **Locatie in repo:** `.github/workflows/`

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

### Ecosysteem Services (25 containers)

#### Core Application Services

| Service / Component | Container Naam | Dockerfile / Image | Rol |
|--------------------|----------------|---------------------|-----|
| **Ticket Masala Core** | `garamatic_demo_ticket_masala` | `../ticket-masala` (`Dockerfile`) | Core ticketing backoffice engine (C# / .NET 8) |
| **Gatekeeper API** | `garamatic_demo_gatekeeper` | `../ticket-masala` (`src/GatekeeperApi/Dockerfile`) | Ingestie API gateway voor externe partners |
| **Mailing Service** | `garamatic_demo_mailing` | `../mailing-service` (`Dockerfile`) | Async mail verwerking en verzending via SendGrid |
| **Odoo Integration** | `garamatic_demo_odoo_bridge` | `../odoo-integration` (`Dockerfile`) | .NET Worker die RabbitMQ events naar Odoo synct |
| **Portal** | `garamatic_demo_portal` | `../portal` (`Dockerfile`) | Externe burger-portal frontend (React + Vite) |
| **Masala Web** | `garamatic_demo_masala_web` | `../masala-web` (`Dockerfile`) | Tenant-specifieke marketing website |
| **Garamatic Web** | `garamatic_demo_garamatic_web` | `../garamatic-web` (`Dockerfile`) | Vendor landing page en documentatie portal |
| **Agentic Service** | `garamatic_demo_agentic` | `../agentic-service` (`Dockerfile`) | AI Chat API backend (Python / LangGraph) |
| **Agentic MCP** | `garamatic_demo_agentic_mcp` | `../agentic-service` (`Dockerfile`) | Model Context Protocol gateway voor LLM tools |
| **Seeder** | `garamatic_demo_seeder` | `./seeding` (`Dockerfile`) | Automatische API-seeder container (Node.js) |

#### Core Infrastructure & Integrations

| Service / Component | Container Naam | Dockerfile / Image | Rol |
|--------------------|----------------|---------------------|-----|
| **RabbitMQ** | `garamatic_demo_rabbitmq` | `rabbitmq:3-management-alpine` | Centrale AMQP message broker en event exchange |
| **Llama (Local LLM)** | `garamatic_demo_llama` | `ghcr.io/ggml-org/llama.cpp:server` | Local inference server met Qwen3.5 2B model |
| **Odoo ERP** | `garamatic_demo_odoo` | `odoo:17.0` | Odoo 17 ERP installatie voor billing & CRM |
| **Odoo Database** | `garamatic_demo_odoo_db` | `postgres:15-alpine` | Database server voor Odoo ERP |
| **Mailhog** | `garamatic_demo_mailhog` | `mailhog/mailhog:latest` | Lokale SMTP mail capture voor testing en demo |
| **Showcase Dashboard** | `garamatic_demo_showcase` | `nginx:1.27-alpine` | Serves het interactieve architectuur dashboard |

#### Monitoring, Logging & Observability

| Service / Component | Container Naam | Dockerfile / Image | Rol |
|--------------------|----------------|---------------------|-----|
| **Prometheus** | `garamatic_prometheus` | `prom/prometheus:latest` | Metrics data collection engine |
| **Grafana** | `garamatic_grafana` | `grafana/grafana:11.0.0` | Unified observability dashboard UI |
| **Loki** | `garamatic_loki` | `grafana/loki:3.0.0` | Log aggregatie backend |
| **Promtail** | `garamatic_promtail` | `grafana/promtail:3.0.0` | Log shipper die Docker logs naar Loki stuurt |
| **Tempo** | `garamatic_tempo` | `grafana/tempo:latest` | Distributed tracing backend (OpenTelemetry) |
| **cAdvisor** | `garamatic_cadvisor` | `gcr.io/cadvisor/cadvisor:v0.49.1` | Container resource usage monitor |

#### Heartbeat Pipeline (Proactieve Monitoring)

| Service / Component | Container Naam | Dockerfile / Image | Rol |
|--------------------|----------------|---------------------|-----|
| **Heartbeat Monitor** | `garamatic_heartbeat_monitor` | `python:3.11-slim` | Python API voor RabbitMQ liveness monitoring |
| **Heartbeat Publisher** | `garamatic_heartbeat_publisher` | `python:3.11-slim` | Publiceert elke seconde liveness events naar RabbitMQ |
| **Health Dashboard** | `garamatic_health_dashboard` | `nginx:alpine` | Standalone HTML health monitor |

**Ecosysteem Compose Files:**
- `demo/docker-compose.yml` — Hoofd compose bestand dat alle 25 services, monitoring en heartbeat systemen orkestreert.
- `demo/docker-compose.prod.yml` — Productie-mode override.
- `ticket-masala/docker-compose.yml` — Standalone config voor de ticket-masala core engine.
- `ticket-masala/docker-compose.test.yml` — Standalone config voor backend unit- en integratietests.
- `integration-tests/docker/docker-compose.test.yml` — Compose voor de cross-service integration test suite.
- `docker-compose.tunnel.yml` — Cloudflare tunnel orchestration helper.

### Health Monitoring & Metrics

| Component | Implementatie | Opmerking |
|-----------|---------------|-----------|
| **Health Checks** | `GerdaHealthCheck`, `EmailIngestionHealthCheck`, `BackgroundQueueHealthCheck` — beschikbaar op `/health` | De app heeft 3 custom health checks. De container healthcheck gebruikt een gebouwde HTTP probe die `/health` bevraagt. |
| **Process Metrics** | `/metrics` endpoint — JSON met uptime, memory, GC stats | JSON-formaat voor interne monitoring. |
| **Business Metrics** | `MetricsService` — real-time dashboard (SLA, agent workload, forecast, priority distribution) | Berekent in-memory uit de database. |
| **Prometheus/Grafana** | dashboards zijn ingebakken | Grafana monitort metrics (Prometheus), logs (Loki) en traces (Tempo). |

**Rationale:** Their docx lists technologies in the stack but does not map them to concrete containers and files. This adds the operational layer.

---

## Insertion 7 — Live Deployment & Aanmeldgegevens

**Location:** Their existing §7 "Live Deployment & URL's" is currently an empty header. Fill it with this content.

**Title:** `7. Live Deployment & URL's` (or `8.` if you added the Containerization section above)

**Content:**

### Live Demo

De productie-omgeving draait op een Azure VM en is live bereikbaar via de volgende subdomeinen van **garamatic.tech**:

| Omgeving / Component | URL | Status |
|----------------------|-----|--------|
| **Showcase Dashboard** | `https://showcase.garamatic.tech` | ✅ Live |
| **Garamatic Web (Vendor)** | `https://web.garamatic.tech` | ✅ Live |
| **Masala Web (Tenant)** | `https://masala.garamatic.tech` | ✅ Live |
| **Citizen Portal** | `https://portal.garamatic.tech` | ✅ Live |
| **Ticket Masala (Core)** | `https://tickets.garamatic.tech` | ✅ Live |
| **RabbitMQ Management** | `https://rabbitmq.garamatic.tech` | ✅ Live |
| **Odoo ERP** | `https://odoo.garamatic.tech` | ✅ Live |
| **Odoo Bridge** | `https://odoo-bridge.garamatic.tech` | ✅ Live |
| **Mailhog UI** | `https://mailhog.garamatic.tech` | ✅ Live |
| **Agentic Service** | `https://agentic.garamatic.tech` | ✅ Live |
| **Grafana Dashboard** | `https://grafana.garamatic.tech` | ✅ Live |
| **Health Dashboard** | `https://heartbeat.garamatic.tech` | ✅ Live |

### Demo Video

In de inleverings-ZIP is een volledige demo-opname meegeleverd waarin de belangrijkste workflows en use cases worden doorlopen.

- **Duur:** 9 minuten 30 seconden
- **Bestandspad:** `demo/garamatic-demo-video.mp4`

### Aanmeldgegevens

#### Ticket Masala UI & Burger Portal

| Systeem | Rol | Gebruikersnaam / Email | Wachtwoord |
|---------|-----|------------------------|-----------|
| **Lokaal / Productie** | Administrator | `gustave.desgoffe` of `gustave@desgoffe.gov` | `Admin123!` |
| **Lokaal / Productie** | Back-office Medewerker | `greffier.serge` of `serge@desgoffe.gov` | `Employee123!` |
| **Lokaal / Productie** | Burger (Klant) | `customer.alice` of `jean.dupont@email.com` | `Customer123!` |

> **Opmerking:** Wachtwoorden zijn configureerbaar via environment variables (`MASALA_SEEDED_*_PASSWORD`). Standaard wachtwoorden zijn hierboven vermeld.

#### Systemen en Infrastructuren

| Service | Username | Wachtwoord | Opmerking |
|---------|----------|------------|-----------|
| **RabbitMQ** | `guest` | `guest` | Gebruikt voor management interface |
| **Odoo ERP** | `admin` | `admin` | Administrator login |
| **Grafana** | `admin` | `admin` | Standaard inloggegevens |
| **Agentic Service** | — | `garamatic-agentic-secret-key` | API Key gebruikt via Authorization header |

### Docker Compose (Lokaal)

Om het ecosysteem lokaal op te starten:

```bash
cd demo
docker compose up --build -d
```

### Cloudflare Tunnel (Remote)

Cloudflare Tunnels worden gebruikt om de VM te koppelen aan het public domein `*.garamatic.tech`.

```bash
# Setup tunnel
./scripts/setup-tunnel.sh

# Start tunnel container
docker compose -f docker-compose.tunnel.yml up -d
```

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
| **Portal** | `https://github.com/garamatic/portal` | **Publiek** | Burger portal frontend |
| **Mailing Service** | `https://github.com/garamatic/mailing-service` | **Publiek** | SendGrid email service |
| **Integration Contracts** | `https://github.com/garamatic/integration-contracts` | **Publiek** | JSON Schemas voor integration events |

> **Alle repositories zijn publiek.** De jury heeft volledige toegang zonder extra uitnodigingen.

### Planning & Project Management

| Tool | URL | Toegang |
|------|-----|---------|
| **ClickUp (Scrum/Sprint Board)** | `https://app.clickup.com/` | Privé (Toegang op aanvraag) |
| **GitHub Projects (Kanban)** | `https://github.com/orgs/garamatic/projects/1` | Publiek |
| **GitHub Issues** | `https://github.com/garamatic/garamatic/issues` | Publiek |

### Documentatie

| Documentatie | URL / Locatie | Type |
|-------------|---------------|------|
| **Architectural Docs (MkDocs)** | `https://masala-doc.fly.dev` | Live documentatie |
| **API Docs (Swagger - Prod)** | `https://tickets.garamatic.tech/swagger` | OpenAPI |
| **API Docs (Swagger - Local)** | `http://localhost:8085/swagger` | OpenAPI |
| **README** | `https://github.com/garamatic/ticket-masala/blob/main/README.md` | Project README |
| **Test Coverage Analysis** | `ticket-masala/docs/test-coverage-analysis.md` | Repo bestand |
| **RabbitMQ Integration** | `masala-web/rabbitmq-integration.md` | Repo bestand |
| **Design Spec** | `ticket-masala/docs/en/frontend/design-spec.md` | Repo bestand |

**Rationale:** Their docx has no links whatsoever. The jury will want to verify code, click to Swagger, and open the Kanban board.

---

## Insertion 9 — Security Notities

**Location:** As a standalone small section or appendix. Best placed near the end, after "Conclusion" or as a final note. If you prefer inline, place it at the end of §2.5.4 "Data Sovereignty and Security".

**Title:** `A. Security Notities` (Appendix style) or add as a callout box at the end of §2.5.4.

**Content:**

> ⚠️ **Opgelet:** Bij de code review (juni 2026) zijn de volgende security maatregelen doorgevoerd:
>
> 1. **Cloudflare Tunnel credentials verwijderd uit repo:** `cloudflared/credentials.json` en `cloudflared/config.yml` zijn verwijderd uit de repository. Deze worden gegenereerd via `scripts/setup-tunnel.sh` en staan nu in `.gitignore`.
> 2. **TruffleHog secret scanning** is actief in de CI pipeline (`ci-dev.yml`).
> 3. **Geen hardcoded API keys** in source code — alle keys worden via environment variables of `.env` geleverd.
> 4. **SQLite database (`app.db` / `masala_demo.db`)** is toegevoegd aan `.gitignore` — wordt automatisch gegenereerd bij eerste startup.

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
