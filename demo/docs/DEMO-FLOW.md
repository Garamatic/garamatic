# Ticket Masala — Demo Video Script (max 10 minuten)

> **Doel:** In maximaal 10 minuten de kernfunctionaliteit, flows en multi-tenant architectuur van Ticket Masala tonen.
> **Taal:** Nederlands (presentatie) — de jury beoordeelt in het Nederlands.
> **Opstartpunt:** `http://localhost:8092` (Architecture Dashboard) of direct `http://localhost:8093` (Desgoffe Portal).
> **Voorbereiding:** `docker compose up --build -d` draaiend, alle services healthy.

---

## Tijdsindeling (totaal: ~9 min)

| Segment | Tijd | Wat je toont |
|---------|------|---------------|
| Intro | 0:30 | Project, team, technologieën |
| Flow 1: Multi-tenant Portal | 1:30 | Desgoffe citizen portal → ticket aanmaken |
| Flow 2: Ticket Lifecycle + AI | 2:00 | GERDA AI, assignment, status tracking |
| Flow 3: MCP AI Chat (WOW) | 2:00 | AI chat — ticket query, invoice, email |
| Flow 4: Invoicing + Odoo ERP | 2:00 | Ticket resolved → factuur in Odoo |
| Flow 5: Event Bus & Email | 1:00 | RabbitMQ, Mailhog — closing the loop |
| Outro | 0:30 | Samenvatting, repo link, live demo URL |

---

## Pre-Demo Checklist

```bash
cd /home/ehbstudent/garamatic
docker compose up --build -d
sleep 30
scripts/health-check.sh
```

- [ ] Alle services healthy (8085, 8086, 8087, 8089, 8092, 8093, 15672, 8025)
- [ ] Mailhog heeft minstens 1 test email
- [ ] Odoo bereikbaar op `localhost:8069` (admin/admin)
- [ ] Pre-seeded ticket aanwezig in Ticket Masala
- [ ] `OPENAI_API_KEY` gezet (of graceful error accepteren)

---

## Segment 0: Intro (0:00 — 0:30)

**Wat je toont:** Architecture Dashboard (`http://localhost:8092`)

**Wat je zegt:**
> "Dit is Ticket Masala — ons multi-tenant ticket management platform. We zijn een team van 4 personen: Juan, Aiko, Gijs, S. We hebben 1095 uur gewerkt aan een volledig containerized microservices-ecosysteem. Wat je hier ziet is onze architecture dashboard met alle 7 services live: Ticket Masala, Gatekeeper API, Agentic Service, Mailing Service, Odoo Bridge, Portal, en RabbitMQ als event bus."

**Screen:** Showcase pagina met service topology en health indicators.

---

## Segment 1: Multi-tenant Portal — Burger Melding (0:30 — 2:00)

**Wat je toont:** Desgoffe Citizen Portal (`http://localhost:8093`)

**Wat je zegt:**
> "Ticket Masala is multi-tenant. Elke tenant heeft zijn eigen branding, domeinen, workflows en data. Hier zie je de Ville de Desgoffe — een fictieve gemeente. Een burger kan hier een melding indienen."

**Click-by-click:**
1. Open `http://localhost:8093`
2. Toon de header: **"Ville de Desgoffe — Guichet Citoyen"**
3. Toon de form velden:
   - **Nom:** `Jean Dupont`
   - **Email:** `jean.dupont@citoyen.be`
   - **Type:** `Nuisance Sonore`
   - **Quartier:** `Centre-Ville`
   - **Priorité:** `Urgent`
   - **Description:** `"Luide bouwherrie om 6u. Geen vergunning zichtbaar."`
4. Klik **Submit** → toon success message

**Wat je zegt:**
> "De melding wordt direct in Ticket Masala geregistreerd. De burger krijgt een bevestiging. En achter de schermen wordt een event gepubliceerd naar alle services via RabbitMQ."

**Screen:** Browser split — links portal (8093), rechts RabbitMQ (15672).

---

## Segment 2: Ticket Lifecycle + GERDA AI (2:00 — 4:00)

**Wat je toont:** Ticket Masala (`http://localhost:8085`)

