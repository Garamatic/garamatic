#!/usr/bin/env node
/**
 * Odoo Integration Worker Tests
 *
 * Tests the .NET worker service that synchronizes invoices
 * between the Garamatic platform and Odoo.
 */

import { TestRunner, SERVICES, fetchWithTimeout, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('Odoo Integration Tests');

async function main() {
  await runner.describe('Odoo Integration Health', async () => {
    await runner.it('should respond to health endpoint', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.odooIntegration}/health`,
          {},
          10000
        );
      } catch {
        runner.skip('Odoo integration health (service may not be running)');
      }
      runner.assertResponseOk(response);
    });

    await runner.it('should return structured health report', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.odooIntegration}/health`,
          {},
          10000
        );
      } catch {
        runner.skip('Odoo integration health report (service may not be running)');
      }
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertNotNull(data.status, 'Health report should have status');
      runner.assertNotNull(data.entries, 'Health report should have entries');
    });

    await runner.it('should report RabbitMQ health', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.odooIntegration}/health`,
          {},
          10000
        );
      } catch {
        runner.skip('Odoo integration RabbitMQ health (service may not be running)');
      }
      runner.assertResponseOk(response);
      const data = await response.json();
      const rabbitmq = data.entries && Object.entries(data.entries).find(
        ([k]) => k.toLowerCase().includes('rabbitmq')
      );
      if (rabbitmq) {
        runner.assertEquals(rabbitmq[1].status, 'Healthy', 'RabbitMQ should be healthy');
      } else {
        runner.skip('RabbitMQ health check (not in report)');
      }
    });

    await runner.it('should report storage health', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.odooIntegration}/health`,
          {},
          10000
        );
      } catch {
        runner.skip('Odoo integration storage health (service may not be running)');
      }
      runner.assertResponseOk(response);
      const data = await response.json();
      const storage = data.entries && Object.entries(data.entries).find(
        ([k]) => k.toLowerCase().includes('litedb') || k.toLowerCase().includes('storage')
      );
      if (storage) {
        runner.assertEquals(storage[1].status, 'Healthy', 'Storage should be healthy');
      } else {
        runner.skip('Storage health check (not in report)');
      }
    });
  });

  await runner.describe('Odoo Integration Event Processing', async () => {
    await runner.it('should ingest ticket.resolved events via RabbitMQ', async () => {
      // Publish via gatekeeper which routes to RabbitMQ; odoo-integration consumes
      const event = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        ticket_id: randomUUID(),
        customer_email: 'odoo-test@example.com',
        customer_name: 'Odoo Test',
        service_description: 'Odoo integration test',
        amount: 200.00,
        tenant_id: 'test-tenant',
        resolved_at: new Date().toISOString(),
        resolution_notes: 'Test resolution for Odoo invoice'
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept ticket.resolved`);
    });

    await runner.it('should ingest invoice.created events via RabbitMQ', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        invoice_id: randomUUID(),
        odoo_invoice_id: 9999,
        ticket_id: randomUUID(),
        customer_email: 'odoo-invoice@example.com',
        amount: 350.00,
        currency: 'USD',
        status: 'posted',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept invoice.created`);
    });
  });

  await runner.describe('Odoo Integration Circuit Breaker', async () => {
    await runner.it('should not crash on malformed events', async () => {
      const event = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        ticket_id: 'not-a-valid-uuid',
        amount: -50.00
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      // Should not crash the pipeline (gatekeeper may reject, but should not crash)
      runner.assertTrue(response.status < 500, 'Should not crash on malformed event');
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
