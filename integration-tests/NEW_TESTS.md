# New E2E Tests: Demo Sites & Mail Integration

## Summary

Created 5 new integration test files to verify RabbitMQ demo sites and mail integrations work correctly.

## Test Files

### 1. `tests/demo-sites.test.js` — Demo Sites E2E Tests
**Tests:** Showcase index page and all tenant demo sites
- Showcase index loads with all tenant links
- Each tenant demo page (desgoffe, whitman, liberty, hennessey) loads with forms
- Forms have correct tenant IDs, CSS, JS, and manifest.json
- Success pages and config viewer are accessible
- Tenant assets (logos) are available

**Run:** `npm run test:demo-sites`

### 2. `tests/rabbitmq-message-flow.test.js` — RabbitMQ Message Flow Tests
**Tests:** Complete message flow through RabbitMQ between services
- Gatekeeper accepts all event types (ticket.created, ticket.resolved, email.send, invoice.create_requested)
- RabbitMQ exchange/queue/bindings are present
- Events flow: ticket creation → RabbitMQ → mailing service
- Events flow: gatekeeper → RabbitMQ → odoo-integration
- Event chaining works (ticket.resolved → downstream services)
- Load handling: multiple rapid event submissions
- Message persistence: queue depths tracked

**Run:** `npm run test:rabbitmq-flow`

### 3. `tests/mail-integration.test.js` — Mail Integration E2E Tests
**Tests:** Complete email flow through the system
- Mailing service health endpoints
- Mailhog API accessibility and message structure
- Email clearing works
- Ticket creation → email notification → Mailhog capture
- Gatekeeper email.send event → Mailhog
- Invoice events (create_requested, overdue) → email notifications
- Email content validation (HTML, structure, routing)
- Multi-tenant email handling
- Mailhog web UI accessibility

**Run:** `npm run test:mail`

### 4. `tests/tenant-form-submission.test.js` — Tenant Form Submission Tests
**Tests:** Tenant demo forms submit to Ticket Masala API correctly
- Portal API endpoint exists and accepts POST
- Each tenant form submits with correct tenant ID (X-Tenant header)
- Tenant-specific custom fields (quartier, worksite, department, grantType)
- Different priority levels work
- Empty required fields are rejected
- Special characters in form data are handled
- Cross-tenant isolation (X-Tenant routing)
- Load handling: multiple rapid submissions
- Malformed data and missing tenant headers handled gracefully

**Run:** `npm run test:tenant-forms`

### 5. `tests/demo-mail-flow.test.js` — Demo + Mail Flow End-to-End Tests
**Tests:** Complete pipeline from demo forms to Mailhog
- Showcase loads with all tenant links
- All tenant forms render with correct fields
- Form submissions via portal API succeed
- RabbitMQ is healthy after submissions
- Mailhog captures emails from the flow
- Full E2E: one tenant form → ticket → RabbitMQ → Mailhog
- Multi-tenant form submissions with RabbitMQ processing

**Run:** `npm run test:demo-mail-flow`

## Updated Files

### `tests/lib/test-harness.js`
- Added `showcase: process.env.SHOWCASE_URL || 'http://localhost:8092'` to SERVICES

### `tests/run-all.js`
- Added 5 new test suites to the SUITES array
- Added showcase URL to the services report

### `package.json`
- Added 5 new npm scripts:
  - `test:rabbitmq-flow`
  - `test:demo-sites`
  - `test:mail`
  - `test:tenant-forms`
  - `test:demo-mail-flow`

### `docker/docker-compose.test.yml`
- Added `showcase` service (nginx serving demo/showcase static files)
- Added `SHOWCASE_URL` environment variable to test-runner
- Added showcase dependency to test-runner

## Running the Tests

### Individual test suites:
```bash
cd integration-tests
npm run test:demo-sites        # Test demo sites
npm run test:rabbitmq-flow     # Test RabbitMQ message flow
npm run test:mail              # Test mail integration
npm run test:tenant-forms      # Test tenant form submissions
npm run test:demo-mail-flow    # Test complete demo+mail flow
```

### All tests:
```bash
cd integration-tests
npm test                       # Run all test suites
```

### In Docker:
```bash
cd integration-tests
docker compose -f docker/docker-compose.test.yml up --build --abort-on-container-exit
```

## Test Coverage

| Component | Tests |
|-----------|-------|
| Demo Sites | Showcase index, tenant pages, forms, assets, config viewer |
| RabbitMQ | Connectivity, message flow, event chaining, load handling |
| Mail Integration | Mailing service health, Mailhog capture, email content, multi-tenant routing |
| Form Submission | Portal API, tenant routing, validation, custom fields, error handling |
| End-to-End | Full pipeline: demo → form → API → RabbitMQ → mail → Mailhog |
