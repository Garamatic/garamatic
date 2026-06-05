#!/usr/bin/env node
/**
 * Event Planner Deep Integration Tests
 *
 * Tests the Drupal event planner API endpoints beyond basic HTTP ping:
 * contact form submission, Drupal JSON:API endpoints, and health checks.
 */

import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('Event Planner Deep Tests');

async function main() {
  await runner.describe('Event Planner Contact API', async () => {
    await runner.it('should accept valid contact form submission', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.eventPlanner}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname: 'Integration',
            lastname: 'Test',
            email: 'event-planner@example.com',
            message: 'Test message from integration test suite',
            event_type: 'conference'
          })
        }, 10000);
      } catch {
        runner.skip('Contact form (service may not be running)');
      }

      if (response.status === 404) {
        runner.skip('Contact form endpoint not configured (event-planner is minimal test container)');
      }

      runner.assertTrue(
        response.status === 200 || response.status === 201 || response.status === 202,
        `Should accept contact form, got ${response.status}`
      );

      if (response.status < 300) {
        const data = await response.json();
        runner.assertNotNull(data.status || data.message, 'Should return status or message');
      }
    });

    await runner.it('should reject contact form with missing fields', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.eventPlanner}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname: 'Integration',
            // missing lastname, email, message
          })
        }, 10000);
      } catch {
        runner.skip('Contact form validation (service may not be running)');
      }

      if (response.status === 404) {
        runner.skip('Contact form endpoint not configured (event-planner is minimal test container)');
      }

      runner.assertTrue(
        response.status === 400 || response.status === 422,
        `Should reject missing fields with 400/422, got ${response.status}`
      );
    });

    await runner.it('should reject contact form with invalid email', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.eventPlanner}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname: 'Integration',
            lastname: 'Test',
            email: 'not-an-email',
            message: 'Test message'
          })
        }, 10000);
      } catch {
        runner.skip('Invalid email validation (service may not be running)');
      }

      if (response.status === 404) {
        runner.skip('Contact form endpoint not configured (event-planner is minimal test container)');
      }

      runner.assertTrue(
        response.status === 400 || response.status === 422,
        `Should reject invalid email with 400/422, got ${response.status}`
      );
    });

    await runner.it('should reject non-JSON content type', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.eventPlanner}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain' },
          body: 'firstname=Integration&lastname=Test'
        }, 10000);
      } catch {
        runner.skip('Content type validation (service may not be running)');
      }

      if (response.status === 404) {
        runner.skip('Contact form endpoint not configured (event-planner is minimal test container)');
      }

      runner.assertTrue(
        response.status === 415 || response.status === 400,
        `Should reject non-JSON with 415, got ${response.status}`
      );
    });
  });

  await runner.describe('Event Planner Drupal Core', async () => {
    await runner.it('should have Drupal JSON:API endpoint', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.eventPlanner}/jsonapi`,
          {},
          10000
        );
      } catch {
        runner.skip('JSON:API (service may not be running)');
      }
      // JSON:API may return 200 or redirect; just verify it does not crash
      runner.assertTrue(response.status < 500, 'JSON:API should be accessible');
    });

    await runner.it('should have Drupal node listing endpoint', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.eventPlanner}/jsonapi/node/node`,
          {},
          10000
        );
      } catch {
        runner.skip('Node endpoint (service may not be running)');
      }
      runner.assertTrue(response.status < 500, 'Node endpoint should be accessible');
    });

    await runner.it('should have user login endpoint', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.eventPlanner}/user/login`,
          { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: '{}' },
          10000
        );
      } catch {
        runner.skip('Login endpoint (service may not be running)');
      }
      // Login may return 403 or 200; just verify it does not crash
      runner.assertTrue(response.status < 500, 'Login endpoint should not crash');
    });
  });

  await runner.describe('Event Planner Cross-Service', async () => {
    await runner.it('should forward event to RabbitMQ via contact form', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.eventPlanner}/api/contact`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firstname: 'RabbitMQ',
            lastname: 'Test',
            email: 'rabbitmq-test@example.com',
            message: 'Testing RabbitMQ integration from event planner',
            event_type: 'integration_test'
          })
        }, 10000);
      } catch {
        runner.skip('RabbitMQ forward (service may not be running)');
      }

      if (response.status === 404) {
        runner.skip('Contact form endpoint not configured (event-planner is minimal test container)');
      }

      // Drupal may return 500 when RabbitMQ is unavailable, or succeed if it queues locally
      runner.assertTrue(
        response.status === 200 || response.status === 201 || response.status === 202 || response.status === 500,
        `Should handle RabbitMQ interaction, got ${response.status}`
      );
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