**Wat je zegt:**
> "We loggen in als manager. Hier zien we alle tickets. De GERDA AI sidebar analyseert elk ticket automatisch: complexiteit, prioriteit, tags, en een agent aanbeveling."

**Click-by-click:**
1. Login: `manager.john` / `Employee123!`
2. Open het net aangemaakte ticket (of een pre-seeded ticket)
3. Toon de **GERDA AI Insights** sidebar:
   - **Complexity:** X punten
   - **Priority Score:** Y
   - **AI Tags:** Auto-gegenereerd
   - **Recommended Agent:** `Sarah Chen`
4. Klik **"Assign to Sarah Chen"** → Save

**Wat je zegt:**
> "GERDA leest de beschrijving, schat de inspanning, berekent de prioriteit op basis van WSJF, en stelt de beste agent voor op basis van werklast en specialisatie. De assignment triggert opnieuw een event naar alle services."

**Screen:** Ticket detail pagina met GERDA sidebar.

---

## Segment 3: MCP AI Chat — De WOW Moment (4:00 — 6:00)

**Wat je toont:** Ticket Masala AI Chat (`http://localhost:8085` — ticket detail)

**Wat je zegt:**
> "Dit is ons meest indrukwekkende feature. De AI chat is geïntegreerd in elk ticket. De agent kent het ticket al — je hoeft niets uit te leggen. En het gebruikt MCP: Model Context Protocol. De AI kan rechtstreeks onze business tools aanroepen."

**Click-by-click:**
1. Klik op **"Ask AI about this ticket"** (paarse knop onderaan, of GERDA sidebar)
2. De chat opent en vraagt automatisch: *"I'm looking at ticket #XYZ. What can you tell me about it?"*
3. Wacht op het AI antwoord — toon ticket status, klant context
4. Type: **"Create a €200 invoice for this ticket"**
5. Wacht op bevestiging
6. Toon de **quick action buttons**:
   - Customer tickets
   - Customer context
   - Create invoice
   - Invoice status
   - This ticket
   - Invoice this ticket

**Wat je zegt:**
> "Dit is geen gewone chatbot. De AI heeft directe toegang tot onze MCP tools — dezelfde tools die Claude of GPT zouden gebruiken. Tickets opvragen, facturen aanmaken, emails versturen. De AI leest data én handelt."

**Screen:** Full screen ticket detail met AI chat panel open.

---

## Segment 4: Invoicing + Odoo ERP (6:00 — 8:00)

**Wat je toont:** Ticket Masala → Odoo ERP (`http://localhost:8069`)

**Wat je zegt:**
> "Wanneer een ticket is opgelost, wordt automatisch een factuur gegenereerd. We gebruiken Odoo ERP als ons factureringssysteem. De Odoo Bridge communiceert via JSON-RPC — Odoo Community Edition heeft geen REST API."

**Click-by-click:**
1. In Ticket Masala: zoek het ticket, klik **Edit**
2. Verander status naar **Completed**
3. Vul in:
   - **Resolution notes:** `"Contact gelegd met aannemer. Geen vergunning. Stopzetting bevolen."`
   - **Billable amount:** `€150.00`
4. Save
5. Switch naar Odoo (`http://localhost:8069`)
6. Login: `admin` / `admin`
7. Navigeer naar **Invoicing** → **Customers** → zoek `Jean Dupont`
8. Navigeer naar **Invoicing** → **Invoices** — toon de nieuwe factuur

**Wat je zegt:**
> "De factuur wordt automatisch aangemaakt in Odoo. Klantgegevens, servicebeschrijving, bedrag — alles komt uit het ticket. De factuur start in 'draft' en wordt direct gevalideerd naar 'posted'. De bridge houdt elke ticket bij in een LiteDB state machine — geen dubbele facturen."

**Screen:** Split screen — links Ticket Masala, rechts Odoo Invoices.

---

## Segment 5: Event Bus & Email — Closing the Loop (8:00 — 9:00)

**Wat je toont:** RabbitMQ (`http://localhost:15672`) + Mailhog (`http://localhost:8025`)

**Wat je zegt:**
> "De kracht van ons systeem zit in de event-driven architectuur. Eén event — ticket aangemaakt, assigned, of resolved — wordt naar drie queues gestuurd. Geen service roept een andere direct aan."

