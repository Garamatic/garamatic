# Admin Passwords — Garamatic Demo Stack

> All admin passwords for the demo stack. Each service is a separate system with its own identity. There is no SSO between services.

---

## Ticket Masala (localhost:8085)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `gustave@desgoffe.gov` | `Admin123!` | Primary admin. Has the "Mayor's Stamp" (permis) |
| **Admin (alt)** | `admin@desgoffe.gov` | `Admin123!` | Secondary admin account |
| **Employee** | `serge@desgoffe.gov` | `Employee123!` | Manager level, Clergé Municipal |
| **Employee** | `claire@desgoffe.gov` | `Employee123!` | Lead level, Affaires Juridiques |
| **Employee** | `rene@desgoffe.gov` | `Employee123!` | Expert level, Travaux Publics |
| **Customer** | `jean.dupont@citoyen.be` | `Customer123!` | Citizen portal account. Can only file tickets |

---

## Odoo ERP (localhost:8069)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `admin` | Default Odoo admin. First login after `make up` |

---

## RabbitMQ Management (localhost:15672)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `guest` | `guest` | Default management account. Only used in demo |

---

## Grafana Dashboard (localhost:3000)

| Role | Username | Password | Notes |
|------|----------|----------|-------|
| **Admin** | `admin` | `admin` | Only available if you run `make monitor-up` |

---

## Services With No Login Required

| Service | URL | Notes |
|---------|-----|-------|
| **Showcase** | `http://localhost:8092` | Static dashboard — no login |
| **Portal** | `http://localhost:8093` | No real authentication (email stored in sessionStorage for demo) |
| **Agentic Service** | `http://localhost:3001/sse` | Public SSE endpoint — no login in demo |
| **Gatekeeper API** | `http://localhost:8086` | API key: `demo-api-key` — no user login |
| **Mailing Service** | `http://localhost:8087` | No direct login |
| **Mailhog** | `http://localhost:8025` | No login — captures all emails |
| **Ollama LLM** | `http://localhost:11434` | No login |

---

## Quick Reference

```
# Ticket Masala (Admin)
URL:    http://localhost:8085
Login:  gustave@desgoffe.gov / Admin123!

# Ticket Masala (Employee)
URL:    http://localhost:8085
Login:  serge@desgoffe.gov / Employee123!

# Ticket Masala (Customer)
URL:    http://localhost:8085
Login:  jean.dupont@citoyen.be / Customer123!

# Odoo ERP
URL:    http://localhost:8069
Login:  admin / admin

# RabbitMQ
URL:    http://localhost:15672
Login:  guest / guest

# Grafana (optional, requires make monitor-up)
URL:    http://localhost:3000
Login:  admin / admin

# Gatekeeper API
URL:    http://localhost:8086
Key:    demo-api-key

# Mailhog
URL:    http://localhost:8025
```

---

## Important Notes

- **No single sign-on**: Each service is a separate system. Logging into Ticket Masala does not log you into Odoo.
- **The portal is not a real login**: The citizen portal accepts any email and stores it in `sessionStorage`. There is no real authentication.
- **Odoo admin is created on first boot**: The Odoo admin account is created when the Odoo container first initializes the database.
- **Grafana is not started by default**: Run `make monitor-up` to start the monitoring stack.
- **All passwords are hardcoded for demo purposes**: Do not use these in production.

---

## Where These Are Seeded

| Service | Credential Source | File |
|---------|-------------------|------|
| Ticket Masala | Admin & Employee users | `demo/config/seed_data.json` |
| Ticket Masala | Customer users | `demo/config/seed_data.json` |
| Odoo | Admin password | `odoo-integration/scripts/setup-odoo.sh` |
| Odoo | Database connection | `demo/docker-compose.yml` (environment) |
| RabbitMQ | Default guest | `demo/docker-compose.yml` (environment) |
| Grafana | Default admin | `demo/docker-compose.monitoring.yml` (environment) |
| Gatekeeper | API key | `demo/docker-compose.yml` (environment) |
| Agentic | API key (optional) | `agentic-service/docker-compose.yml` (environment) |
