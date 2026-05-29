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
│   │   └── test-harness.js      # Shared test utilities
│   ├── contract-compliance.test.js  # Schema validation tests
│   ├── service-health.test.js        # Health check tests
│   ├── cross-service.test.js         # Service interaction tests
│   └── e2e-workflows.test.js         # End-to-end workflow tests
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
- JSON Schema format validation
- Required field verification
- Sample event validation
- Schema ID consistency

```bash
node tests/contract-compliance.test.js
```

### 2. Service Health Tests
Checks that all services are running and responding:
- Health endpoint availability
- API information endpoints
- CORS configuration
- Response time benchmarks

```bash
node tests/service-health.test.js
```

### 3. Cross-Service Integration Tests
Tests interactions between services:
- Ticket creation → Email notification
- Gatekeeper ingestion → Ticket creation
- Invoice events → Payment processing
- Error handling and recovery

```bash
node tests/cross-service.test.js
```

### 4. End-to-End Workflow Tests
Complete business workflows:
- New customer support ticket flow
- Invoice and payment workflow
- Multi-tenant isolation
- Error recovery scenarios

```bash
node tests/e2e-workflows.test.js
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

# E2E workflows only
npm run test:e2e
```

## Service URLs

Tests use these URLs by default (configurable via environment variables):

| Service | Default URL | Environment Variable |
|---------|-------------|---------------------|
| Ticket Masala | http://localhost:8085 | `TICKET_MASALA_URL` |
| Gatekeeper API | http://localhost:8086 | `GATEKEEPER_URL` |
| Mailing Service | http://localhost:8087 | `MAILING_SERVICE_URL` |
| Event Planner | http://localhost:8088 | `EVENT_PLANNER_URL` |
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
```

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
