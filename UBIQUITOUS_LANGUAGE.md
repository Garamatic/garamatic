# Ubiquitous Language — Ville de Desgoffe (Municipal Domain)

## Domain identity

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **Domain** | The municipal jurisdiction of the Ville de Desgoffe | Tenant, municipality, region |
| **Guichet Citoyen** | The citizen-facing portal for submitting and tracking requests | Portal, app, frontend |
| **Service** | A municipal department or project that handles related dossiers | WorkContainer, Project, Department |
| **Dossier** | A citizen request or municipal case with a defined lifecycle | Ticket, WorkItem, Case, Request |
| **Agent** | A municipal employee who processes and resolves dossiers | Employee, WorkHandler, Staff |
| **Citoyen** | A resident or visitor who submits a dossier to the municipality | Customer, Client, User, Resident |
| **Bourgmestre** | The municipal administrator with full system access | Admin, Mayor, Superuser |
| **Quartier** | A geographic district within the city (Centre-Ville, Faubourg Nord, etc.) | Zone, District, Area, Neighborhood |

## Dossier types (canonical)

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **PLAINTE** | A formal citizen complaint requiring investigation | Incident, Complaint, Issue |
| **PERMIS** | A request for municipal authorization or permit | License, Authorization, Approval |
| **DEMANDE** | A general service request or information inquiry | ServiceRequest, Inquiry, Question |
| **NUISANCE** | A noise, odor, or pollution report requiring immediate action | NoiseComplaint, Incident, EnvironmentalIssue |

## Workflow states (canonical)

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **Recu** | The dossier has been received but not yet assigned | Pending, New, Received |
| **En Traitement** | An agent is actively working on the dossier | InProgress, Active, Working |
| **En Attente** | The dossier is blocked awaiting information from the citoyen or a third party | Waiting, Blocked, OnHold |
| **Tamponne** | The dossier has been resolved and officially stamped | Resolved, Done, Closed, Approved |
| **Refuse** | The dossier has been rejected and will not be processed | Rejected, Denied, Cancelled |

## Dossier attributes

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **Priorite Citoyenne** | The urgency level declared by the citoyen (Standard, Urgent, Tres Urgent) | Priority, Severity, Urgency |
| **Numero de Dossier** | The unique identifier for a dossier (e.g., T-DGF-2024-001) | Ticket ID, Case ID, Reference |
| **Article du Code Municipal** | The municipal regulation article relevant to the dossier | Regulation, Law, Article |
| **SLA** | The maximum time allowed to resolve a dossier based on its type | Deadline, Target, Response Time |

## Ingestion & routing

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **Guichet** | The single entry point where all citoyen requests enter the system | Gatekeeper, Ingestion, API |
| **GERDA** | The AI system that routes, prioritizes, and suggests responses for dossiers | AI, Bot, Agent, Autopilot |
| **Routage** | The automatic assignment of a dossier to the appropriate Agent based on skills and load | Dispatch, Assignment, Routing |
| **Dispatch** | The GERDA backlog of unassigned dossiers awaiting triage | Queue, Backlog, Pool |

## Billing & finance

| Term | Definition | Aliases to avoid |
|------|------------|-------------------|
| **Frais de Dossier** | The administrative fee charged for certain permis or interventions | Fee, Charge, Cost, Bill |
| **Facture** | The formal invoice issued to a citoyen for municipal services | Invoice, Bill, Payment |
| **Mise en Demeure** | An official warning issued to a party violating municipal regulations | Warning, Notice, Citation |

## Relationships

- A **Citoyen** submits one or more **Dossiers**
- A **Dossier** belongs to exactly one **Citoyen**
- A **Dossier** is assigned to exactly one **Agent**
- An **Agent** handles zero or more **Dossiers**
- A **Dossier** belongs to exactly one **Service** (WorkContainer)
- A **Service** contains zero or more **Dossiers**
- A **Dossier** has exactly one **Type** (PLAINTE, PERMIS, DEMANDE, or NUISANCE)
- A **Dossier** transitions through one or more **Workflow States**
- A **Facture** belongs to exactly one **Dossier**
- A **Dossier** may have zero or one **Facture**
- A **Quartier** may have zero or more **Dossiers**
- A **Dossier** is associated with exactly one **Quartier**

## Example dialogue

> **Dev:** "When a **Citoyen** submits a **Dossier** of type **PLAINTE**, does **GERDA** auto-assign it to an **Agent**?"
>
> **Domain expert:** "Yes — **GERDA** analyzes the **Priorite Citoyenne** and the **Quartier**, then routes it to the **Agent** with the right specializations and lowest workload."
>
> **Dev:** "What if the **Dossier** is a **PERMIS** with a **Frais de Dossier** of 150€?"
>
> **Domain expert:** "The **Guichet** creates the **Dossier**, **GERDA** assigns it to the **Service Urbanisme**, and when the **Agent** stamps it **Tamponne**, a **Facture** is generated automatically."
>
> **Dev:** "And if the **Citoyen** doesn't pay?"
>
> **Domain expert:** "The **Facture** becomes overdue, and a **Mise en Demeure** is triggered. The **Dossier** status changes to **En Attente** until payment is confirmed."
>
> **Dev:** "Can the **Bourgmestre** override **GERDA**'s routing?"
>
> **Domain expert:** "Yes — the **Bourgmestre** can reassign any **Dossier** to any **Agent**, but **GERDA** learns from those overrides to improve future **Routage**."

## Flagged ambiguities

- **"Ticket"** is used interchangeably with **Dossier** in the codebase — these are the same concept. **Dossier** is the canonical domain term. **Ticket** should be reserved for technical contexts only.
- **"Project"** is used interchangeably with **Service** in the codebase — these are the same concept. **Service** is the canonical domain term (a municipal department). **Project** should be reserved for the technical entity.
- **"Customer"** is used interchangeably with **Citoyen** in the codebase — these are the same concept. **Citoyen** is the canonical domain term. **Customer** should be reserved for technical contexts only.
- **"Incident"** and **"ServiceRequest"** are generic types that appear in the seeding data but are **not valid** in the municipal domain. The canonical types are **PLAINTE**, **PERMIS**, **DEMANDE**, and **NUISANCE**.
- **"Task"** appears in the seeding data as a work item type but is **not valid** in the municipal domain. A work item within a **Service** is a **Dossier** with a proper type (PLAINTE, PERMIS, DEMANDE, or NUISANCE).
- **"WorkItem"** is the generic technical term. The canonical domain term is **Dossier**.
- **"WorkContainer"** is the generic technical term. The canonical domain term is **Service**.
- **"WorkHandler"** is the generic technical term. The canonical domain term is **Agent**.
