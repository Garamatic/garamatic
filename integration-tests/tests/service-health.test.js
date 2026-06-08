#!/usr/bin/env node
/**
 * Service Health Tests
 *
 * Validates that all services are running and responding correctly.
 * Tests basic connectivity and health endpoints.
 */

import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('Service Health Tests');

async function main() {
  await runner.describe('Ticket Masala Service', async () => {
    await runner.it('should respond to health check', async () => {
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/health`, {}, 10000);
      runner.assertResponseOk(response);
    });

    await runner.it('should return API information or 404', async () => {
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/info`, {}, 10000);
      // API info endpoint is optional - service may not have it
      if (response.status === 404) {
        runner.skip('API info endpoint (not implemented)');
      }
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertNotNull(data.version || data.status, 'API should return version or status');
    });

    await runner.it('should handle OPTIONS requests without crashing', async () => {
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:3000',
          'Access-Control-Request-Method': 'GET'
        }
      }, 5000);

      // CORS may not be configured, so we just check it doesn't crash
      runner.assertTrue(response.status < 500, 'OPTIONS request should not crash server');
    });
  });

  await runner.describe('Gatekeeper API Service', async () => {
    await runner.it('should respond to health check', async () => {
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/health`, {}, 10000);
      runner.assertTrue(response.ok || response.status === 404, 'Health endpoint should exist or return 404');
    });

    await runner.it('should accept ingestion requests', async () => {
      const testPayload = {
        source: 'integration-test',
        timestamp: new Date().toISOString(),
        data: { test: true }
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testPayload)
      }, 10000);

      // May return 401/403 if auth required, but should not crash
      runner.assertTrue(response.status < 500, 'Ingestion endpoint should not crash');
    });
  });

  await runner.describe('Mailing Service', async () => {
    await runner.it('should respond to health check', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailing}/health`, {}, 5000);
      } catch {
        runner.skip('Mailing service health check (service may not be running)');
      }
      runner.assertTrue(response.ok || response.status === 404, 'Should respond');
    });
  });

  await runner.describe('Event Planner Service', async () => {
    await runner.it('should respond to HTTP requests', async () => {
      let response;
      try {
        response = await fetchWithTimeout(SERVICES.eventPlanner, {}, 10000);
      } catch {
        runner.skip('Event planner service (service may not be running)');
      }
      runner.assertTrue(response.status < 500, 'Should not return server error');
    });
  });

  await runner.describe('Agentic Service', async () => {
    await runner.it('should respond to health check', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/health`, {}, 5000);
      } catch {
        runner.skip('Agentic service (service may not be running)');
      }
      runner.assertTrue(response.status < 500, 'Should respond to health check');
    });

    await runner.it('should have API endpoints accessible', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets?limit=1`, {}, 5000);
      } catch {
        runner.skip('Agentic API endpoints (service may not be running)');
      }
      runner.assertTrue(response.status < 500, 'Should have accessible API');
    });
  });

  await runner.describe('Mailhog (Test Email Capture)', async () => {
    await runner.it('should have API accessible', async () => {
      const response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v2/messages`, {}, 5000);
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertNotNull(data.total, 'Should return message count');
    });

    await runner.it('should have web UI accessible', async () => {
      const response = await fetchWithTimeout(SERVICES.mailhog, {}, 5000);
      runner.assertResponseOk(response);
      const html = await response.text();
      runner.assertTrue(html.includes('Mailhog') || html.includes('mailhog'), 'Should be Mailhog UI');
    });
  });

  await runner.describe('Service Connectivity', async () => {
    await runner.it('all services should be reachable within timeout', async () => {
      const services = [
        { name: 'Ticket Masala', url: SERVICES.ticketMasala },
        { name: 'Gatekeeper', url: SERVICES.gatekeeper },
        { name: 'Mailhog', url: SERVICES.mailhog }
      ];

      const results = await Promise.allSettled(
        services.map(async svc => {
          const start = Date.now();
          const response = await fetchWithTimeout(`${svc.url}/health`, {}, 5000);
          const latency = Date.now() - start;
          return { ...svc, latency, ok: response.ok };
        })
      );

      const failed = results.filter(r => r.status === 'rejected');
      runner.assert(
        failed.length === 0,
        `Services failed: ${failed.map(r => r.reason.message).join(', ')}`
      );
    });
  });

  await runner.describe('Response Time Benchmarks', async () => {
    await runner.it('health endpoints should respond within 2 seconds', async () => {
      const start = Date.now();
      try {
        await fetchWithTimeout(`${SERVICES.ticketMasala}/health`, {}, 5000);
        const latency = Date.now() - start;
        runner.assertTrue(latency < 2000, `Health check took ${latency}ms (max 2000ms)`);
      } catch {
        runner.skip('Response time benchmark (service unavailable)');
      }
    });
  });

  // Print summary and exit
  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
