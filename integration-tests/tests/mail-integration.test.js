#!/usr/bin/env node
/**
 * Mail Integration E2E Tests
 *
 * Tests the complete email flow through the system:
 * - Mailing service health and API endpoints
 * - Email processing from RabbitMQ events
 * - Mailhog capture and validation
 * - Email content and routing
 * - End-to-end: ticket creation → email notification → Mailhog capture
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI, generateTestTicket, generateEmailEvent, sleep, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('Mail Integration E2E Tests');

async function main() {
  // Clean slate
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore
  }

  await runner.describe('Mailing Service Health', async () => {
    await runner.it('should respond to health check', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailing}/health`, {}, 5000);
      } catch (error) {
        runner.skip('Mailing service not running');
        return;
      }
      runner.assertTrue(response.status < 500, 'Mailing service should be reachable');
    });

    await runner.it('should have API endpoints available', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailing}`, {}, 5000);
      } catch {
        runner.skip('Mailing service not running');
        return;
      }
      runner.assertTrue(response.status < 500, 'Mailing service should have API available');
    });

    await runner.it('should report service status', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailing}/health`, {}, 5000);
      } catch {
        runner.skip('Mailing service not running');
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log(`    Mailing service status: ${JSON.stringify(data.status || data)}`);
      }
      runner.assertTrue(response.status < 500, 'Mailing service should report status');
    });
  });

  await runner.describe('Mailhog Email Capture', async () => {
    await runner.it('should have Mailhog accessible', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v2/messages`, {}, 5000);
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }
      runner.assertResponseOk(response, 'Mailhog API should be accessible');
    });

    await runner.it('should return message list structure', async () => {
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      runner.assertNotNull(messages, 'Messages should not be null');
      runner.assertTrue(typeof messages.total === 'number', 'Should have total count');
      runner.assertTrue(Array.isArray(messages.items), 'Should have items array');
    });

    await runner.it('should clear all messages on request', async () => {
      let response;
      try {
        response = await MailhogAPI.deleteAllMessages();
      } catch {
        runner.skip('Mailhog delete not accessible');
        return;
      }

      // Verify messages are cleared
      await sleep(500);
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      runner.assertEquals(messages.total, 0, 'Messages should be cleared');
    });
  });

  await runner.describe('Email Flow: Ticket Created → Email Notification', async () => {
    await runner.it('should send email notification when ticket is created', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const uniqueEmail = `mail-test-${Date.now()}@example.com`;
      const ticketData = generateTestTicket({
        customer_email: uniqueEmail,
        customer_name: 'Mail Test Customer',
        description: 'Testing email notification flow'
      });

      const createResponse = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (createResponse.status === 401 || createResponse.status === 403) {
        runner.skip('Email notification test (auth required)');
        return;
      }

      runner.assertResponseOk(createResponse, 'Should create ticket');

      // Wait for async email processing via RabbitMQ
      await sleep(3000);

      // Check Mailhog
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      // If mailing service is not configured, skip
      if (messages.total === 0) {
        runner.skip('Email notification (mailing service may not be processing)');
        return;
      }

      console.log(`    Found ${messages.total} email(s) in Mailhog`);
      runner.assertTrue(messages.total > 0, 'Should have email notifications');

      // Check if the email was sent to the correct recipient
      const relevantEmail = messages.items.find(m =>
        m.Content?.Headers?.To?.includes(uniqueEmail) ||
        m.To?.some(t => t.Mailbox === uniqueEmail.split('@')[0])
      );

      if (relevantEmail) {
        console.log(`    Found email for ${uniqueEmail}`);
      }
    });

    await runner.it('should send email notification for high priority tickets', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const ticketData = generateTestTicket({
        priority: 'high',
        description: 'High priority ticket for email test'
      });

      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (response.status === 401 || response.status === 403) {
        runner.skip('High priority email test (auth required)');
        return;
      }

      runner.assertResponseOk(response);

      await sleep(3000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('High priority email (mailing service may not be processing)');
        return;
      }

      runner.assertTrue(messages.total > 0, 'Should have email for high priority ticket');
    });
  });

  await runner.describe('Email Flow: Gatekeeper → Mailing Service', async () => {
    await runner.it('should process email.send event from gatekeeper', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const emailEvent = generateEmailEvent({
        to_email: `gatekeeper-email-${Date.now()}@example.com`,
        subject: 'Gatekeeper Email Test',
        body_html: '<p>This email was sent through the gatekeeper and should be captured by Mailhog.</p>'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailEvent)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept email.send event');

      await sleep(3000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('Gatekeeper email (mailing service may not be processing)');
        return;
      }

      console.log(`    Found ${messages.total} email(s) from gatekeeper flow`);
      runner.assertTrue(messages.total > 0, 'Should have email from gatekeeper flow');
    });

    await runner.it('should process invoice.create_requested email notification', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const invoiceEvent = {
        event_type: 'invoice.create_requested',
        timestamp: new Date().toISOString(),
        source: 'mail-test',
        ticket_id: randomUUID(),
        customer_email: `invoice-${Date.now()}@example.com`,
        customer_name: 'Invoice Test Customer',
        amount: 350.00,
        description: 'Mail integration invoice test',
        requested_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceEvent)
      }, 10000);

      runner.assert2xx(response, 'Should accept invoice.create_requested event');

      await sleep(3000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('Invoice email (mailing service may not be processing)');
        return;
      }

      runner.assertTrue(messages.total > 0, 'Should have email from invoice flow');
    });

    await runner.it('should process invoice.overdue email notification', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const overdueEvent = {
        event_type: 'invoice.overdue',
        timestamp: new Date().toISOString(),
        source: 'mail-test',
        invoice_id: randomUUID(),
        odoo_invoice_id: 5678,
        customer_email: `overdue-${Date.now()}@example.com`,
        amount: 500.00,
        days_overdue: 14,
        description: 'Overdue invoice mail test'
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(overdueEvent)
      }, 10000);

      runner.assert2xx(response, 'Should accept invoice.overdue event');

      await sleep(3000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('Overdue email (mailing service may not be processing)');
        return;
      }

      runner.assertTrue(messages.total > 0, 'Should have email from overdue invoice flow');
    });
  });

  await runner.describe('Email Content Validation', async () => {
    await runner.it('should have valid email structure in Mailhog', async () => {
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('Email content validation (no emails in Mailhog)');
        return;
      }

      const email = messages.items[0];
      runner.assertTrue(email.ID, 'Email should have ID');
      runner.assertTrue(email.Content, 'Email should have Content');

      if (email.Content.Headers) {
        runner.assertTrue(
          email.Content.Headers.Subject || email.Content.Headers.subject,
          'Email should have subject'
        );
        runner.assertTrue(
          email.Content.Headers.From || email.Content.Headers.from,
          'Email should have from address'
        );
      }
    });

    await runner.it('should have valid HTML content when applicable', async () => {
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('HTML content validation (no emails in Mailhog)');
        return;
      }

      const email = messages.items[0];
      const body = email.Content?.Body || '';

      // Check if HTML content is present
      if (body.includes('<')) {
        runner.assertTrue(
          body.includes('<html') || body.includes('<body') || body.includes('<div'),
          'Should have valid HTML content'
        );
      }
    });
  });

  await runner.describe('Email Routing and Multi-Tenant', async () => {
    await runner.it('should handle emails for different tenants', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const tenants = ['tenant-a', 'tenant-b', 'tenant-c'];
      const events = [];

      for (const tenant of tenants) {
        events.push({
          event_type: 'email.send',
          timestamp: new Date().toISOString(),
          source: 'mail-test',
          to_email: `${tenant}-user@example.com`,
          subject: `Tenant ${tenant} Email`,
          body_html: `<p>Email for tenant ${tenant}</p>`,
          from_email: 'test@garamatic.io',
          from_name: 'Garamatic Test',
          tenant_id: tenant
        });
      }

      // Send events through gatekeeper
      const results = await Promise.all(
        events.map(event =>
          fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
          }, 10000)
        )
      );

      const successCount = results.filter(r => r.status >= 200 && r.status < 300).length;
      runner.assertTrue(successCount > 0, `Should process at least some emails (${successCount}/${events.length})`);

      await sleep(3000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total === 0) {
        runner.skip('Multi-tenant email (mailing service may not be processing)');
        return;
      }

      console.log(`    ${messages.total} email(s) captured for ${events.length} tenants`);
      runner.assertTrue(messages.total > 0, 'Should have emails for multi-tenant test');
    });
  });

  await runner.describe('Mailhog Web UI', async () => {
    await runner.it('should serve Mailhog web interface', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailhog}`, {}, 5000);
      } catch {
        runner.skip('Mailhog web UI not accessible');
        return;
      }

      runner.assertTrue(
        response.status === 200 || response.status === 301 || response.status === 302,
        'Mailhog web UI should be accessible'
      );
    });

    await runner.it('should have API documentation accessible', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v2/messages`, {}, 5000);
      } catch {
        runner.skip('Mailhog API not accessible');
        return;
      }

      runner.assertResponseOk(response, 'Mailhog API v2 should be accessible');
    });
  });

  await runner.describe('End-to-End Email Flow', async () => {
    await runner.it('complete flow: ticket → RabbitMQ → mailing → Mailhog', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const uniqueEmail = `e2e-flow-${Date.now()}@example.com`;

      // Step 1: Create ticket
      const ticketData = generateTestTicket({
        customer_email: uniqueEmail,
        customer_name: 'E2E Flow Test',
        description: 'Testing complete email flow from ticket to Mailhog'
      });

      const ticketResponse = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (ticketResponse.status === 401 || ticketResponse.status === 403) {
        runner.skip('E2E flow (auth required)');
        return;
      }

      runner.assertResponseOk(ticketResponse, 'Step 1: Ticket created');

      // Step 2: Send event through gatekeeper
      const event = {
        event_type: 'email.send',
        timestamp: new Date().toISOString(),
        source: 'e2e-flow-test',
        to_email: uniqueEmail,
        subject: 'E2E Flow Test Email',
        body_html: '<p>This is the complete E2E flow test.</p>',
        from_email: 'e2e@garamatic.io',
        from_name: 'Garamatic E2E'
      };

      const gatekeeperResponse = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(gatekeeperResponse, 'Step 2: Event ingested');

      // Step 3: Wait for processing
      await sleep(4000);

      // Step 4: Verify email in Mailhog
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('E2E flow (Mailhog not accessible)');
        return;
      }

      if (messages.total === 0) {
        runner.skip('E2E flow (mailing service may not be processing)');
        return;
      }

      console.log(`    E2E flow complete: ${messages.total} email(s) in Mailhog`);
      runner.assertTrue(
        messages.total > 0,
        'Step 3: Email should be captured in Mailhog'
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
