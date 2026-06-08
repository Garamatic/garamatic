# Synthesedocument — StaVaZa Integration Project

## 0. Project Context

**Realistisch Scenario:** Professioneel Ticketing Systeem

Dit project beschrijft een realistische scenario voor het implementeren van een event-driven architectuur met RabbitMQ in een professioneel IT- of service ticketing platform.

**Gebruikscases:**
- Medewerker meldt een IT-probleem
- Klant indient een support verzoek
- Technicus wordt toegewezen aan het issue
- Status updates worden gevolgd tijdens het oplosproces
- Automatische email notificaties worden verstuurd naar klanten
- Facturatie wordt gegenereerd voor factureerbaar werk
- Analytics dashboards monitoren support performance

**Kernsystemen in de Architectuur:**
- Frontend / Ticketing Tool: Gebruikers creëren en beheren tickets
- CRM: Slaat klant- en bedrijfsinformatie op en houdt service historie bij
- Mailing Service: Stuurt notificaties en updates naar klanten
- Planning System: Wijst technici toe en beheert scheduling
- Billing: Verwerkt factureerbaar werk en factuur generatie
- Control Room / Monitoring: Monitort systeem health en operationele statistieken

## 1. Team Overzicht

| Naam | Rol in Project | Verantwoordelijkheden |
|------|----------------|----------------------|
| Benjumea Moreno Juan | Backend Lead / Integration | Ticket Masala core, RabbitMQ, Gatekeeper API, CI/CD |
| De Schrijver Wito | Frontend / DevOps | Drupal Frontend, Garamatic Web, Docker, Monitoring |
| Görtz Maarten | Backend / ERP | Odoo Integration, Billing, Mailing Service |
| Schröer Charlotte | Testing / Documentation | Integration tests, QA, Event contracts, Documentation |

**Teamnaam:** StaVaZa
**Project:** Integration Project — Microservices Architectuur
**Datum:** 04.05.2026 | **Update:** 05.06.2026

---

## 2. Opleverde Features

### 2.1 Core Features (Ticket Masala — Eerste Semester, 20/20)

| Feature | Status | Toelichting |
|---------|--------|------------|
| Ticket CRUD (Create, Read, Update, Delete) | ✅ Compleet | Volledige CRUD via API en web UI |
| Multi-tenant support | ✅ Compleet | 1 tenant: Desgoffe |
| GERDA AI-assistent | ✅ Compleet | AI-gebaseerde ticket routing en prioritering |
| Email notificaties | ✅ Compleet | Automatische emails bij ticket events |
| Custom forms per tenant | ✅ Compleet | Tenant-specifieke velden en branding |
| Knowledge base | ✅ Compleet | KB artikelen per tenant |
| Time logging | ✅ Compleet | Urenregistratie op tickets |
| Status workflows | ✅ Compleet | Open → In Progress → Resolved → Closed |
| Invoice management | ✅ Compleet | Facturatie integratie |
| User management | ✅ Compleet | Rollen, permissies, customer portal |

### 2.2 Microservices Integratie (Tweede Semester)

| Feature | Status | Toelichting |
|---------|--------|------------|
| RabbitMQ message broker | ✅ Compleet | Centrale event bus voor alle services |
| Gatekeeper API (event ingestion) | ✅ Compleet | Ingestie API voor externe events |
| Mailing Service (email worker) | ✅ Compleet | Async email verwerking via RabbitMQ |
| Odoo Integration (ERP bridge) | ✅ Compleet | Invoice sync naar Odoo ERP |
| Event Planner (Drupal CMS) | ✅ Compleet | Event management module |
| Agentic Service (AI/MCP) | ✅ Compleet | AI-powered ticket assistent |
| Integration Contracts | ✅ Compleet | 9 gedefinieerde event schemas |
| Tenant form submissions | ✅ Compleet | Portal API voor externe ticket creatie |
| Demo showcase sites | ✅ Compleet | 1 tenant portal (Desgoffe) |

### 2.3 DevOps & Infrastructuur

| Feature | Status | Toelichting |
|---------|--------|------------|
| CI/CD Pipelines (3 branches) | ✅ Compleet | dev → test → prod pipelines |
| Docker containerisatie | ✅ Compleet | Alle services gecontaineriseerd |
| Docker Compose orchestratie | ✅ Compleet | Full stack met health checks |
| Backup & Restore | ✅ Compleet | Volumes + databases backup/restore |
| Health Dashboard | ✅ Compleet | Grafana + HTML health monitor |
| Auto-restart policies | ✅ Compleet | `restart: unless-stopped` op alle services |
| Integration Test Suite | ✅ Compleet | 257+ tests, 11/11 suites passing |
| Git submodules | ✅ Compleet | 9 submodules in meta-repo |

---

## 3. Niet-afgeronde Features

| Feature | Status | Reden |
|---------|--------|-------|
| Event Planner Drupal Frontend | ⚠️ Niet af | Steile leercurve voor Drupal framework. De frontend pagina moet nog worden ontwikkeld en geïntegreerd met RabbitMQ. Drupal draait als minimal test container. |
| Odoo live invoice sync | ⚠️ Niet af | Odoo bridge verwacht Odoo op `localhost:8069` (test container config). Productie Odoo instance niet beschikbaar in test omgeving. |
| LLM chat (agentic) | ⚠️ Niet af | Ollama model (qwen3.5:2b) vereist GPU voor snelle response. Chat endpoint retourneert 503 bij ongeconfigureerde LLM. |
| Tenant isolation via query params | ⚠️ Niet af | TicketMasala API gebruikt API key auth, geen tenant filtering op query params. Tenant isolatie werkt wel via authenticatie. |
| Grafana data source (JSON API) | ⚠️ Niet af | Vereist JSON API plugin installatie. Health dashboard draait als standalone HTML op poort 3002. |

