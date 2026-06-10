![](images/image_1.png)

Documentation

A Configuration\-Driven Multi\-Tenant Workflow Platform

![](images/image_2.png)

Ticket Masala

Integration Project

Juan Benjumea Moreno \-\- Wito De Schrijver \-\- Maarten Görtz \-\- Charlotte Schröer

# <a id="_Toc232016394"></a>Index

[Index	1](#_Toc232016394)

[1\.	Introduction	5](#_Toc232016395)

[1\.1	The Integrations	5](#_Toc232016396)

[1\.1\.1	RabbitMQ – Message Broker	5](#_Toc232016397)

[1\.1\.2	Odoo 17 – ERP / Billing	5](#_Toc232016398)

[1\.1\.3	Agentic Service – MCP / AI Agent	5](#_Toc232016399)

[1\.1\.4	Website – Marketing Frontend	5](#_Toc232016400)

[1\.1\.5	SendGrid – Transactional Email	6](#_Toc232016401)

[1\.2	Motivation	6](#_Toc232016402)

[1\.3	Scope	6](#_Toc232016403)

[2\.	Ticket Masala	7](#_Toc232016404)

[2\.1	Project Concept	7](#_Toc232016405)

[2\.1\.1	The Problem	7](#_Toc232016406)

[2\.1\.2	The Solution	7](#_Toc232016407)

[2\.1\.3	Tenants Shipped	7](#_Toc232016408)

[2\.2	System Architecture	8](#_Toc232016409)

[2\.2\.1	Style: Modular Monolith	8](#_Toc232016410)

[2\.2\.2	Tenant Resolution	8](#_Toc232016411)

[2\.2\.3	Configuration Driven Behaviour	8](#_Toc232016412)

[2\.2\.4	High Level Component Diagram	9](#_Toc232016413)

[2\.3Technology Stack – Ticket Masala	9](#_Toc232016414)

[2\.4	Project Structure	10](#_Toc232016415)

[2\.5	Key Features	10](#_Toc232016416)

[2\.5\.1 Polymorphic Workflow Engine	10](#_Toc232016417)

[2\.5\.2	GERDA – Heuristic Inference Engine	11](#_Toc232016418)

[2\.5\.3	Event\-Driven Integration \(RabbitMQ \+ Outbox Pattern\)	11](#_Toc232016419)

[2\.5\.4	Data Sovereignty and Security	12](#_Toc232016420)

[3\.	Odoo ERP Integration	13](#_Toc232016421)

[3\.1	Purpose and Context	13](#_Toc232016422)

[3\.2	Architecture Overview	13](#_Toc232016423)

[3\.3	JSON RPC	14](#_Toc232016424)

[3\.4	Technical Integration Patterns	14](#_Toc232016425)

[3\.4\.1	Stateful Authentication	14](#_Toc232016426)

[3\.4\.2	Nested Array Syntax for Relations	14](#_Toc232016427)

[3\.4\.3	Mandatory Invoice Validation	14](#_Toc232016428)

[3\.4\.4	Payment Status Polling	15](#_Toc232016429)

[3\.4\.5	Asynchronous PDF Generation	15](#_Toc232016430)

[3\.5	Odoo Model Mapping	15](#_Toc232016431)

[3\.6	Published Events	15](#_Toc232016432)

[3\.7	Configuration	16](#_Toc232016433)

[3\.8	Quick Start – Local Setup	16](#_Toc232016434)

[3\.9	Common Issues and Fixes	17](#_Toc232016435)

[4\.	Agentic Service – MCP & AI Agent	18](#_Toc232016436)

[4\.1	Purpose	18](#_Toc232016437)

[4\.2	Architecture	18](#_Toc232016438)

[4\.3	Available MCP Tools	19](#_Toc232016439)

[4\.4	Claude Desktop Integration	19](#_Toc232016440)

[4\.5	LangGraph Agent	20](#_Toc232016441)

[4\.6	Event Consumer Workflows	20](#_Toc232016442)

[4\.7	REST API Endpoints	20](#_Toc232016443)

[4\.8	Configuration	21](#_Toc232016444)

[5\.	Marketing Website	22](#_Toc232016445)

[5\.1	Purpose	22](#_Toc232016446)

[5\.2	Technology Stack	22](#_Toc232016447)

[5\.3	Project Structure	22](#_Toc232016448)

[5\.4	Key Features	23](#_Toc232016449)

[5\.4\.1	Multi\-Theme Support	23](#_Toc232016450)

[5\.4\.2	Internationalisation \(i18n\)	23](#_Toc232016451)

[5\.4\.3	Accessibility	23](#_Toc232016452)

[5\.4\.4	Responsive Design	23](#_Toc232016453)

[5\.5	Deployment	24](#_Toc232016454)

[5\.6	Ecosystem Integration	24](#_Toc232016455)

[6\.	SendGrid Email Integration	25](#_Toc232016456)

[6\.1	Purpose	25](#_Toc232016457)

[6\.2	Architecture	25](#_Toc232016458)

[6\.3	Implementation	25](#_Toc232016459)

[6\.4	Events That Trigger Emails	26](#_Toc232016460)

[6\.5	HTML Email Templates	26](#_Toc232016461)

[6\.6	Benefits	26](#_Toc232016462)

[7\.	Garamatic Meta Repository & Ecosystem Architecture	27](#_Toc232016463)

[7\.1	Overview	27](#_Toc232016464)

[7\.2	Complete Service Inventory	27](#_Toc232016465)

[7\.3	Meta\-Repository Structure	28](#_Toc232016466)

[7\.4	Developer Workflow	28](#_Toc232016467)

[7\.4\.1	Getting Started	28](#_Toc232016468)

[7\.4\.2	Daily Commands	29](#_Toc232016469)

[7\.4\.3	Submodule Golden Rule	29](#_Toc232016470)

[7\.5	Integration Testing	30](#_Toc232016471)

[7\.6 Integration Contracts	30](#_Toc232016472)

[8\.	Testing & CI/CD	31](#_Toc232016473)

[8\.1	Test Pyramid	31](#_Toc232016474)

[8\.2	Running the Tests	31](#_Toc232016475)

[8\.3	Coverage	31](#_Toc232016476)

[8\.4	CI/CD Pipeline	32](#_Toc232016477)

[9\.	Live Deployment & URL’s	33](#_Toc232016478)

[9\.1	Production Environment	33](#_Toc232016479)

[9\.2	Using the Live URLs in the Demo	33](#_Toc232016480)

[9\.3	Demo Login Credentials	33](#_Toc232016481)

[9\.4	Environment Variables	33](#_Toc232016482)

[10	Demo Flow	35](#_Toc232016483)

[10\.1	Step 1: Customer Creates Ticket	35](#_Toc232016484)

[10\.2	Step 2: RabbitMQ Processes the Event	35](#_Toc232016485)

[10\.3	Step 3: Mailing Service Sends Confirmation Email	35](#_Toc232016486)

[10\.4	Step 4: Ticket Gets Assigned	36](#_Toc232016487)

[10\.5	Step 5: Ticket Gets Resolved	36](#_Toc232016488)

[10\.6	Step 6: Invoice Automatically Created in Odoo	36](#_Toc232016489)

[10\.7	Invoice Email Sent to Customer	37](#_Toc232016490)

[11	Lessons Learned	38](#_Toc232016491)

[11\.4	What Worked Well	38](#_Toc232016492)

[11\.5	Challenges	38](#_Toc232016493)

[11\.3	 Key Takeaways	38](#_Toc232016494)

[11\.4	Future Work	39](#_Toc232016495)

[12	Conclusion	40](#_Toc232016496)

# <a id="_Toc232016395"></a>Introduction

The platform's central idea is deceptively simple: instead of building separate ticketing systems for every organisational domain \(government, IT, infrastructure\), a single application core adapts its behaviour at runtime by injecting a configurable 'personality'\. This approach — called a Polymorphic Workflow Engine — is what distinguishes Ticket Masala from conventional ticketing solutions\.

## <a id="_Toc232016396"></a>The Integrations

A central focus of this project is the integration of Ticket Masala with five external systems, each serving a distinct role in the overall ecosystem\.

All backend integrations are event\-driven and loosely coupled: no service calls another service directly\. The marketing website and agentic service connect to the platform via REST APIs and the shared RabbitMQ event stream\. RabbitMQ remains the only shared dependency between backend services\.

### <a id="_Toc232016397"></a>RabbitMQ – Message Broker

__Technology:__ AMQP / Event Bus

__Purpose:__ Decouples all services via async events\. Every integration in this project flows through RabbitMQ — it is the communication backbone of the entire ecosystem\. This ensures all messages are accounted for since RabbitMQ has an acknowledgement flag\. Even when some systems are temporarily down, the message will remain on the exchange until consumed by our services\. Because of this system, all our services are decoupled from one another and manage to continue working without depending on each other\.

### <a id="_Toc232016398"></a>Odoo 17 – ERP / Billing

__Technology:__ JSON\-RPC

__Purpose:__ Automatically creates customers and invoices in Odoo when a ticket is resolved\. Monitors payment status via polling and publishes payment events back to RabbitMQ

### <a id="_Toc232016399"></a>Agentic Service – MCP / AI Agent

__Technology:__ MCP \+ LangGraph \+ REST

__Purpose:__ Exposes all Garamatic services as AI\-callable tools via Model Context Protocol\. Includes a LangGraph agent for multi\-step reasoning, a REST API gateway, and an event consumer for automated workflows\.

### <a id="_Toc232016400"></a>Website – Marketing Frontend

__Technology:__ Vite \+ Tailwind \+ Handlebars

__Purpose:__ Standalone marketing website for the Ticket Masala platform\. Supports 3 tenant themes and 3 languages\. 1 tenant is connected with the RabbitMQ\. Deployed on Fly\.io and integrated into the full ecosystem via Docker Compose\.

### <a id="_Toc232016401"></a>SendGrid – Transactional Email

__Technology:__ REST API

__Purpose:__ Sends tenant\-aware transactional emails at every key lifecycle event: ticket created, assigned, resolved, invoice created, payment received, and invoice overdue\.

## <a id="_Toc232016402"></a>Motivation

Most existing ticketing tools are opinionated: they impose their own workflow model on the organisation\. Ticket Masala inverts that assumption\. Rather than forcing an organisation to adapt to the software, the software adapts to the organisation through YAML\-driven configuration\. A municipal government bureau and a SaaS start\-up have fundamentally different concepts of what a 'ticket' is, how it should flow, and who may act on it\. Ticket Masala serves both from a single deployable artefact\.

## <a id="_Toc232016403"></a>Scope

This document covers:

- Project context and concept – Ticket Masala
- System architecture and design decisions
- Technology stack and integration points
- Key features and modules
- RabbitMQ event\-driven integration
- Odoo ERP billing integration
- SendGrid transactional email integration
- Desgoffe marketing website
- Agentic Service — MCP server, LangGraph agent, REST API gateway
- Testing strategy and CI/CD pipeline
- Deployment approach
- Demo flow — end\-to\-end scenario
- Lessons learned and reflections

# <a id="_Toc232016404"></a>Ticket Masala

## <a id="_Toc232016405"></a>Project Concept

### <a id="_Toc232016406"></a>2\.1\.1	The Problem

Organizations that operate across multiple departments or domains frequently maintain separate ticket\-management tools per unit, each with its own user base, access rules, and workflow logic\. This proliferation leads to:

- Duplicated infrastructure and maintenance cost
- Inconsistent user experiences across domains
- Difficulty integrating cross\-domain reporting
- High onboarding friction when adding new organizational units

### <a id="_Toc232016407"></a>2\.1\.2	The Solution

Ticket Masala introduces the concept of a Tenant Personality — a runtime configuration bundle that specifies:

- Workflow state machine \(which states exist, which transitions are allowed\)
- Business rules \(who can approve, what constitutes a violation\)
- UI theme \(visual identity, accessible contrast modes\)
- RBAC policy \(which roles exist and which fields they can see\)
- Compliance constraints \(e\.g\., GDPR rules for the Tax domain\)

Because all of this is externalised into YAML, adding a new 'personality' requires no code changes — only a new configuration file and seed data\.

### <a id="_Toc232016408"></a>2\.1\.3	Tenants Shipped

#### 2\.1\.3\.1	Desgoffe

__Domain:__ Goverment

__Personality__: Strict hierarchy, formal language, bureaucratic approval steps \(e\.g\., Mayor's Stamp\)\. Citizens can only file complaints; no dashboard access\.

#### *2\.1\.3\.2	Liberty*

__Domain:__ SaaS / Tech

__Personality:__ Agile workflows, git\-style commits, CI/CD pipeline visibility\. Distinct sub\-roles: DevOps Lead vs\. Support Rep\.

#### 2\.1\.3\.3	Whitman

__Domain:__ Infrastructure

__Personality: __High\-contrast UI, large controls, foreman\-oriented view\. Designed for field use\.

## <a id="_Toc232016409"></a>2\.2	System Architecture

### <a id="_Toc232016410"></a>2\.2\.1	Style: Modular Monolith

Ticket Masala is implemented as a Modular Monolith\. This choice was deliberate and appropriate for a team of four working within a single academic semester:

- A microservices split would introduce inter\-service network overhead and deployment complexity without yielding commensurate benefit at this scale\.
- A pure monolith would couple concerns that need clear boundaries \(e\.g\., workflow logic should not bleed into tenant resolution\)\.
- The modular monolith provides strong internal separation while shipping as a single deployable binary\.

The architecture nevertheless supports Physical Isolation \(each tenant on a separate host\) and Logical Partitioning \(multiple tenants on the same host, isolated by row\-level data filters\)\.

### <a id="_Toc232016411"></a>2\.2\.2	Tenant Resolution

When a request arrives, the Tenant Resolution Strategy examines the HTTP host header \(or a query parameter in development\) and maps it to the correct personality\. The resolved tenant ID is stored in the request context and flows through all downstream services via dependency injection\.

This makes every service tenant\-aware without polluting the domain model with multi\-tenancy concerns\.

### <a id="_Toc232016412"></a>2\.2\.3	Configuration Driven Behaviour

The file config/masala\_domains\.yaml is the 'brain transplant' configuration\. It drives:

- Allowed ticket statuses and valid state transitions
- Approval chain definitions \(who must sign off, in what order\)
- Field\-level visibility rules per role
- UI theme tokens \(primary colour, logo path, density\)
- GERDA heuristic weights \(see Section 4\.2\)

### <a id="_Toc232016413"></a>2\.2\.4	High Level Component Diagram

__Request / Browser__

__ASP\.NET Core MVC \+ HTMX__

__SQLite \+ EF Core__

__User Interface Layer__

Razor Views rendered server\-side\. HTMX handles partial page updates without full round\-trips\.

__Application Core__

Controllers, Workflow Engine, GERDA, Tenant Strategy, Outbox Publisher\.

__Persistence Layer__

SQLite in WAL mode\. EF Core migrations\. Outbox table for reliable event delivery\.

## <a id="_Toc232016414"></a>2\.3Technology Stack – Ticket Masala

__Layer__

__Technology__

__Rationale__

Runtime

\.NET 10

Latest LTS\-candidate with significant performance improvements\. Native AOT readiness for future deployment optimisations\.

Web Framework

ASP\.NET Core MVC

Mature, well\-documented framework with strong Razor view engine\. Server\-side rendering suits the polymorphic UI model\.

Interactivity

HTMX

Enables partial page updates via HTML attributes, avoiding a full JavaScript SPA framework while maintaining responsive UX\.

ORM

Entity Framework Core

Type\-safe database access with migration support\. Integrates cleanly with SQLite\.

Database

SQLite \(WAL mode\)

Zero\-configuration, file\-based database\. Ideal for single\-server and air\-gapped deployments\. WAL mode enables concurrent readers\.

Message Broker

RabbitMQ

Industry\-standard AMQP broker\. Supports durable queues and topic exchanges needed for the integration event contract\.

Containerisation

Docker \+ Fly\.io

Docker Compose for local multi\-service orchestration\. Fly\.io for cloud deployment with low\-friction scaling\.

CI/CD

GitHub Actions

Automated build, test, and coverage pipeline triggered on every pull request\.

## <a id="_Toc232016415"></a>2\.4	Project Structure

The repository follows a Modular Monolith layout with clear separation between infrastructure, application, and domain concerns\.

ticket\-masala/

├── src/

│   └── TicketMasala\.Web/

│       ├── Engine/              \# Core runtime brain

│       │   ├── GERDA/           \# Heuristic inference engine

│       │   ├── Tenants/         \# Tenant resolution strategy

│       │   └── Workflows/       \# State machines \(Gov vs Tech\)

│       ├── Controllers/         \# MVC endpoint controllers

│       └── Views/               \# Razor pages \(polymorphic UI\)

├── config/

│   ├── masala\_domains\.yaml      \# Tenant personality configuration

│   └── seed\_data\.json           \# Demo / development seed data

├── docs/                        \# Additional documentation

├── scripts/                     \# Developer utility scripts

├── tenants/\_template/           \# Scaffold for new tenant personalities

├── Dockerfile

├── docker\-compose\.yml

└── TicketMasala\.sln

The Engine directory is the most critical module\. It houses:

- GERDA: The heuristic triage and compliance engine\. Fully self\-contained — no external I/O at inference time\.
- Tenants: The ITenantResolutionStrategy interface and its implementations\. At startup, the active strategy is injected based on configuration\.
- Workflows: One state machine definition per tenant personality\. Each machine is loaded from YAML and compiled into a transition graph at application start\.

## <a id="_Toc232016416"></a>2\.5	Key Features

### <a id="_Toc232016417"></a>2\.5\.1 Polymorphic Workflow Engine

The workflow engine is the heart of Ticket Masala\. It implements a state machine whose states, transitions, guards, and actions are fully configurable per tenant\. At startup, the engine reads the YAML configuration and constructs an in\-memory graph of valid state transitions\.

When a user attempts to move a ticket from one state to another, the engine:

- Checks that the transition exists in the graph for this tenant\.
- Evaluates all guards \(e\.g\., 'only a Mayor\-level user may approve'\)\.
- Executes side\-effect actions \(e\.g\., sending a notification, publishing a domain event\)\.
- Persists the new state atomically with the event to the Outbox table\.

Because the state machine is data\-driven, adding a new approval step to the Desgoffe government tenant requires only a YAML edit — no recompilation\.

### <a id="_Toc232016418"></a>2\.5\.2	GERDA – Heuristic Inference Engine

GERDA \(the embedded heuristic agent\) is not a large language model and does not call any external AI API\. Instead it is a local, deterministic rules engine that analyses ticket metadata to assist agents\. Its capabilities include:

- Ticket Triage: Analyses the ticket title and description against a weighted keyword corpus to assign a Hemisphere \(e\.g\., Support vs\. DevOps vs\. Compliance\)\. The weights are configurable per tenant in YAML\.
- Effort Estimation: Uses historical ticket resolution times to predict an effort band \(S / M / L / XL\) for incoming tickets of a given category\.
- Compliance Flagging: Scans field values for tenant\-specific rule violations before a ticket is submitted\. For the Tax domain, this includes GDPR\-relevant field combinations\.

GERDA deliberately avoids cloud AI dependencies to support air\-gapped deployment scenarios required by some government tenants\.

## <a id="_Toc232016419"></a>2\.5\.3	Event\-Driven Integration \(RabbitMQ \+ Outbox Pattern\)

Ticket Masala integrates with downstream systems through a reliable event\-driven mechanism\. The integration contract follows a snake\_case naming convention under the exchange garamatic\.events\.

__Event__

__Routing Key__

__Purpose__

ticket\.created

event\.ticket\.created

Notifies downstream services that a new ticket has entered the system\.

ticket\.assigned

event\.ticket\.assigned

Triggers SLA clock start in external monitoring tools\.

ticket\.resolved

event\.ticket\.resolved

Triggers billing workflows and customer satisfaction surveys\.

The Outbox Pattern ensures atomic consistency: a ticket state change and its corresponding event are written in the same database transaction\. A background service \(OutboxPublisher\) drains undelivered messages to RabbitMQ with configurable retry logic, guaranteeing at\-least\-once delivery even in the event of a broker outage\.

### <a id="_Toc232016420"></a>2\.5\.4	Data Sovereignty and Security

Government and infrastructure tenants often operate in environments with strict data residency requirements\. Ticket Masala addresses this through:

- Federated Deployment: Each tenant node can run in complete isolation — separate host, separate database file\. No shared runtime state between tenant nodes\.
- Air\-Gapped Support: GERDA's local\-only heuristics and SQLite's file\-based storage mean the application can function entirely offline\. There is no hard dependency on external cloud services\.
- SQLite WAL Mode: Write\-Ahead Logging maximises concurrent read throughput without requiring a dedicated database server process\.
- Role\-Based Access Control \(RBAC\): Permissions are enforced at the field level\. A Citizen in the Desgoffe tenant cannot view the internal notes field that a Bureaucrat can\.

# <a id="_Toc232016421"></a>Odoo ERP Integration

## <a id="_Toc232016422"></a>Purpose and Context

One of the core integration deliverables is the odoo\-bridge service: a \.NET Worker that connects Ticket Masala's event stream to an Odoo 17 ERP instance for automated billing\. When a ticket is resolved and marked as billable, the bridge automatically creates the corresponding customer record and invoice in Odoo — without any manual intervention\.

This service is an independent \.NET Worker process that runs alongside Ticket Masala and communicates with Odoo exclusively via its JSON\-RPC API\.

## <a id="_Toc232016423"></a>Architecture Overview

The bridge follows an event\-driven architecture with asynchronous processing\. The data flow is:

- ticket\-masala publishes a ticket\.resolved event to the shared RabbitMQ exchange\.
- odoo\-bridge consumes the event and authenticates with Odoo via JSON\-RPC\.
- The bridge looks up or creates the customer \(res\.partner\) in Odoo\.
- The bridge creates a draft invoice \(account\.move\) and immediately validates it via action\_post\.
- A background polling loop monitors payment status \(Odoo Community Edition has no webhook support\)\.
- The bridge publishes invoice\.created, payment\.received, and invoice\.overdue events back to RabbitMQ for downstream consumers\.

__Component__

__Technology__

__Role__

__Protocol__

__Notes__

ticket\-masala

\.NET 10

Event producer

AMQP

Publishes ticket\.resolved

RabbitMQ

AMQP broker

Message bus

AMQP

Shared with core platform

odoo\-bridge

\.NET Worker

Integration adapter

JSON\-RPC

Stateless, retryable

Odoo 17

Python / ERP

Billing system

JSON\-RPC

Runs in Docker

PostgreSQL

Database

Odoo persistence

Internal

Managed by Odoo container

## <a id="_Toc232016424"></a>JSON RPC

Odoo Community Edition does not provide a REST API\. All programmatic access goes through JSON\-RPC calls posted to /jsonrpc\. This is an important design constraint that shaped the entire integration:

- Every call is an HTTP POST — method semantics \(GET / PUT / DELETE\) do not exist\.
- Odoo uses internal model names that differ from the business concepts they represent \(see Section 11\.5\)\.
- Authentication is stateful: a call to authenticate\(\) returns a numeric UID that must accompany every subsequent request together with the password\.
- API key support is not available without installing an additional module \(auth\_api\_key\)\.

The bridge wraps all of these quirks behind a clean C\# OdooClient abstraction, so the rest of the application never has to deal with raw JSON\-RPC\.

## <a id="_Toc232016425"></a>Technical Integration Patterns

### <a id="_Toc232016426"></a>Stateful Authentication

Odoo authentication is a two\-step process\. First, authenticate\(\) is called to obtain a UID integer\. All subsequent calls pass this UID plus the plaintext password\. The bridge caches the UID in memory and re\-authenticates on failure\.

### <a id="_Toc232016427"></a>3\.4\.2	Nested Array Syntax for Relations

Creating invoice line items requires Odoo's special tuple syntax for many2many and one2many relations\. A value of \[0, 0, \{\.\.\.\}\] instructs Odoo to create a new linked record:

invoice\_line\_ids = new\[\] \{

    new object\[\] \{ 0, 0, new \{

        name     = "Ondersteuning Ticket \#123",

        quantity = 1,

        price\_unit = 150\.00,

        account\_id = 21

    \}\}

\}

### <a id="_Toc232016428"></a>3\.4\.3	Mandatory Invoice Validation

Newly created invoices start in draft status\. They cannot be paid until explicitly validated by calling action\_post on the account\.move record\. The bridge always calls this immediately after creation\.

### <a id="_Toc232016429"></a>3\.4\.4	Payment Status Polling

Because Odoo Community Edition offers no webhooks, the bridge uses a configurable polling loop \(default every 5 minutes\) that reads the payment\_state field on account\.move\. While this introduces latency, it avoids any dependency on Odoo's internals or additional modules\.

### <a id="_Toc232016430"></a>3\.4\.5	Asynchronous PDF Generation

Generating a PDF invoice requires creating an account\.move\.send wizard instance, calling action\_send\_and\_print, and extracting the base64\-encoded PDF from the response\. This is the only available method in Community Edition\.

## <a id="_Toc232016431"></a>Odoo Model Mapping

Odoo's internal model names are not always intuitive\. The table below documents the mapping used by the bridge:

__Business Concept__

__Odoo Model__

__Key Notes__

Invoice \(outgoing\)

account\.move

move\_type must be 'out\_invoice'\. Renamed from account\.invoice in v13\.

Customer

res\.partner

customer\_rank must be > 0\. Field is partner\_id, not customer\_id\.

Product / service

product\.product

Used as line item reference\.

Company / tenant

res\.company

Multi\-tenant context; database name must be passed in every call\.

Invoice total

amount\_total

Field naming is inconsistent across Odoo versions; verify with fields\_get\.

## <a id="_Toc232016432"></a>Published Events

After processing, the bridge publishes the following events back to RabbitMQ:

__Event__

__Routing Key__

__Trigger__

invoice\.created

event\.invoice\.created

Invoice successfully created and validated in Odoo\.

payment\.received

event\.payment\.received

Polling detects payment\_state = 'paid'\.

invoice\.overdue

event\.invoice\.overdue

Invoice past due date without payment\.

## <a id="_Toc232016433"></a>Configuration

The bridge is configured via environment variables or appsettings\.json:

__Variable__

__Default__

__Description__

Odoo\_\_BaseUrl

http://localhost:8069

Odoo instance URL

Odoo\_\_Database

odoo

Database name \(required in every JSON\-RPC call\)

Odoo\_\_Username

admin

Odoo user for authentication

Odoo\_\_Password

admin

Password stored in config \(no API key support in Community\)

Odoo\_\_DefaultIncomeAccountId

21

Account ID for invoice line items \(verify in your chart of accounts\)

RabbitMQ\_\_HostName

localhost

RabbitMQ broker host

RabbitMQ\_\_ExchangeName

event\_exchange

Exchange shared with ticket\-masala

## <a id="_Toc232016434"></a>Quick Start – Local Setup

The complete stack \(ticket\-masala \+ RabbitMQ \+ Odoo \+ odoo\-bridge\) is started with a single command:

docker\-compose up \-d

On first run, Odoo initialises its PostgreSQL database \(allow 2–3 minutes\)\. Then:

- Navigate to http://localhost:8069 and create a database named odoo\.
- Install the Invoicing \(account\) module and the Belgium — Accounting localisation\.
- Note the ID of your Sales income account \(Facturering → Configuratie → Rekeningschema\) and set Odoo\_\_DefaultIncomeAccountId accordingly\.

To trigger a test invoice, resolve a ticket in ticket\-masala:

curl \-X POST http://localhost:5000/api/tickets/123/resolve \\

  \-H "Content\-Type: application/json" \\

  \-d '\{"resolution\_notes": "Opgelost\!", "billable\_amount": 150\.00\}'

Monitor the bridge output with:

docker\-compose logs \-f odoo\-bridge

## <a id="_Toc232016435"></a>Common Issues and Fixes

__Symptom__

__Resolution__

Authentication failed

Verify the database name matches exactly\. Community Edition requires username \+ password — API keys are not supported without an extra module\.

Model not found

The required Odoo module is not installed \(e\.g\., account for invoices\)\. Also check for renamed models \(account\.invoice → account\.move in v13\+\)\.

Invoice stays in draft

action\_post was not called after creation, or mandatory fields \(partner\_id, invoice\_line\_ids\) are missing\.

Cannot modify after validation

The invoice must be reset to draft before editing\. For the bridge, this should not occur under normal operation\.

Invalid field error

Field name is wrong or module not installed\. Use Odoo's fields\_get method call to discover available fields at runtime\.

# <a id="_Toc232016436"></a>Agentic Service – MCP & AI Agent

## <a id="_Toc232016437"></a>4\.1	Purpose

The Agentic Service is the most forward\-looking integration in the Garamatic ecosystem\. It exposes the entire Ticket Masala platform — tickets, invoices, emails, and customer context — as AI\-callable tools via the Model Context Protocol \(MCP\)\. This allows AI agents such as Claude or GPT to interact with Garamatic services in natural language, automating multi\-step workflows that would otherwise require manual navigation of the UI\.

The service consists of four independent components that can be run separately or together:

- MCP Server — for AI agent integration \(Claude Desktop, GPT plugins\)\.
- REST API — for web and mobile client integration\.
- Event Consumer — for automated RabbitMQ\-driven workflows\.
- LangGraph Agent — for intelligent multi\-step reasoning with human\-in\-the\-loop approval\.

## <a id="_Toc232016438"></a>4\.2	Architecture

The agentic service sits above the existing Garamatic services and orchestrates them through their existing interfaces — REST APIs and RabbitMQ events\. It introduces no new direct database dependencies\.

__Component__

__Protocol__

__Description__

MCP Server

stdio / MCP

Exposes Garamatic tools as MCP resources\. Integrates with Claude Desktop via the MCP configuration file\. Runs on stdio for local agent use\.

REST API

HTTP / REST

Full CRUD gateway for tickets, invoices, and emails\. OpenAPI docs at /docs\. Port 3001\.

Event Consumer

AMQP / RabbitMQ

Listens for RabbitMQ events and triggers automated workflows \(e\.g\., invoice\.paid → send thank\-you email\)\.

LangGraph Agent

Python / OpenAI

Intelligent multi\-step agent with conversation memory, customer context analysis, and human approval gates for large invoices \(€500\+\)\.

## <a id="_Toc232016439"></a>4\.3	Available MCP Tools

The MCP server exposes the following tools to AI agents:

__Tool__

__Description__

get\_ticket\_status

Retrieve the current status of a specific ticket by ID\.

list\_customer\_tickets

List all tickets associated with a customer email address\.

create\_ticket

Create a new support ticket on behalf of a customer\.

resolve\_ticket

Resolve a ticket with optional resolution notes and billable amount\.

create\_invoice

Create an invoice for a resolved ticket in Odoo via the odoo\-bridge\.

get\_invoice\_status

Check whether an invoice has been paid\.

send\_email

Send a transactional email to a customer via the mailing service\.

In addition to tools, the MCP server exposes two context resources that AI agents can read to understand the state of the system before acting:

- customer://\{email\} — Full customer profile aggregated across all services \(open tickets, invoices, history\)\.
- ticket://\{id\} — Ticket details including all related invoices and communication history\.

## <a id="_Toc232016440"></a>4\.4	Claude Desktop Integration

To connect the MCP server to Claude Desktop, the following configuration is added to the Claude Desktop config file:

\{

  "mcpServers": \{

    "garamatic": \{

      "command": "uv",

      "args": \["run", "garamatic\-mcp"\],

      "cwd": "/path/to/agentic\-service"

    \}

  \}

\}

After restarting Claude Desktop, all Garamatic tools are available in the conversation\. Claude can then perform multi\-step workflows in natural language — for example: look up a customer's open tickets, resolve one, create an invoice, and send a confirmation email — in a single conversation\.

## <a id="_Toc232016441"></a>4\.5	LangGraph Agent

The LangGraph agent goes beyond single tool calls\. It implements a planning loop with:

- Multi\-step reasoning: The agent can chain tool calls — for example, retrieve customer context, check ticket status, resolve the ticket, create an invoice, and send an email — all from a single natural\-language instruction\.
- Conversation memory: The agent retains context across turns in a session, so follow\-up instructions can reference earlier actions\.
- Human\-in\-the\-loop approval: Invoices over €500 require explicit human confirmation before the agent proceeds\. This is a safety gate for high\-value financial operations\.

Tool orchestration with fallback: If a tool call fails, the agent retries with adjusted parameters or reports the issue rather than silently failing\.

## <a id="_Toc232016442"></a>4\.6	Event Consumer Workflows

The event consumer automates recurring workflows triggered by RabbitMQ events, removing the need for manual follow\-up:

__Event__

__Automated Action__

invoice\.paid

Send a thank\-you email to the customer confirming payment receipt\.

invoice\.sent

Notify the customer that a new invoice has been issued\.

ticket\.escalated

Alert the responsible manager via email\.

ticket\.created

Send an acknowledgement confirmation to the customer\.

## <a id="_Toc232016443"></a>4\.7	REST API Endpoints

The REST API gateway exposes all Garamatic capabilities over HTTP for non\-AI clients such as web apps, mobile apps, and scripts:

GET  /health                        \# Service health check

GET  /tickets/\{id\}                  \# Get ticket by ID

GET  /tickets                       \# List tickets \(filterable\)

POST /tickets                       \# Create new ticket

POST /tickets/\{id\}/resolve          \# Resolve a ticket

GET  /invoices/by\-ticket/\{id\}       \# Get invoice for a ticket

POST /invoices                      \# Create invoice

POST /emails                        \# Send email

GET  /customers/\{email\}/context     \# Full customer context

All endpoints include input validation, request tracing, and structured error responses\. OpenAPI documentation is available at http://localhost:3001/docs\.

## <a id="_Toc232016444"></a>4\.8	Configuration

__Variable__

__Default__

__Description__

TICKET\_API\_URL

http://localhost:5000

Base URL for the ticket\-masala REST API\.

ODOO\_BRIDGE\_URL

http://localhost:5001

Base URL for the odoo\-bridge REST API\.

RABBITMQ\_HOST

localhost

RabbitMQ broker hostname\.

RABBITMQ\_PORT

5672

RabbitMQ AMQP port\.

OPENAI\_API\_KEY

\(required for agent\)

OpenAI API key used by the LangGraph agent\.

LOG\_LEVEL

INFO

Logging verbosity\.

# <a id="_Toc232016445"></a>Marketing Website

## <a id="_Toc232016446"></a>5\.1	Purpose

The Ticket Masala platform ships with a standalone marketing website — masala\-web — that presents the platform to prospective customers and serves as a public\-facing entry point for each tenant\. Rather than being a generic landing page, the site is itself a showcase of Ticket Masala's core concept: a single codebase that renders completely different visual identities depending on the active tenant theme\.

For the Desgoffe government tenant in particular, the site reflects the formal, bureaucratic aesthetic of the domain — reinforcing the platform's multi\-tenant personality system beyond the application itself\.

## <a id="_Toc232016447"></a>5\.2	Technology Stack

__Technology__

__Version__

__Role__

Vite

5\.x

Build tool and development server\. Produces a highly optimised static bundle \(~560 ms build time\)\.

Tailwind CSS

3\.4

Utility\-first CSS framework with custom design tokens per tenant theme\.

Handlebars

Latest

Template engine for partials — each page section \(nav, hero, features, etc\.\) is an independent \.hbs partial\.

PostCSS

Latest

CSS processing pipeline used by Tailwind\.

Node\.js

18\+

Runtime for the build pipeline\.

## <a id="_Toc232016448"></a>5\.3	Project Structure

masala\-web/

├── index\.html              \# Main HTML entry point

├── src/

│   ├── main\.js             \# JavaScript entry \(imports CSS \+ logic\)

│   ├── input\.css           \# Tailwind CSS with all tenant styles

│   └── partials/           \# Handlebars page section templates

│       ├── nav\.hbs         \# Navigation bar

│       ├── hero\.hbs        \# Hero / banner section

│       ├── features\.hbs    \# Feature highlights

│       ├── solutions\.hbs   \# Per\-tenant solution overview

│       ├── architecture\.hbs\# Architecture diagram section

│       ├── testimonials\.hbs\# Customer testimonials

│       └── footer\.hbs      \# Footer

├── images/                 \# Logos and tenant assets

├── vite\.config\.js

├── tailwind\.config\.js      \# Tenant design tokens

└── postcss\.config\.js

## <a id="_Toc232016449"></a>5\.4	Key Features

### <a id="_Toc232016450"></a>5\.4\.1	Multi\-Theme Support

The site supports five distinct visual themes, one per tenant personality:

__Theme__

__Visual Identity__

Core

Default neutral theme — clean and professional\.

Desgoffe

Formal government aesthetic — structured layout, authoritative typography, muted official palette\.

Whitman

High\-contrast, large\-control industrial theme designed for field use\.

Liberty

Modern tech/SaaS aesthetic — vibrant, agile, developer\-friendly\.

Hennessey

Premium / enterprise visual identity\.

Theme selection is driven by the same YAML configuration that powers the application — the website and the platform share the same tenant identity system\.

### <a id="_Toc232016451"></a>5\.4\.2	Internationalisation \(i18n\)

The site ships with complete translations for three languages: English \(EN\), Dutch \(NL\), and French \(FR\)\. This is directly relevant for the Belgian deployment context of the Desgoffe government tenant, which operates in a multilingual environment\.

### <a id="_Toc232016452"></a>5\.4\.3	Accessibility

The site implements accessibility best practices: skip links for keyboard navigation, ARIA attributes on interactive elements, visible focus states, and sufficient colour contrast in all five themes\.

### <a id="_Toc232016453"></a>5\.4\.4	Responsive Design

The layout is mobile\-first with an offcanvas navigation menu for small screens — ensuring the marketing site is usable across all devices, from desktop to mobile\.

## <a id="_Toc232016454"></a>5\.5	Deployment

The site is deployed as a static build to Fly\.io, consistent with the rest of the Garamatic ecosystem:

\# Build static assets

npm run build

\# Deploy to Fly\.io

fly deploy

The compiled dist/ directory can also be deployed to any static hosting provider \(Netlify, Vercel, GitHub Pages\) without modification\.

## <a id="_Toc232016455"></a>5\.6	Ecosystem Integration

In the full Docker Compose ecosystem \(docker\-compose\.ecosystem\.yml\), the marketing website runs as a container alongside all other Garamatic services\. Two environment variables are required when running the full stack:

- GATEKEEPER\_API\_KEY: Required for Gatekeeper API authentication between services\.
- GRAFANA\_ADMIN\_PASSWORD: Required for the Grafana observability dashboard\.

These must be set as environment variables and must never be committed to the repository\.

# <a id="_Toc232016456"></a>SendGrid Email Integration

## <a id="_Toc232016457"></a>6\.1	Purpose

The Mailing Service is responsible for sending email notifications whenever important business events occur within the Garamatic platform\. To achieve this, the service integrates with SendGrid, a cloud\-based email delivery platform that provides reliable email delivery and tracking capabilities\.

Like the Odoo bridge, this is an independent service that consumes events and calls an external API, demonstrating the composability of the event\-driven architecture\.

## <a id="_Toc232016458"></a>6\.2	Architecture

The Mailing Service acts as a consumer in the event\-driven architecture\. It listens to RabbitMQ events published by other services, such as the Ticketing Service and Invoice Service\. When a relevant event is received, the service generates an appropriate email and sends it through SendGrid\.

The integration is fully decoupled from the business services\. Neither the Ticketing Service nor the Invoice Service communicates directly with SendGrid\. Instead, they publish events to RabbitMQ, allowing the Mailing Service to handle all email\-related responsibilities independently\.

## <a id="_Toc232016459"></a>6\.3	Implementation

The SendGrid integration is implemented using the official SendGrid \.NET SDK\. The API key and sender information are stored in the application configuration and injected into the EmailService during startup\.

When an event is received, the service:

1. Deserializes the incoming event message\.
2. Determines the event type\.
3. Generates the appropriate HTML email template\.
4. Sends the email through the SendGrid API\.
5. Logs the delivery result for monitoring and troubleshooting purposes\.

## <a id="_Toc232016460"></a>6\.4	Events That Trigger Emails

__Event__

__Recipient__

__Email Content__

ticket\.created

Assigned agent

New ticket notification with details and link\.

ticket\.assigned

Assigned agent

Assignment confirmation with ticket context\.

ticket\.resolved

Customer

Resolution summary and satisfaction survey link\.

invoice\.created

Customer

Invoice notification with amount and payment instructions\.

payment\.received

Customer \+ Finance

Payment confirmation receipt\.

invoice\.overdue

Customer \+ Finance

Overdue reminder with outstanding amount\.

## <a id="_Toc232016461"></a>6\.5	HTML Email Templates

To provide a professional user experience, emails are generated using HTML templates rather than plain text messages\. A dedicated Template Service is responsible for generating consistent and reusable email layouts\.

This approach separates presentation logic from business logic and makes it easier to maintain and extend email designs in the future\.

## <a id="_Toc232016462"></a>6\.6	Benefits

The SendGrid integration provides several advantages:

- Reliable email delivery through a specialized email platform\.
- Decoupling of email functionality from business services\.
- Improved scalability through asynchronous event processing\.
- Reusable and maintainable HTML email templates\.
- Easy extension when new notification types are introduced\.

By combining RabbitMQ and SendGrid, the platform can automatically notify users about important actions while maintaining a clean and loosely coupled architecture\.

# <a id="_Toc232016463"></a>Garamatic Meta Repository & Ecosystem Architecture

## <a id="_Toc232016464"></a>7\.1	Overview

The Garamatic organisation on GitHub is structured as a meta\-repository: a single root repository \(github\.com/Garamatic/garamatic\) that tracks all individual service repositories as git submodules and provides a unified point of orchestration for local development, integration testing, and deployment\.

This architecture means a developer can clone one repository and immediately spin up the entire ecosystem — all 8 microservices, shared infrastructure, and integration tests — with a single command\.

## <a id="_Toc232016465"></a>7\.2	Complete Service Inventory

The Garamatic platform consists of 8 microservices plus shared infrastructure, organised into frontends, backends, and shared components:

__Service / Submodule__

__Port__

__Technology__

__Purpose__

__FRONTENDS__

garamatic\-web

8090

Frontend

Main web application — the primary user interface for agents and customers\.

masala\-web

8091

Vite \+ Tailwind

Marketing landing page with 5 tenant themes and 3 languages \(EN/NL/FR\)\.

__BACKENDS__

ticket\-masala

8085

\.NET 10

Core ticket engine — the heart of the platform\. Handles tickets, workflows, RBAC, and GERDA\.

gatekeeper\-api

8086

\.NET

Event ingestion gateway\. Acts as the secure entry point for inbound events from external systems\.

mailing\-service

8087

\.NET

Email worker and API\. Consumes RabbitMQ events and dispatches transactional emails via SendGrid\.

odoo\-integration

—

\.NET

ERP bridge\. Consumes ticket\.resolved events and creates customers and invoices in Odoo via JSON\-RPC\.

agentic\-service

3001

Python

MCP server and LangGraph agent\. Exposes all Garamatic tools to AI agents \(Claude, GPT\)\.

__SHARED__

integration\-contracts

—

Shared schemas

API schemas and shared type definitions used across all services\.

integration\-tests

—

Test suite

Cross\-service integration tests that validate the full ecosystem end\-to\-end\.

RabbitMQ

5672 / 15672

AMQP broker

Shared message broker\. All async communication flows through here\.

MailHog

—

Test tool

Email capture for local and test environments\. Intercepts all outgoing emails\.

## <a id="_Toc232016466"></a>7\.3	Meta\-Repository Structure

garamatic/                         \# Root meta\-repository

├── docker\-compose\.yml             \# Full stack orchestration

├── \.env\.example                   \# Environment variable template

├── \.gitmodules                    \# Submodule declarations

├── Makefile                       \# Unified developer commands

├── scripts/

│   ├── setup\.sh                   \# One\-time environment setup

│   ├── test\.sh                    \# Test runner \(Docker or local\)

│   ├── bump\.sh                    \# Update submodule references

│   ├── status\.sh                  \# Ecosystem dashboard

│   ├── pull\.sh                    \# Pull root \+ all submodules

│   └── push\.sh                    \# Push root \+ submodule commits

├── integration\-tests/             \# Cross\-service test suite

├── ticket\-masala/                 \# \[submodule\]

├── mailing\-service/               \# \[submodule\]

├── event\-planner/                 \# \[submodule\]

├── garamatic\-web/                 \# \[submodule\]

├── masala\-web/                    \# \[submodule\]

├── agentic\-service/               \# \[submodule\]

├── odoo\-integration/              \# \[submodule\]

└── integration\-contracts/         \# \[submodule\]

## <a id="_Toc232016467"></a>7\.4	Developer Workflow

### <a id="_Toc232016468"></a>7\.4\.1	Getting Started

\# Clone with all submodules in one go

git clone \-\-recursive git@github\.com:Garamatic/garamatic\.git

\# Or: clone first, then initialise submodules

git clone git@github\.com:Garamatic/garamatic\.git

cd garamatic && make setup

\# Start the entire stack

make up

\# Run integration tests

make test

### <a id="_Toc232016469"></a>7\.4\.2	Daily Commands

__Command__

__Effect__

make up

Start the full stack in detached mode\.

make dev

Start the full stack attached — all logs visible in terminal\.

make down

Stop and remove all containers\.

make logs

Tail all service logs\.

make test

Run integration tests inside Docker\.

make test\-local

Run integration tests against locally running services\.

make status

Show the current commit of every submodule — ecosystem dashboard\.

make pull

Pull root repository and sync all submodules\.

make push

Push root repository and all pending submodule commits\.

make bump

Update all submodule references to latest and commit the root repo\.

### <a id="_Toc232016470"></a>7\.4\.3	Submodule Golden Rule

Always commit changes in the individual service repository first, then update the submodule reference in the root repository:

\# 1\. Make changes in a service

cd ticket\-masala

git add \. && git commit \-m 'feat: add priority field'

git push origin main

\# 2\. Bump the submodule reference in the root repo

cd \.\.

\./scripts/bump\.sh ticket\-masala

\# 3\. Push the root repo

git push origin main

This workflow ensures the root repository always pins a specific, tested combination of service versions\. Checking out any tag of the root repo and running git submodule update \-\-init gives the exact service versions that were validated together\.

## <a id="_Toc232016471"></a>7\.5	Integration Testing

This workflow ensures the root repository always pins a specific, tested combination of service versions\. Checking out any tag of the root repo and running git submodule update \-\-init gives the exact service versions that were validated together\.

\# Full suite in Docker

make test

\# Specific suite against local services

\./scripts/test\.sh local cross\-service

The CI/CD pipeline \(GitHub Actions\) clones the repository with all submodules, runs make setup and make test on every push to main and every pull request\. This guarantees that no service can be merged if it breaks the cross\-service integration\.

## <a id="_Toc232016472"></a>7\.6 Integration Contracts

The integration\-contracts submodule contains the shared API schemas and event type definitions used across all services\. This is the single source of truth for:

- RabbitMQ event payloads \(field names, types, required fields\)\.
- REST API request and response schemas shared between services\.
- Shared enum definitions \(ticket statuses, event types, tenant identifiers\)\.

Any change to an event payload must be reflected in integration\-contracts first, then propagated to the consuming services\. This prevents silent contract drift between services\.

# <a id="_Toc232016473"></a>Testing & CI/CD

## <a id="_Toc232016474"></a>Test Pyramid

The project follows a layered testing approach aligned with the classic test pyramid:

- Unit Tests \(UnitTests/ namespace\): Fast, isolated tests that cover domain logic and engine rules using an in\-memory database\. These run on every commit and provide rapid feedback\.
- Domain Tests \(TicketMasala\.Domain\.Tests/\): Pure domain logic tests with zero infrastructure dependencies\. Validate invariants, state machine guards, and GERDA heuristics\.
- Integration Tests \(IntegrationTests/ namespace\): Full\-stack tests using WebApplicationFactory, exercising the HTTP stack, database, and middleware pipeline together\.
- Architecture Tests \(Architecture/ namespace\): Structural tests using NetArchTest that enforce layering rules \(e\.g\., the Domain layer must not reference Infrastructure\)\.

## <a id="_Toc232016475"></a>8\.2	Running the Tests

The following commands are available:

\# Run all tests

\./scripts/test\.sh

\# Run with HTML coverage report

\./scripts/test\-coverage\.sh

\# Run a specific test class

dotnet test \-\-filter "FullyQualifiedName~TicketTests"

\# Run only unit tests \(fast feedback loop\)

dotnet test \-\-filter "FullyQualifiedName~UnitTests|FullyQualifiedName~Domain\.Tests"

## <a id="_Toc232016476"></a>Coverage

Coverage reports are generated as HTML in TestResults/CoverageReport/ and uploaded as a CI artefact on every pull request\. Open index\.html locally to browse line and branch coverage per module\.

## <a id="_Toc232016477"></a>CI/CD Pipeline

GitHub Actions drives the automated pipeline on every pull request:

- Step 1 — Build: Restores NuGet packages and compiles the solution\. Fails fast on compilation errors\.
- Step 2 — Unit Tests: Runs the fast unit and domain test suites\. Any failure blocks merge\.
- Step 3 — Full Test Suite \+ Coverage: Runs all test categories with coverage collection enabled\.
- Step 4 — Coverage Report: Generates the HTML report and uploads it as a workflow artefact\.

The workflow file lives at \.github/workflows/ and is version\-controlled alongside the application code\.

# <a id="_Toc232016478"></a>Live Deployment & URL’s

## <a id="_Toc232016479"></a>Production Environment

The full Garamatic ecosystem is deployed to Fly\.io\. All services are available at the garamatic\.tech domain over HTTPS with automatic TLS certificates\. The following URLs are live and accessible:

- [https://showcase\.garamatic\.tech](https://showcase.garamatic.tech)
- [https://tickets\.garamatic\.tech](https://tickets.garamatic.tech)
- [https://odoo\.garamatic\.tech/web/login](https://odoo.garamatic.tech/web/login)
- [https://rabbitmq\.garamatic\.tech](https://rabbitmq.garamatic.tech)

## <a id="_Toc232016480"></a>9\.2	Using the Live URLs in the Demo

During the demo flow, the following URLs should be open in the browser:

- Step 1 — Customer Creates Ticket: https://tickets\.garamatic\.tech — open the ticket creation form here\.
- Step 2 — RabbitMQ Event Flow: https://rabbitmq\.garamatic\.tech — navigate to Exchanges → garamatic\.events to show the live message rate\.
- Step 4 & 5 — Ticket Assignment and Resolution: https://tickets\.garamatic\.tech — log in as the Desgoffe Bureaucrat \(gustave@desgoffe\.gov\) to assign and resolve\.
- Step 6 — Invoice in Odoo: https://odoo\.garamatic\.tech/web/login — log in to show the auto\-created invoice under Invoicing → Customers → Invoices\.

## <a id="_Toc232016481"></a>9\.3	Demo Login Credentials

__System__

__URL / Login__

__Username__

__Password__

Ticket Masala

https://tickets\.garamatic\.tech

gustave@desgoffe\.gov

Admin123\!

Ticket Masala

https://tickets\.garamatic\.tech

jean\.dupont@email\.com

Customer123\!

Odoo

https://odoo\.garamatic\.tech/web/login

admin@example\.com

Admin

RabbitMQ

https://rabbitmq\.garamatic\.tech

guest

Guest

## <a id="_Toc232016482"></a>9\.4	Environment Variables

The following environment variables are required for the full production stack\. They must be set as secrets and never committed to the repository:

__Variable__

__Description__

SENDGRID\_API\_KEY

SendGrid API key for transactional email dispatch\.

SENDGRID\_FROM\_EMAIL

Verified sender email address registered in SendGrid\.

GATEKEEPER\_API\_KEY

API key for the Gatekeeper event ingestion service\.

GRAFANA\_ADMIN\_PASSWORD

Admin password for the Grafana observability dashboard\.

# <a id="_Toc232016483"></a>Demo Flow

This chapter describes the end\-to\-end demonstration scenario used to present the integrated system\. The scenario follows a single support ticket from creation to billing, exercising all three integrated services in sequence\.

## <a id="_Toc232016484"></a>Step 1: Customer Creates Ticket

__What to show__

- Open the frontend ticket form in the browser\.
- Fill in a customer name, email address, and a description of the support issue\.
- Submit the form and show the confirmation screen\.

__What happens in the background__

- The frontend calls the Ticket Masala REST API \(POST /api/tickets\)\.
- Ticket Masala persists the ticket to SQLite and writes a ticket\.created message to the Outbox table in the same database transaction\.
- The OutboxPublisher background service picks up the message and publishes it to the garamatic\.events RabbitMQ exchange\.

## <a id="_Toc232016485"></a>Step 2: RabbitMQ Processes the Event

__What to show__

- Open the RabbitMQ management dashboard \(http://localhost:15672\)\.
- Navigate to Exchanges → garamatic\.events and show the incoming message rate\.
- Navigate to Queues and show the bound queues receiving the event\.

__Key point to explain__

RabbitMQ acts as the communication hub between all services\. No service calls another service directly — they only publish or consume events\. This means the mailing service and the invoice service can be added, updated, or replaced without touching Ticket Masala\.

## <a id="_Toc232016486"></a>10\.3	Step 3: Mailing Service Sends Confirmation Email

__What to show__

- Open the mailing service container logs: docker\-compose logs \-f mailing\-service
- Show the log line confirming receipt of ticket\.created and successful dispatch to SendGrid\.
- Open the inbox and show the confirmation email received by the customer\.

__Key Point to explain__

The mailing service listens for ticket\.created events and automatically sends a confirmation email\. It has no knowledge of Ticket Masala's internals — it only knows the event schema\.

## <a id="_Toc232016487"></a>Step 4: Ticket Gets Assigned

__What to show__

- In the Ticket Masala dashboard, open the newly created ticket\.
- Assign a technician using the assignment control\.
- Show the assignment email arriving in the technician's inbox\.

__What happens in the background__

- Ticket Masala transitions the ticket state to Assigned and publishes ticket\.assigned to RabbitMQ\.
- The mailing service picks up the event and sends an assignment notification email to the technician\.

## <a id="_Toc232016488"></a>Step 5: Ticket Gets Resolved

__What to show__

- In the Ticket Masala dashboard, mark the ticket as Resolved\.
- Show the resolution confirmation in the UI\.

__Key point to explain__

Resolving a ticket emits a ticket\.resolved business event\. This single event triggers two independent downstream reactions — invoice creation \(Odoo bridge\) and a resolution email \(mailing service\) — neither of which Ticket Masala knows or cares about\.

## <a id="_Toc232016489"></a>Step 6: Invoice Automatically Created in Odoo

__What to show__

- Open the Odoo backend \(http://localhost:8069\) and navigate to Invoicing → Customers → Invoices\.
- Show the newly created invoice with the correct customer name, ticket reference, and billable amount\.
- Show the invoice status as Posted \(validated\), ready for payment\.

__Key point to explain__

The Invoice Service \(odoo\-bridge\) listened for ticket\.resolved, automatically looked up or created the customer record in Odoo \(res\.partner\), created the invoice \(account\.move\), and validated it via action\_post — all without any manual intervention\.

## <a id="_Toc232016490"></a>Invoice Email Sent to Customer

__What to show__

- Open the customer inbox and show the invoice email\.
- The email contains the invoice amount, due date, and payment instructions\.
- Optionally show the odoo\-bridge logs confirming invoice\.created was published after Odoo confirmed the invoice\.

__Key point to explain__

After creating the invoice in Odoo, the odoo\-bridge publishes an invoice\.created event\. The mailing service picks this up and sends the invoice email — a third service reacting to the same event stream, again with no direct coupling\.

# <a id="_Toc232016491"></a>Lessons Learned

## <a id="_Toc232016492"></a>What Worked Well

- Configuration\-driven design: Externalising workflow logic into YAML proved enormously effective\. Adding the Whitman tenant late in the project required no application code changes, validating the approach\.
- Modular Monolith: The clear internal module boundaries made parallel development straightforward\. Team members could work on GERDA and the workflow engine simultaneously without merge conflicts\.
- HTMX over a SPA: Choosing HTMX over React or Angular kept the frontend simple and rendered the polymorphic UI model tractable\.
- Outbox Pattern: Implementing the Outbox early prevented a class of race\-condition bugs that would have been difficult to diagnose in production\.
- Event\-driven integration: Integrating Odoo and SendGrid via RabbitMQ events rather than direct calls kept all three systems fully decoupled\. The bridge and email worker could be developed in parallel without blocking the core team\.

## <a id="_Toc232016493"></a>Challenges

- Drupal / event\-planner: The event\-planner service — a Drupal CMS integration — was initially planned as part of the ecosystem but was ultimately left out of scope\. Integrating Drupal's PHP\-based architecture with the \.NET event\-driven stack proved too complex within the available timeframe\. The submodule remains in the repository as a placeholder for future work\.
- Odoo's JSON\-RPC API: The absence of a REST API, inconsistent field names, and the need for stateful authentication added significant integration friction compared to modern API\-first services like SendGrid\.
- Odoo polling for payment status: Without webhook support, the polling approach adds complexity and latency\. A dedicated Odoo module would be the ideal long\-term fix\.
- SQLite concurrency: WAL mode largely solved read concurrency, but write serialisation under load required careful attention to transaction scope in EF Core\.
- GERDA calibration: Tuning the heuristic weights per tenant required more iteration than anticipated\.
- YAML schema evolution: As the configuration schema evolved, ensuring backward compatibility with existing tenant YAML files required discipline\.

## <a id="_Toc232016494"></a>11\.3	 Key Takeaways

- REST APIs are vastly preferable to RPC\-style interfaces for integration work — SendGrid integration took a fraction of the time that Odoo integration required\.
- Webhooks are preferable to polling — polling adds operational overhead and latency\. The Odoo bridge would be simpler and more responsive with webhook support\.
- Wrapping bad APIs in clean abstractions is essential — the OdooClient layer means the rest of the codebase is insulated from JSON\-RPC quirks\.
- Event\-driven architectures scale horizontally and are straightforward to extend — adding the SendGrid worker required no changes to any existing component\.

## <a id="_Toc232016495"></a>11\.4	Future Work

- Event sourcing: Full audit trails for government tenants\.
- Odoo webhook module: Replace polling with push\-based payment notifications\.
- Pluggable persistence: PostgreSQL support for high\-throughput deployments\.
- GERDA ML upgrade: Replace static heuristic weights with an on\-device trained model\.
- Unified observability: Centralised log aggregation \(e\.g\., OpenTelemetry \+ Grafana\) across all three services\.

# <a id="_Toc232016496"></a>Conclusion

Ticket Masala successfully demonstrates that modern enterprise software does not need to compromise between architectural rigidity and organizational flexibility\. By shifting the core workflow engine, access controls, and user interface definitions entirely into a runtime configuration layer, the platform effectively eliminates the infrastructure overhead and technical friction typically associated with multi\-domain ticketing systems\. A single deployable artifact comfortably spans the operational extremes of the rigid, multilingual constraints of local government and the fast\-paced, agile demands of technical operations\.

The technical execution validates the choice of a modular monolith backed by a strictly decoupled, event\-driven integration layer\. Relying on RabbitMQ as the central communication backbone ensures that individual components—such as the Odoo ERP bridge, the SendGrid transactional mailing service, and the forward\-looking Agentic MCP service—can operate, fail, and scale independently without compromising global data consistency\. Furthermore, by embedding the GERDA deterministic rules engine directly into the application core, the platform achieves intelligent triage and compliance monitoring without introducing external cloud dependencies, preserving the operational sovereignty required by high\-security tenants\.

Ultimately, Ticket Masala provides a highly cohesive, maintainable, and resilient ecosystem\. It proves that configuration\-driven behavior, paired with an asynchronous event fabric, allows a software engineering team to deliver a highly adaptable platform within strict development constraints, laying a solid foundation for future algorithmic automation and automated workflow orchestration\.

