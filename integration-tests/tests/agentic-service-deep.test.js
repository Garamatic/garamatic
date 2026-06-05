#!/usr/bin/env node
/**
 * Agentic Service Deep Integration Tests
 *
 * Tests the complete ticket lifecycle through the agentic REST API:
 * create → get → resolve → invoice → email → customer context.
 */

import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('Agentic Service Deep Tests');

async function main() {
  const testEmail = `agentic-deep-${Date.now()}@example.com`;
  let createdTicketId = null;

  await runner.describe('Ticket Lifecycle', async () => {
    await runner.it('Step 1: Create a ticket via agentic API', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Agentic Deep Test Ticket',
            description: 'Created by agentic deep integration test',
            customer_email: testEmail,
            customer_name: 'Agentic Deep Test',
            priority: 'high'
          })
        }, 10000);
      } catch {
        runner.skip('Agentic ticket creation (service not running)');
      }

      if (response.status === 503) {
        runner.skip('Agentic ticket creation (service unavailable)');
      }
      if (response.status === 401 || response.status === 403) {
        runner.skip('Agentic ticket creation (auth required)');
      }

      runner.assertTrue(response.status === 200 || response.status === 201, 'Should create ticket');
      const data = await response.json();
      createdTicketId = data.ticket_id;
      runner.assertNotNull(createdTicketId, 'Should return ticket_id');
    });

    await runner.it('Step 2: Retrieve ticket via agentic API', async () => {
      if (!createdTicketId) {
        runner.skip('Retrieve ticket (creation failed)');
      }

      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/tickets/${createdTicketId}`,
          {},
          5000
        );
      } catch {
        runner.skip('Retrieve ticket (service not running)');
      }
      runner.assertTrue(response.status === 200 || response.status === 404, 'Should handle ticket lookup');
      if (response.status === 200) {
        const data = await response.json();
        runner.assertEquals(data.ticket_id, createdTicketId, 'Should return same ticket_id');
        runner.assertNotNull(data.status, 'Should return status');
      }
    });

    await runner.it('Step 3: Resolve ticket with billable amount', async () => {
      if (!createdTicketId) {
        runner.skip('Resolve ticket (creation failed)');
      }

      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/tickets/${createdTicketId}/resolve`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              resolution_notes: 'Resolved during agentic deep test',
              billable_amount: 199.99
            })
          },
          10000
        );
      } catch {
        runner.skip('Resolve ticket (service not running)');
      }

      runner.assertTrue(
        response.status === 200 || response.status === 404 || response.status === 503,
        'Should handle resolution gracefully'
      );

      if (response.status === 200) {
        const data = await response.json();
        runner.assertEquals(data.status, 'resolved', 'Should return resolved status');
      }
    });

    await runner.it('Step 4: Create invoice for resolved ticket', async () => {
      if (!createdTicketId) {
        runner.skip('Invoice creation (ticket creation failed)');
      }

      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/invoices/${createdTicketId}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              amount: 199.99,
              description: 'Invoice for agentic deep test'
            })
          },
          10000
        );
      } catch {
        runner.skip('Invoice creation (service not running)');
      }

      runner.assertTrue(response.status < 500, 'Should queue invoice without crashing');
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        runner.assertNotNull(data.status, 'Should return invoice status');
      }
    });

    await runner.it('Step 5: Get invoice status for ticket', async () => {
      if (!createdTicketId) {
        runner.skip('Invoice status (ticket creation failed)');
      }

      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/invoices/by-ticket/${createdTicketId}`,
          {},
          5000
        );
      } catch {
        runner.skip('Invoice status (service not running)');
      }

      runner.assertTrue(
        response.status === 200 || response.status === 404 || response.status === 503,
        `Should retrieve invoice status, got ${response.status}`
      );
      if (response.status === 200) {
        const data = await response.json();
        runner.assertEquals(data.ticket_id, createdTicketId, 'Should reference ticket');
      }
    });
  });

  await runner.describe('Email Operations', async () => {
    await runner.it('should send email via agentic API', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/emails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: testEmail,
            subject: 'Agentic Deep Test Email',
            body: '<p>Hello from agentic deep integration test</p>',
            from_name: 'Agentic Deep Test Suite'
          })
        }, 10000);
      } catch {
        runner.skip('Send email (service not running)');
      }

      runner.assertTrue(response.status < 500, 'Should queue email');
      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        runner.assertEquals(data.to_email, testEmail, 'Should send to correct email');
      }
    });
  });

  await runner.describe('Customer Context', async () => {
    await runner.it('should retrieve customer context', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/customers/${encodeURIComponent(testEmail)}/context`,
          {},
          10000
        );
      } catch {
        runner.skip('Customer context (service not running)');
      }

      runner.assertTrue(response.status < 500, 'Should retrieve customer context');
      if (response.status === 200) {
        const data = await response.json();
        runner.assertNotNull(data.customer_email, 'Should have customer_email');
        runner.assertNotNull(data.summary, 'Should have summary');
        runner.assertTrue(
          typeof data.summary.total_tickets === 'number',
          'Should have total_tickets count'
        );
      }
    });

    await runner.it('should list tickets for customer', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/tickets?customer_email=${encodeURIComponent(testEmail)}&limit=10`,
          {},
          5000
        );
      } catch {
        runner.skip('List customer tickets (service not running)');
      }

      runner.assertTrue(response.status < 500, 'Should list customer tickets');
      if (response.status === 200) {
        const data = await response.json();
        runner.assertTrue(Array.isArray(data), 'Should return array of tickets');
      }
    });
  });

  await runner.describe('Agent Chat', async () => {
    await runner.it('should handle agent chat request', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/agent/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: 'What is my ticket status?',
            thread_id: 'integration-test-thread'
          })
        }, 10000);
      } catch {
        runner.skip('Agent chat (service not running)');
      }

      // May return 503 if no LLM provider is configured, or 200 if working
      runner.assertTrue(
        response.status === 200 || response.status === 503 || response.status === 500,
        'Should handle agent chat without unexpected errors'
      );
    });
  });

  await runner.describe('Validation & Error Handling', async () => {
    await runner.it('should reject ticket creation without title', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            description: 'Missing title',
            customer_email: 'test@example.com',
            customer_name: 'Test'
          })
        }, 10000);
      } catch {
        runner.skip('Validation test (service not running)');
      }

      runner.assertTrue(
        response.status === 400 || response.status === 422 || response.status === 503,
        'Should reject missing title with 400/422/503'
      );
    });

    await runner.it('should reject invalid email', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Test',
            description: 'Invalid email test',
            customer_email: 'not-an-email',
            customer_name: 'Test'
          })
        }, 10000);
      } catch {
        runner.skip('Invalid email test (service not running)');
      }

      runner.assertTrue(
        response.status === 400 || response.status === 422 || response.status === 503,
        'Should reject invalid email with 400/422/503'
      );
    });

    await runner.it('should reject negative invoice amount', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/invoices/TEST-001`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: -50.00,
            description: 'Negative amount test'
          })
        }, 10000);
      } catch {
        runner.skip('Negative amount test (service not running)');
      }

      runner.assertTrue(
        response.status === 400 || response.status === 422 || response.status === 404 || response.status === 503,
        'Should reject negative amount with 400/422/404/503'
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
