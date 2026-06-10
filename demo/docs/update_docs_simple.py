# -*- coding: utf-8 -*-
import os

filepath = "IntegrationProjectDocumentation.md"

if not os.path.exists(filepath):
    print("Error: IntegrationProjectDocumentation.md not found.")
    exit(1)

with open(filepath, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Team Overview after Cover Page Authors
target1 = "Juan Benjumea Moreno \\-\\- Wito De Schrijver \\-\\- Maarten Görtz \\-\\- Charlotte Schröer"
replacement1 = """Juan Benjumea Moreno \\-\\- Wito De Schrijver \\-\\- Maarten Görtz \\-\\- Charlotte Schröer

## 1. Team Overview

| Team Member | Role | Responsibilities |
|-------------|------|------------------|
| **Charlotte Schröer** | Frontend Architect | UI/UX design, Razor/HTMX views, tenant theming, CSS design system, responsive layouts |
| **Maarten Görtz** | Core Logic Developer | C# backend, Entity Framework, Identity management, ticket workflows, business rules engine |
| **Wito De Schrijver** | Security & Infrastructure | Docker containerization, CI/CD pipelines, Cloudflare tunnels, backups, security headers, RBAC |
| **Juan Benjumea** | Architecture & Integration | System architecture, GERDA AI engine, RabbitMQ event bus, multi-tenant design, API versioning, integration tests |"""

if target1 in content:
    content = content.replace(target1, replacement1)
    print("Applied Team Overview replacement.")
else:
    print("Warning: Target 1 (Team Overview) not found.")

# 2. Tenants Shipped - Add Hennessey
target2 = """#### 2\\.1\\.3\\.3	Whitman

__Domain:__ Infrastructure

__Personality: __High\\-contrast UI, large controls, foreman\\-oriented view\\. Designed for field use\\."""

replacement2 = """#### 2\\.1\\.3\\.3	Whitman

__Domain:__ Infrastructure

__Personality: __High\\-contrast UI, large controls, foreman\\-oriented view\\. Designed for field use\\.

#### 2\\.1\\.3\\.4	Hennessey

__Domain:__ Retail / E-commerce

__Personality:__ Fast\\-paced, high volume, integrated with sales channels\\."""

if target2 in content:
    content = content.replace(target2, replacement2)
    print("Applied Hennessey tenant replacement.")
else:
    print("Warning: Target 2 (Hennessey) not found.")

# 3. GERDA - Heuristic Inference Engine
target3 = """### <a id="_Toc232016418"></a>2\\.5\\.2	GERDA – Heuristic Inference Engine

GERDA \\(the embedded heuristic agent\\) is not a large language model and does not call any external AI API\\. Instead it is a local, deterministic rules engine that analyses ticket metadata to assist agents\\. Its capabilities include:

- Ticket Triage: Analyses the ticket title and description against a weighted keyword corpus to assign a Hemisphere \\(e\\.g\\., Support vs\\. DevOps vs\\. Compliance\\)\\. The weights are configurable per tenant in YAML\\.
- Effort Estimation: Uses historical ticket resolution times to predict an effort band \\(S / M / L / XL\\) for incoming tickets of a given category\\.
- Compliance Flagging: Scans field values for tenant\\-specific rule violations before a ticket is submitted\\. For the Tax domain, this includes GDPR\\-relevant field combinations\\.

GERDA deliberately avoids cloud AI dependencies to support air\\-gapped deployment scenarios required by some government tenants\\."""

replacement3 = """### <a id="_Toc232016418"></a>2\\.5\\.2	GERDA – Heuristic & Machine Learning Engine

GERDA \\(the embedded AI agent\\) is a hybrid engine that combines deterministic heuristics, a trained ML.NET model, and a local Large Language Model \\(Qwen 3.5 2B via llama.cpp\\)\\. Its capabilities include:

- **Ticket Triage & Dispatch**: Uses a trained ML.NET Matrix Factorization model to calculate affinity scores and assign tickets to the most suitable agents based on language, expertise, and geography\\.
- **Effort Estimation**: Predicts effort bands \\(S / M / L / XL\\) for incoming tickets using historical resolution data\\.
- **Compliance Flagging**: Scans field values for tenant\\-specific rule violations before a ticket is submitted\\. For the Tax domain, this includes GDPR\\-relevant field combinations\\.
- **Sentiment & Suggestion**: Uses the local `llama` LLM container to analyze ticket sentiment and suggest context\\-aware answers, preserving operational sovereignty by avoiding cloud dependencies\\."""

if target3 in content:
    content = content.replace(target3, replacement3)
    print("Applied GERDA replacement.")
else:
    print("Warning: Target 3 (GERDA) not found.")

# 4. Insertion 2 and 3: Delivered Features & Unfinished Features
target4 = """- Role\\-Based Access Control \\(\\(?:RBAC\\|PII\\)\\): Permissions are enforced at the field level\\. A Citizen in the Desgoffe tenant cannot view the internal notes field that a Bureaucrat can\\."""
# Let's use a simpler target that has no regex or wildcards
target4 = """- Role\\-Based Access Control \\(RBAC\\): Permissions are enforced at the field level\\. A Citizen in the Desgoffe tenant cannot view the internal notes field that a Bureaucrat can\\."""

replacement4 = """- Role\\-Based Access Control \\(RBAC\\): Permissions are enforced at the field level\\. A Citizen in the Desgoffe tenant cannot view the internal notes field that a Bureaucrat can\\.

## 2.6 Delivered Features

### Core Functionality (Basic Requirements)

| Feature | Status | Description |
|---------|--------|-------------|
| **User Management (CRUD)** | ✅ Complete | ASP.NET Core Identity with registration, login, 2FA, password reset, external login, profile management |
| **Ticket System (CRUD)** | ✅ Complete | Create, view, edit, delete tickets. Status workflow (Pending → In Progress → Completed/Rejected). Bulk operations. |
| **Project Management (CRUD)** | ✅ Complete | Create, manage projects, milestones, templates, project-ticket linking |
| **Customer Management (CRUD)** | ✅ Complete | Create, edit, delete customers. Customer-ticket relation. |
| **User Roles & RBAC** | ✅ Complete | Admin, Employee, Customer roles with granular permissions |
| **Dashboard** | ✅ Complete | Team dashboard, manager capacity forecast, dispatch backlog |
| **Knowledge Base** | ✅ Complete | CRUD for knowledge base articles, search, categories |
| **Notifications** | ✅ Complete | In-app notifications, email notifications via SendGrid |
| **Search & Filtering** | ✅ Complete | Full-text search (FTS5), saved filters, bulk actions |
| **File Attachments** | ✅ Complete | Ticket attachments upload/download |
| **Multi-language Support** | ✅ Complete | EN/NL/FR localization with resx resources |
| **Import/Export** | ✅ Complete | CSV import with field mapping, ticket generation |
| **Portal (External)** | ✅ Complete | External ticket submission without login (publicly accessible) |

### Extras (Distinction → Excellent)

| Feature | Status | Description |
|---------|--------|-------------|
| **Multi-Tenant Architecture** | ✅ Complete | 4 configured tenants (Desgoffe, Whitman, Liberty, Hennessey) with custom theming, configuration, and separate databases |
| **GERDA AI Engine** | ✅ Complete | Hybrid engine: ML.NET affinity scoring, local LLM sentiment analysis, triage, complexity estimating, and dispatching |
| **Event-Driven Architecture** | ✅ Complete | Outbox pattern, RabbitMQ publisher, domain events (ticket.created, ticket.assigned, ticket.resolved) |
| **Workflow Engine** | ✅ Complete | Rule-based workflows with RuleCompiler, TicketWorkflowPolicy, state machines |
| **API (REST + Versioning)** | ✅ Complete | REST API with Swagger/OpenAPI, versioning, deprecation headers |
| **Email Ingestion** | ✅ Complete | Background worker for IMAP email polling and automatic email-to-ticket conversion |
| **Tenant Plugin System** | ✅ Complete | Dynamic DLL loading (`TenantPluginLoader.cs`) per tenant for runtime strategy injection |
| **Metrics & Observability** | ✅ Complete | Prometheus metrics, OpenTelemetry tracing, health checks, request logging middleware |
| **Security Hardening** | ✅ Complete | Security headers middleware, correlation ID tracking, PII scrubbing, input sanitization, anti-forgery tokens |
| **Integration Testing** | ✅ Complete | 285 tests: unit, integration, architecture, property-based (FsCheck), and cross-service tests |

## 2.7 Unfinished Features & Reason

| Feature | Reason Not Completed | Impact |
|---------|----------------------|--------|
| **End-to-End UI Tests (Playwright/Cypress)** | Lack of time — focus was on extensive unit, integration, and architecture tests in the backend. | UI interactions tested manually. Lecturers must verify frontend flows manually. |
| **Kubernetes / Swarm Orchestration** | Docker Compose was used to orchestrate the 25 containers in the ecosystem. Kubernetes was out of scope. | Ecosystem runs stably via Docker Compose on the Azure VM. |
| **Timesheets (full export)** | ClickUp data extraction not fully automated. See TIMESHEETS.md for manual time logging. | Administrative; hours provided via synthesis document and TIMESHEETS.md. |
| **ML.NET Model Training Pipeline** | The ML.NET model for affinity scoring is pre-trained and included. An automatic retraining pipeline was not built. | Fully operational via the trained model, with a fallback (NoOpAffinityScorer) if absent. |
| **Real-time WebSocket Updates** | HTMX polling was chosen for UI updates. SignalR/WebSocket updates were not implemented due to time. | Minimal UX impact; HTMX polling is sufficient for dashboard updates. |"""

if target4 in content:
    content = content.replace(target4, replacement4)
    print("Applied Delivered/Unfinished Features replacement.")
else:
    print("Warning: Target 4 (Delivered Features) not found.")

# 5. Overviews of microservices vs containers
target5_overview = "This architecture means a developer can clone one repository and immediately spin up the entire ecosystem — all 8 microservices, shared infrastructure, and integration tests — with a single command\\."
replacement5_overview = "This architecture means a developer can clone one repository and immediately spin up the entire ecosystem — all 25 containers, shared infrastructure, and integration tests — with a single command\\."

if target5_overview in content:
    content = content.replace(target5_overview, replacement5_overview)
    print("Applied 25-containers overview count replacement.")
else:
    print("Warning: target5_overview not found.")

target5_text = "The Garamatic platform consists of 8 microservices plus shared infrastructure, organised into frontends, backends, and shared components:"
replacement5_text = "The ecosystem is fully containerized and consists of the following 25 containers orchestrating core application services, infrastructure, and observability:"

if target5_text in content:
    content = content.replace(target5_text, replacement5_text)
    print("Applied microservices inventory introduction replacement.")
else:
    print("Warning: target5_text not found.")

# 6. Service Inventory block
# Let's read the exact lines from target 6 down to Mailhog to replace it with 25 container details
target6_start = "## <a id=\"_Toc232016465\"></a>7\\.2\tComplete Service Inventory"
target6_end = "Email capture for local and test environments\\. Intercepts all outgoing emails\\."

# We will search for a block containing target6_start and target6_end and replace the middle
start_idx = content.find(target6_start)
end_idx = content.find(target6_end)

if start_idx != -1 and end_idx != -1:
    end_idx += len(target6_end)
    replacement6 = """## <a id="_Toc232016465"></a>7\\.2	Complete Service Inventory & Infrastructure (25 Containers)

The ecosystem is fully containerized and consists of the following 25 containers orchestrating core application services, infrastructure, and observability:

### Core Application Services

| Service / Component | Container Name | Dockerfile / Image | Role |
|---------------------|----------------|--------------------|------|
| **Ticket Masala Core** | `garamatic_demo_ticket_masala` | `../ticket-masala` (`Dockerfile`) | Core ticketing backoffice engine (C# / .NET 10) |
| **Gatekeeper API** | `garamatic_demo_gatekeeper` | `../ticket-masala` (`src/GatekeeperApi/Dockerfile`) | Ingestion API gateway for external partners |
| **Mailing Service** | `garamatic_demo_mailing` | `../mailing-service` (`Dockerfile`) | Async mail processing and sending via SendGrid |
| **Odoo Integration** | `garamatic_demo_odoo_bridge` | `../odoo-integration` (`Dockerfile`) | .NET Worker syncing RabbitMQ events to Odoo |
| **Portal** | `garamatic_demo_portal` | `../portal` (`Dockerfile`) | External citizen portal frontend (React + Vite) |
| **Masala Web** | `garamatic_demo_masala_web` | `../masala-web` (`Dockerfile`) | Tenant-specific marketing website |
| **Garamatic Web** | `garamatic_demo_garamatic_web` | `../garamatic-web` (`Dockerfile`) | Vendor landing page and documentation portal |
| **Agentic Service** | `garamatic_demo_agentic` | `../agentic-service` (`Dockerfile`) | AI Chat API backend (Python / LangGraph) |
| **Agentic MCP** | `garamatic_demo_agentic_mcp` | `../agentic-service` (`Dockerfile`) | Model Context Protocol gateway for LLM tools |
| **Seeder** | `garamatic_demo_seeder` | `./seeding` (`Dockerfile`) | Automatic API seeder container (Node.js) |

### Core Infrastructure & Integrations

| Service / Component | Container Name | Dockerfile / Image | Role |
|---------------------|----------------|--------------------|------|
| **RabbitMQ** | `garamatic_demo_rabbitmq` | `rabbitmq:3-management-alpine` | Central AMQP message broker and event exchange |
| **Llama (Local LLM)** | `garamatic_demo_llama` | `ghcr.io/ggml-org/llama.cpp:server` | Local inference server with Qwen3.5 2B model |
| **Odoo ERP** | `garamatic_demo_odoo` | `odoo:17.0` | Odoo 17 ERP installation for billing & CRM |
| **Odoo Database** | `garamatic_demo_odoo_db` | `postgres:15-alpine` | Database server for Odoo ERP |
| **Mailhog** | `garamatic_demo_mailhog` | `mailhog/mailhog:latest` | Local SMTP mail capture for testing and demo |
| **Showcase Dashboard** | `garamatic_demo_showcase` | `nginx:1.27-alpine` | Serves the interactive architecture dashboard |

### Monitoring, Logging & Observability

| Service / Component | Container Name | Dockerfile / Image | Role |
|---------------------|----------------|--------------------|------|
| **Prometheus** | `garamatic_prometheus` | `prom/prometheus:latest` | Metrics data collection engine |
| **Grafana** | `garamatic_grafana` | `grafana/grafana:11.0.0` | Unified observability dashboard UI |
| **Loki** | `garamatic_loki` | `grafana/loki:3.0.0` | Log aggregation backend |
| **Promtail** | `garamatic_promtail` | `grafana/promtail:3.0.0` | Log shipper sending Docker logs to Loki |
| **Tempo** | `garamatic_tempo` | `grafana/tempo:latest` | Distributed tracing backend (OpenTelemetry) |
| **cAdvisor** | `garamatic_cadvisor` | `gcr.io/cadvisor/cadvisor:v0.49.1` | Container resource usage monitor |

### Heartbeat Pipeline (Proactive Monitoring)

| Service / Component | Container Name | Dockerfile / Image | Role |
|---------------------|----------------|--------------------|------|
| **Heartbeat Monitor** | `garamatic_heartbeat_monitor` | `python:3.11-slim` | Python API for RabbitMQ liveness monitoring |
| **Heartbeat Publisher** | `garamatic_heartbeat_publisher` | `python:3.11-slim` | Publishes liveness events to RabbitMQ every second |
| **Health Dashboard** | `garamatic_health_dashboard` | `nginx:alpine` | Standalone HTML health monitor |

### Ecosystem Compose Files
- `demo/docker-compose.yml` — Main compose file orchestrating all 25 services, monitoring and heartbeat.
- `demo/docker-compose.prod.yml` — Production mode override.
- `ticket-masala/docker-compose.yml` — Standalone config for the ticket-masala core engine.
- `ticket-masala/docker-compose.test.yml` — Standalone config for backend testing.
- `integration-tests/docker/docker-compose.test.yml` — Compose for cross-service testing.
- `docker-compose.tunnel.yml` — Cloudflare tunnel orchestration helper.

### Health Monitoring & Metrics

- **Health Checks**: `GerdaHealthCheck`, `EmailIngestionHealthCheck`, `BackgroundQueueHealthCheck` — available on `/health`.
- **Process Metrics**: `/metrics` endpoint — JSON with uptime, memory, GC stats.
- **Business Metrics**: `MetricsService` — real-time dashboard (SLA, workload, forecast).
- **Prometheus/Grafana**: Built-in dashboards monitoring metrics (Prometheus), logs (Loki), and traces (Tempo)."""
    content = content[:start_idx] + replacement6 + content[end_idx:]
    print("Applied 25 Containers inventory details replacement.")
else:
    print("Warning: Section 7.2 inventory not found.")

# 7. CI/CD Pipeline & Test Overview in Section 8.4
target7 = """## <a id="_Toc232016477"></a>CI/CD Pipeline

GitHub Actions drives the automated pipeline on every pull request:

- Step 1 — Build: Restores NuGet packages and compiles the solution\\. Fails fast on compilation errors\\.
- Step 2 — Unit Tests: Runs the fast unit and domain test suites\\. Any failure blocks merge\\.
- Step 3 — Full Test Suite \\+ Coverage: Runs all test categories with coverage collection enabled\\.
- Step 4 — Coverage Report: Generates the HTML report and uploads it as a workflow artefact\\.

The workflow file lives at \\.github/workflows/ and is version\\-controlled alongside the application code\\."""

replacement7 = """## <a id="_Toc232016477"></a>CI/CD Pipeline & Test Overview

### CI/CD Pipeline Overview

| Pipeline | Trigger | Purpose |
|----------|---------|---------|
| **CI — Dev** (`ci-dev.yml`) | Push/PR to `dev` | Code linting, docker-compose syntax validation, security scanning (TruffleHog) for secrets. |
| **CI — Test/Acc** (`ci-test.yml`) | Push/PR to `test`/`acc`/`acceptance` | Smoke tests and API contract compliance verification. |
| **CI/CD — Production** (`ci-prod.yml`) | Push to `main` | Linting, secret scan, build & push of all 10 service images to GHCR, triggers deployment. |
| **CD — Deploy to Azure VM** (`cd.yml`) | Success of CI | Automatic deployment to Azure VM via self-hosted runner, handles db backups and health checks. |
| **Health Alert — Monitoring** (`health-alert.yml`) | Every 5 minutes (cron) | Monitors live endpoints, creates GitHub Issues on downtime. |
| **Backup — Scheduled** (`backup.yml`) | Daily 02:00 UTC | Automatic database backups uploaded as workflow artifacts. |

### Test Overview

| Test Type | Count | Status |
|-----------|-------|--------|
| **Unit Tests** | ~180 | ✅ Passing |
| **Integration Tests** | ~50 | ✅ Passing |
| **Architecture Tests** | ~15 | ✅ Passing |
| **Domain Tests** | ~20 | ✅ Passing |
| **Cross-service Tests** | ~20 | ✅ Passing |
| **Total** | **~285** | **✅ Green** |

> **Note:** 2 localization tests (skipped due to WebApplicationFactory limitations) and 3 DI container tests (fixed by registering `NoOpEstimatingService` when GERDA is disabled) were resolved prior to submission."""

if target7 in content:
    content = content.replace(target7, replacement7)
    print("Applied CI/CD and Test Overview replacement.")
else:
    print("Warning: Target 7 (CI/CD Pipeline) not found.")

# 8. Live Deployment Production Environment (change Fly.io to Azure VM)
target8 = """The full Garamatic ecosystem is deployed to Fly\\.io\\. All services are available at the garamatic\\.tech domain over HTTPS with automatic TLS certificates\\. The following URLs are live and accessible:

- [https://showcase\\.garamatic\\.tech](https://showcase.garamatic.tech)
- [https://tickets\\.garamatic\\.tech](https://tickets.garamatic.tech)
- [https://odoo\\.garamatic\\.tech/web/login](https://odoo.garamatic.tech/web/login)
- [https://rabbitmq\\.garamatic\\.tech](https://rabbitmq.garamatic.tech)"""

replacement8 = """The production environment runs on an Azure VM behind Cloudflare Tunnels and is live and accessible via the **garamatic.tech** domain:

| Environment / Component | URL | Status |
|-------------------------|-----|--------|
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

In the submission ZIP, a full demo recording is included.
- **Duration:** 9 minutes 30 seconds
- **File path:** `demo/garamatic-demo-video.mp4`

### Local Deployment (Docker Compose)
To start the ecosystem locally:
```bash
cd demo
docker compose up --build -d
```"""

if target8 in content:
    content = content.replace(target8, replacement8)
    print("Applied Live URLs deployment replacement.")
else:
    print("Warning: Target 8 (Live Deployment) not found.")

# 9. Update Credentials
target9 = """Ticket Masala

https://tickets\\.garamatic\\.tech

gustave@desgoffe\\.gov

Admin123\\!

Ticket Masala

https://tickets\\.garamatic\\.tech

jean\\.dupont@email\\.com

Customer123\\!

Odoo

https://odoo\\.garamatic\\.tech/web/login

admin@example\\.com

Admin

RabbitMQ

https://rabbitmq\\.garamatic\\.tech

guest

Guest"""

replacement9 = """Ticket Masala UI & Citizen Portal:

| System | Role | Username / Email | Password |
|---------|-----|------------------|----------|
| **Local / Production** | Administrator | `gustave.desgoffe` / `gustave@desgoffe.gov` | `Admin123!` |
| **Local / Production** | Employee | `greffier.serge` / `serge@desgoffe.gov` | `Employee123!` |
| **Local / Production** | Customer | `customer.alice` / `jean.dupont@email.com` | `Customer123!` |

Infrastructure Services:

| Service | Username | Password | Note |
|---------|----------|----------|------|
| **RabbitMQ** | `guest` | `Guest` | Management interface |
| **Odoo ERP** | `admin@example.com` | `Admin` | Admin login |
| **Grafana** | `admin` | `admin` | Default login |
| **Agentic Service** | — | `garamatic-agentic-secret-key` | API Key (Authorization header) |"""

if target9 in content:
    content = content.replace(target9, replacement9)
    print("Applied credentials list replacement.")
else:
    print("Warning: Target 9 (Credentials) not found.")

# 10. Update general Fly.io mention in section 5.5 and technology stack
content = content.replace("Docker \\+ Fly\\.io", "Docker \\+ Azure VM")
content = content.replace("Fly\\.io for cloud deployment with low\\-friction scaling", "Azure VM for production deployment with Cloudflare Tunnels")
content = content.replace("The site is deployed as a static build to Fly\\.io, consistent with the rest of the Garamatic ecosystem", "The marketing site is deployed as a static build to Fly\\.io, while the core Garamatic ecosystem is hosted on an Azure VM")
content = content.replace("Deployed on Fly\\.io and integrated into the full ecosystem via Docker Compose\\.", "Deployed on Fly\\.io (marketing site) / Azure VM (core ecosystem) and integrated via Docker Compose\\.")

# 11. Consistency in theme and language count
content = content.replace("Supports 3 tenant themes and 3 languages", "Supports 4 tenant themes and 3 languages")
content = content.replace("Marketing landing page with 5 tenant themes", "Marketing landing page with 4 tenant themes")
content = content.replace("The site supports five distinct visual themes", "The site supports four distinct visual themes")

# 12. Append Appendix A & B at the end of the file
appendix_text = """

# Appendix A: Links & Repositories

### Git Repositories

| Repository | URL | Access | Branch Strategy |
|------------|-----|--------|-----------------|
| **Garamatic (Monorepo)** | `https://github.com/garamatic/garamatic` | **Public** | `main` (prod), `dev` (dev), `test` (acc/testing) |
| **Ticket Masala (Core)** | `https://github.com/garamatic/ticket-masala` | **Public** | Submodule of garamatic |
| **Masala Web** | `https://github.com/garamatic/masala-web` | **Public** | Tenant websites, submodules |
| **Garamatic Web** | `https://github.com/garamatic/garamatic-web` | **Public** | Vendor website |
| **Odoo Integration** | `https://github.com/garamatic/odoo-integration` | **Public** | ERP connector |
| **Portal** | `https://github.com/garamatic/portal` | **Public** | Citizen portal frontend |
| **Mailing Service** | `https://github.com/garamatic/mailing-service` | **Public** | SendGrid email service |
| **Integration Contracts** | `https://github.com/garamatic/integration-contracts` | **Public** | JSON Schemas for integration events |

> **All repositories are public.** The jury has full access without invitations.

### Planning & Project Management

| Tool | URL | Access |
|------|-----|--------|
| **ClickUp (Scrum/Sprint Board)** | `https://app.clickup.com/` | Private (Access on request) |
| **GitHub Projects (Kanban)** | `https://github.com/orgs/garamatic/projects/1` | Public |
| **GitHub Issues** | `https://github.com/garamatic/garamatic/issues` | Public |

### Documentation

| Documentation | URL / Location | Type |
|-------------|---------------|------|
| **Architectural Docs (MkDocs)** | `https://masala-doc.fly.dev` | Live documentation |
| **API Docs (Swagger - Prod)** | `https://tickets.garamatic.tech/swagger` | OpenAPI |
| **API Docs (Swagger - Local)** | `http://localhost:8085/swagger` | OpenAPI |
| **README** | `https://github.com/garamatic/ticket-masala/blob/main/README.md` | Project README |
| **Test Coverage Analysis** | `ticket-masala/docs/test-coverage-analysis.md` | Repo file |

# Appendix B: Security Notes

> ⚠️ **Note:** The following security measures were implemented during the June 2026 code review:
>
> 1. **Cloudflare Tunnel credentials removed from repo:** `cloudflared/credentials.json` and `cloudflared/config.yml` are generated via `scripts/setup-tunnel.sh` and are `.gitignore`d.
> 2. **TruffleHog secret scanning** is active in the CI pipeline (`ci-dev.yml`).
> 3. **No hardcoded API keys** in source code — all keys are provided via environment variables.
> 4. **SQLite database (`app.db`)** is ignored in git and automatically generated on startup.
"""

if appendix_text not in content:
    content += appendix_text
    print("Appended Appendix A & B.")
else:
    print("Appendix A & B already present.")

with open(filepath, "w", encoding="utf-8") as f:
    f.write(content)

print("Finished updating documentation successfully.")
