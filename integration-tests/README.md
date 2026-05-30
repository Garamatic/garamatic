# Garamatic Integration Test Suite

Comprehensive integration tests for all Garamatic microservices.

## Quick Start

```bash
# Install dependencies
npm install

# Run all integration tests (requires services running)
npm run test:local

# Or run tests with Docker (spins up all services)
npm run test:integration:docker
```

## Test Structure

```
integration-tests/
├── tests/
│   ├── lib/
│   │   └── test-harness.js          # Shared test utilities
│   ├── run-all.js                     # Unified test runner with JSON output
│   ├── contract-compliance.test.js    # Schema validation tests (all 9 schemas)
│   ├── contract-drift.test.js         # Drift detection: live events vs schemas
│   ├── service-health.test.js         # Health check tests (all 8 services)
│   ├── cross-service.test.js          # Service interaction tests (all event types)
│   ├── e2e-workflows.test.js          # End-to-end workflow tests (9 workflows)
│   ├── rabbitmq-connectivity.test.js  # RabbitMQ broker tests
│   ├── webhook-receiver.test.js       # Webhook endpoint tests
│   ├── odoo-integration.test.js       # Odoo integration worker tests
│   ├── agentic-service-deep.test.js   # Agentic service deep lifecycle tests
│   ├── event-planner-deep.test.js     # Event planner Drupal API tests
│   └── event-handler-contract.test.js  # Event handler downstream contract tests
├── docker/
│   ├── docker-compose.test.yml     # Full test environment
│   ├── test-runner.Dockerfile      # Test runner image
│   └── nginx-test-receiver.conf    # Test webhook receiver
├── scripts/
│   ├── run-integration-tests.sh    # Docker entrypoint
│   ├── test-local.sh               # Local test runner
│   └── generate-report.js          # Report generator
└── fixtures/                       # Test data (created as needed)
```

## Test Categories

### 1. Contract Compliance Tests
Validates that all services conform to the integration contracts:
- JSON Schema format validation for all 9 event schemas
- Required field verification
- Sample event validation
- Schema ID consistency
- Negative validation (invalid events rejected)

```bash
node tests/contract-compliance.test.js
```

### 2. Service Health Tests
Checks that all services are running and responding:
- Health endpoint availability (Ticket Masala, Gatekeeper, Mailing, Event Planner, Agentic)
- API information endpoints
- CORS configuration
- Response time benchmarks

```bash
node tests/service-health.test.js
```

### 3. Cross-Service Integration Tests
Tests interactions between services:
- Ticket creation → Email notification
- Gatekeeper ingestion → Ticket creation (all 9 event types)
- Invoice events → Payment processing
- Agentic service API integration
- Error handling and recovery

```bash
node tests/cross-service.test.js
```

### 4. End-to-End Workflow Tests
Complete business workflows:
- New customer support ticket flow
- Invoice and payment workflow
- Invoice overdue workflow
- Ticket assignment workflow
- User creation workflow
- Agentic service workflow
- Multi-tenant isolation
- Error recovery scenarios

```bash
node tests/e2e-workflows.test.js
```

### 5. RabbitMQ Connectivity Tests
Message broker connectivity and health:
- Management API accessibility
- Exchange and queue listing
- Service dependency verification
- Alarm and health checks

```bash
node tests/rabbitmq-connectivity.test.js
```

### 6. Webhook Receiver Tests
Webhook endpoint validation:
- /webhook and /events endpoints
- POST payload handling
- Health endpoint
- Large payload acceptance

```bash
node tests/webhook-receiver.test.js
```

### 7. Odoo Integration Worker Tests
.NET worker service health and event processing:
- Health endpoint with structured report
- RabbitMQ and storage health checks
- ticket.resolved event ingestion
- invoice.created event ingestion
- Circuit breaker resilience

```bash
node tests/odoo-integration.test.js
```

### 8. Contract Drift Detection Tests
Validates that live events published through services match schemas:
- All 9 event types published through gatekeeper
- Schema validation on published payloads
- camelCase vs snake_case guard
- additionalProperties=false enforcement

```bash
node tests/contract-drift.test.js
```

### 9. Agentic Service Deep Tests
Full ticket lifecycle through the agentic REST API:
- Create → get → resolve → invoice → email
- Customer context aggregation
- Agent chat endpoint
- Input validation (missing title, invalid email, negative amount)

```bash
node tests/agentic-service-deep.test.js
```

### 10. Event Planner Deep Tests
Drupal event planner API beyond basic ping:
- Contact form submission (valid, missing fields, invalid email)
- JSON:API and node endpoints
- User login endpoint
- RabbitMQ forwarding via contact form

