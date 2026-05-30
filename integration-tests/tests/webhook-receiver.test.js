#!/usr/bin/env node
/**
 * Webhook Receiver Tests
 *
 * Tests the nginx test-receiver webhook endpoints used for
 * capturing events and webhooks during integration testing.
 */

import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('Webhook Receiver Tests');

async function main() {
  await runner.describe('Webhook Endpoints', async () => {
    await runner.it('should respond to /webhook endpoint', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/webhook`,
        {},
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertTrue(data.received === true, 'Should return received: true');
    });

    await runner.it('should accept POST requests to webhook', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/webhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ event: 'test', timestamp: new Date().toISOString() })
        },
        10000
      );
      runner.assertResponseOk(response);
    });

    await runner.it('should respond to /events endpoint', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/events`,
        {},
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertEquals(data.status, 'ok', 'Should return status ok');
    });
  });

  await runner.describe('Webhook Health & Logging', async () => {
    await runner.it('should have health endpoint', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/health`,
        {},
        10000
      );
      runner.assertResponseOk(response);
      const text = await response.text();
      runner.assertTrue(text.includes('healthy'), 'Should return healthy status');
    });

    await runner.it('should handle unknown endpoints gracefully', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/unknown-path`,
        {},
        10000
      ).catch(err => ({ ok: false, status: 404 }));

      runner.assertTrue(
        response.status === 404 || response.status === 200,
        'Should handle unknown paths gracefully'
      );
    });
  });

  await runner.describe('Webhook Payload Handling', async () => {
    await runner.it('should accept large payloads', async () => {
      const largePayload = {
        event: 'ticket.created',
        data: 'x'.repeat(5000)
      };

      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/webhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(largePayload)
        },
        10000
      );
      runner.assertResponseOk(response);
    });

    await runner.it('should accept webhook with ticket event payload', async () => {
      const payload = {
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        ticket_id: crypto.randomUUID(),
        customer_email: 'webhook@example.com',
        customer_name: 'Webhook Test',
        description: 'Test webhook payload'
      };

      const response = await fetchWithTimeout(
        `${SERVICES.testReceiver}/webhook`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        },
        10000
      );
      runner.assertResponseOk(response);
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