**Next Steps (prioriteit):**
1. Drupal Frontend: Pagina ontwikkelen en integreren met RabbitMQ
2. Alle workflows testen en integreren om use cases te valideren
3. Testresultaten verwerken en afstemmen op bestaand werk
4. Iteratief proces vervolgen

---

## 4. Links naar Repositories & Documentatie

### 4.1 Git Repositories

| Repository | URL | Toegang |
|------------|-----|---------|
| **Garamatic (meta-repo)** | https://github.com/Garamatic/garamatic | **Public** |
| Ticket Masala | https://github.com/Garamatic/ticket-masala | **Public** |
| Mailing Service | https://github.com/Garamatic/mailing-service | **Public** |
| Event Planner | https://github.com/Garamatic/event-planner | **Public** |
| Garamatic Web | https://github.com/Garamatic/garamatic-web | **Public** |
| Masala Web | https://github.com/Garamatic/masala-web | **Public** |
| Agentic Service | https://github.com/Garamatic/agentic-service | **Public** |
| Odoo Integration | https://github.com/Garamatic/odoo-integration | **Public** |
| Integration Contracts | https://github.com/Garamatic/integration-contracts | **Public** |

### 4.2 Planning & Project Management

| Tool | URL | Toegang |
|------|-----|---------|
| [Kanban/Scrum Board, e.g. ClickUp/Jira/Trello] | [URL] | [Toegang] |
| [Planning Document] | [URL] | [Toegang] |

### 4.3 Documentatie

| Document | Locatie | Beschrijving |
|----------|---------|-------------|
| README.md | `garamatic/README.md` | Quick start, architectuur, commands |
| DESIGN.md | `garamatic/DIGN.md` | Design system (kleuren, typografie, componenten) |
| PRODUCT.md | `garamatic/PRODUCT.md` | Product visie, anti-references |
| Event Topology | `ticket-masala/docs/event-topology.html` | Visuele event flow diagram |
| Demo Flow | `garamatic/demo/DEMO-FLOW.md` | Demo script voor het 10-min filmpje |
| Demo Showcase | `garamatic/demo/showcase/` | 1 tenant demo portal |
| Integration Tests | `garamatic/integration-tests/` | 257+ geautomatiseerde tests |
| API Contracten | `garamatic/integration-contracts/` | JSON schemas voor 9 event types |

---

## 5. Aanmeldgegevens & Toegang

### 5.1 Lokale Development (Docker Compose)

| Service | URL | Login | Opmerking |
|---------|-----|-------|-----------|
| Ticket Masala API | http://localhost:8085 | — | API key: `masala-test-key` |
| Gatekeeper API | http://localhost:8086 | — | API key: `masala-test-key` |
| Mailing Service | http://localhost:8087 | — | Test mode (SendGrid optional) |
| Event Planner | http://localhost:8088 | — | Minimal test container |
| Garamatic Web | http://localhost:8090 | — | Static frontend |
| Masala Web | http://localhost:8091 | — | Marketing site |
| Agentic Service | http://localhost:3001 | — | API key: `garamatic-agentic-secret-key` |
| Odoo ERP | http://localhost:8092 | admin / admin | Eerste login: admin/admin |
| Odoo Bridge | http://localhost:8089 | — | Health check endpoint |
| RabbitMQ Mgmt | http://localhost:15672 | guest / guest | Management UI |
| Mailhog UI | http://localhost:8025 | — | Test email capture |
| Grafana | http://localhost:3000 | admin / admin | Health dashboard |
| Health Dashboard | http://localhost:3002 | — | Standalone HTML monitor |
| Ollama LLM | http://localhost:11434 | — | Local LLM inference |

### 5.2 Environment Variables

Kopieer `.env.example` naar `.env` en configureer:

```bash
# Required voor mailing
SENDGRID_API_KEY=SG.your-test-key

# Required voor gatekeeper
GATEKEEPER_API_KEY=masala-test-key

# Required voor agentic
AGENTIC_API_KEY=garamatic-agentic-secret-key

# Grafana admin
GRAFANA_ADMIN_PASSWORD=admin
```

### 5.3 Confluence / Documentatie Portal

| Systeem | URL | Login | Opmerking |
|---------|-----|-------|-----------|
| [Confluence / Notion / Wiki] | [URL] | [Login] | [Opmerking] |

---

## 6. Quick Start voor Reviewers

```bash
# 1. Clone repo
git clone --recursive https://github.com/Garamatic/garamatic.git
cd garamatic

# 2. Setup environment
cp .env.example .env

# 3. Start de stack
docker compose up --build -d

# 4. Start monitoring
docker compose -f docker-compose.monitoring.yml up -d

# 5. Run tests
make test

# 6. Check health
make monitor-up
# Open http://localhost:3002
```

---

## 7. Beoordelingscriteria Mapping

| Rubric | Ons Project | Verwachte Score |
|--------|-------------|-----------------|
| **Tussentijdse demo** | Extra: monitoring, backup, CI/CD, event topology docs | 16-20pt |
| **Flows** | Volledige CRUD, multi-tenant, 11/11 test suites passing | 40-50pt |
| **DevOps** | 3 pipelines (dev/test/prod), artifacts, GitHub Actions | 12-15pt |
| **Infrastructure** | Docker Compose, backups, restart policies, monitoring | 9-12pt |
| **Testing** | 257+ geautomatiseerde tests, CI/CD, E2E workflows | 8-10pt |
| **Errorhandling** | Health dashboard, logs, auto-restart, circuit breakers | 6-8pt |

---

**Gemaakt door:** [Team naam]
**Datum:** 2026-06-05
**Versie:** 1.0