```bash
node tests/event-planner-deep.test.js
```

### 11. Event Handler Contract Tests
Downstream consumer resilience (mailing-service, odoo-integration):
- All 7 event types handled without crashing
- Rapid event publishing (stress)
- Minimal field events (forward compatibility)
- Odoo-specific invoice and ticket ingestion

```bash
node tests/event-handler-contract.test.js
```

## Running Tests

### Local Mode (Services Already Running)

```bash
# Run all tests against local services
./scripts/test-local.sh

# Run specific test file
./scripts/test-local.sh contract-compliance.test.js

# With custom service URLs
TICKET_MASALA_URL=http://localhost:9000 ./scripts/test-local.sh
```

### Docker Mode (Full Environment)

```bash
# Start all services and run tests
docker compose -f docker/docker-compose.test.yml up --build --abort-on-container-exit

# Using npm script
npm run test:integration:docker
```

### Individual Test Suites

```bash
cd integration-tests

# Contract tests only
npm run test:contracts

# Service health only
npm run test:services

# Cross-service only
npm run test:cross

# E2E workflows only
npm run test:e2e

# RabbitMQ only
npm run test:rabbitmq

# Webhook only
npm run test:webhook

# Odoo integration only
npm run test:odoo

# Contract drift
npm run test:drift

# Agentic deep tests
npm run test:agentic-deep

# Event planner deep tests
npm run test:event-planner

# Event handler contract tests
npm run test:handlers

# Unified runner (runs all suites, produces JSON report)
node tests/run-all.js
node tests/run-all.js --json       # JSON output only
node tests/run-all.js --verbose    # Full test output
```

## Service URLs

Tests use these URLs by default (configurable via environment variables):

| Service | Default URL | Environment Variable |
|---------|-------------|---------------------|
| Ticket Masala | http://localhost:8085 | `TICKET_MASALA_URL` |
| Gatekeeper API | http://localhost:8086 | `GATEKEEPER_URL` |
| Mailing Service | http://localhost:8087 | `MAILING_SERVICE_URL` |
| Event Planner | http://localhost:8088 | `EVENT_PLANNER_URL` |
| Agentic Service | http://localhost:3001 | `AGENTIC_SERVICE_URL` |
| Odoo Integration | http://localhost:8089 | `ODOO_INTEGRATION_URL` |
| RabbitMQ | http://localhost:15672 | `RABBITMQ_URL` |
| Mailhog | http://localhost:8025 | `MAILHOG_URL` |

## Test Reports

Generate HTML and Markdown reports from test results:

```bash
npm run report
```

Reports are written to `integration-tests/test-reports/`:
- `report.html` - Full HTML report
- `report.md` - Markdown summary

## Writing New Tests

Use the test harness for consistent test structure:

```javascript
import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('My Feature Tests');

async function main() {
  await runner.describe('Feature Group', async () => {
    await runner.it('should do something', async () => {
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/endpoint`);
      runner.assertResponseOk(response);
    });
  });
  
  runner.printSummary();
  runner.exit();
}

main();
```

## CI/CD Integration

For continuous integration, use the Docker mode:

```yaml
# Example GitHub Actions workflow
- name: Run Integration Tests
  run: |
    cd integration-tests
    docker compose -f docker/docker-compose.test.yml up --build --abort-on-container-exit --exit-code-from test-runner

- name: Generate Test Report
  if: always()
  run: |
    cd integration-tests
    node scripts/generate-report.js
```

### Unified Test Runner

The `run-all.js` script provides a single entry point for all test suites:

```bash
# Run all tests and generate JSON report
node tests/run-all.js

# CI-friendly JSON output
node tests/run-all.js --json > test-results.json

# Verbose output for debugging
node tests/run-all.js --verbose
```

The runner produces `test-results/test-results.json` with:
- Overall pass/fail status
- Per-suite breakdown (passed, failed, skipped, duration)
- Per-test results
- Service URLs used

This JSON can be consumed by CI dashboards or the report generator.

## Troubleshooting

### Services Not Responding

Check that all services are running:
```bash
curl http://localhost:8085/health  # Ticket Masala
curl http://localhost:8086/health  # Gatekeeper
curl http://localhost:8025         # Mailhog
```

### Test Failures

View detailed logs:
```bash
# After Docker test run
cat integration-tests/docker/test-logs/*.log

# Or check Docker logs
docker compose -f integration-tests/docker/docker-compose.test.yml logs
```

### Schema Validation Failures

Validate schemas manually:
```bash
cd integration-contracts
npm run validate-schemas
npm run validate-samples
```