**Click-by-click:**
1. Open RabbitMQ (`http://localhost:15672`, guest/guest)
2. Toon **Exchanges** → `event_exchange` → **Bindings**
3. Toon 3 queues:
   - `agentic_consumer`
   - `mailing.queue`
   - `odoo-bridge`
4. Toon één bericht in de queue (payload)
5. Switch naar Mailhog (`http://localhost:8025`)
6. Toon de emails:
   - Ticket created notification
   - Assignment notification
   - Invoice created

**Wat je zegt:**
> "RabbitMQ fan-out: één bericht, drie consumers, zero coupling. Mailhog vangt alle emails op — we sturen geen echte emails in de demo. De klant krijgt notificaties op elke stap van het proces."

**Screen:** Split screen — links RabbitMQ bindings, rechts Mailhog inbox.

---

## Segment 6: Outro (9:00 — 9:30)

**Wat je toont:** Architecture Dashboard (`http://localhost:8092`)

**Wat je zegt:**
> "Dit was Ticket Masala. Multi-tenant. Event-driven. AI-geïntegreerd. Volledig containerized. Alle code is open source op GitHub. De live demo draait op [URL]. Bedankt voor jullie aandacht."

**Screen:** Architecture dashboard met alle groene health indicators. Overlay met:
- GitHub repo link
- Live demo URL
- Team namen

---

## Quick Reference — Tijdslijn

```
0:00  Intro — Architecture Dashboard
0:30  Flow 1 — Desgoffe Portal, ticket aanmaken
2:00  Flow 2 — Ticket Masala, GERDA AI, assignment
4:00  Flow 3 — MCP AI Chat, invoice aanmaken
6:00  Flow 4 — Ticket resolved, Odoo factuur
8:00  Flow 5 — RabbitMQ, Mailhog, event bus
9:00  Outro — Samenvatting, links
```

---

## Demo Tips

### De "Wow" Momenten
1. **MCP AI Chat** — Open de chat vanuit een ticket. De agent kent het ticket al. Vraag een factuur. Dit is de meest indrukwekkende feature.
2. **RabbitMQ Fan-Out** — Toon één event naar drie queues. Dit bewijst de architectuur.
3. **Odoo Auto-Invoice** — Ticket resolved → factuur in Odoo. Zero manual work.

### Wat je NIET toont
- Geen technische uitleg over Outbox Pattern, JSON-RPC, of LiteDB
- Geen Docker / Kubernetes / CI pipelines
- Geen code walkthrough
- Geen terminal commands (tenzij voor RabbitMQ queue inspectie)

### Pre-Seeding
Maak **voor** de demo al een ticket aan zodat je direct naar het AI chat moment kan springen als je tijd tekort komt.

```bash
# Pre-seed een ticket
curl -X POST http://localhost:8085/api/portal/submit \
  -F "CustomerName=Marie Curie" \
  -F "CustomerEmail=marie.curie@science.be" \
  -F "Description=Bouwhoerrie zonder vergunning" \
  -F "WorkItemType=NUISANCE" \
  -F "PriorityScore=10" \
  -F "Tenant=desgoffe"
```

### Screen Layout
- **Primair:** Browser (portal, Ticket Masala, Odoo)
- **Secundair:** RabbitMQ + Mailhog (klein venster rechts)
- **Terminal:** Alleen voor health-check, niet tijdens presentatie

---

## Troubleshooting

| Symptoom | Oplossing |
|----------|-----------|
| AI Chat zegt "unavailable" | `OPENAI_API_KEY` niet gezet — exporteer of toon graceful error |
| Geen email in Mailhog | Check `docker compose logs agentic-service` |
| Geen factuur in Odoo | Check Odoo Bridge logs, wacht op `odoo-db` healthy |
| RabbitMQ queue leeg | Check `docker compose logs ticket-masala` — OutboxPublisher draait? |
| Portal 404 | Check `docker compose logs portal` — Gatekeeper bereikbaar? |
| Demo te lang | Skip Segment 5 (RabbitMQ detail), focus op AI Chat + Odoo |
