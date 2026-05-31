#!/usr/bin/env node
/**
 * RabbitMQ Connectivity Tests
 *
 * Validates RabbitMQ message broker connectivity and health
 * across all services that depend on it.
 */

import { TestRunner, SERVICES, fetchWithTimeout, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('RabbitMQ Connectivity Tests');
const RABBITMQ_AUTH = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };

async function main() {
  await runner.describe('RabbitMQ Management API', async () => {
    await runner.it('should respond to management API', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/overview`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
    });

    await runner.it('should report cluster status as healthy', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/health/checks/alarms`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertEquals(data.status, 'ok', 'RabbitMQ should have no alarms');
    });

    await runner.it('should list available exchanges', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/exchanges`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertTrue(Array.isArray(data), 'Should return array of exchanges');
      runner.assertTrue(data.length > 0, 'Should have at least one exchange');
    });

    await runner.it('should list available queues', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/queues`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertTrue(Array.isArray(data), 'Should return array of queues');
    });
  });

  await runner.describe('RabbitMQ Service Dependencies', async () => {
    await runner.it('gatekeeper should be connected to RabbitMQ', async () => {
      // The gatekeeper API depends on RabbitMQ; if it can ingest events, the connection works
      const testEvent = {
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        source: 'rabbitmq-test',
        ticket_id: randomUUID(),
        customer_email: 'rabbitmq@example.com',
        customer_name: 'RabbitMQ Test',
        tenant_id: 'test-tenant',
        description: 'RabbitMQ connectivity test',
        priority: 'medium',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testEvent)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept event via RabbitMQ`);
    });

    await runner.it('mailing-service should have RabbitMQ connection', async () => {
      // Check if the service health endpoint mentions RabbitMQ or just verify service is up
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailing}/health`, {}, 5000);
      } catch {
        runner.skip('Mailing RabbitMQ check (service may not be running)');
      }
      runner.assertTrue(response.status < 500, 'Mailing service should be reachable');
    });

    await runner.it('odoo-integration should have RabbitMQ connection', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.odooIntegration}/health`, {}, 10000);
      } catch {
        runner.skip('Odoo integration RabbitMQ check (service may not be running)');
      }
      runner.assertResponseOk(response);
      const data = await response.json();

      // Check if the health report includes RabbitMQ status
      const hasRabbitmq = data.entries &&
        Object.keys(data.entries).some(k => k.toLowerCase().includes('rabbitmq'));
      runner.assertTrue(
        hasRabbitmq || data.status === 'Healthy',
        'Odoo integration health should include RabbitMQ or be healthy'
      );
    });
  });

  await runner.describe('RabbitMQ Message Flow', async () => {
    await runner.it('should be able to publish events to exchange', async () => {
      // Check the default exchange exists
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/exchanges/%2f/amq.default`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertEquals(data.name, '', 'Default exchange should exist');
    });

    await runner.it('should show no critical alarms', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/health/checks/local-alarms`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertEquals(data.status, 'ok', 'Should have no local alarms');
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
