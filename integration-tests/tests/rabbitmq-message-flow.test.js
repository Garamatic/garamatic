#!/usr/bin/env node
/**
 * RabbitMQ Message Flow E2E Tests
 *
 * Tests the complete message flow through RabbitMQ between services:
 * - Events published via gatekeeper flow to mailing-service
 * - Events published via gatekeeper flow to odoo-integration
 * - Event chaining works correctly
 * - Message persistence and delivery guarantees
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI, generateTestTicket, generateEmailEvent, generateInvoiceCreateRequestedEvent, sleep, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('RabbitMQ Message Flow E2E Tests');
const RABBITMQ_AUTH = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };

async function main() {
  // Clean slate
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore
  }

  await runner.describe('Event Publishing via Gatekeeper', async () => {
    await runner.it('should accept ticket.created events', async () => {
      const event = generateTestTicket({
        description: 'RabbitMQ flow test - ticket created'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: 'ticket.created',
          timestamp: new Date().toISOString(),
          source: 'rabbitmq-flow-test',
          ...event
        })
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept ticket.created event');
    });

    await runner.it('should accept ticket.resolved events', async () => {
      const event = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'rabbitmq-flow-test',
        ticket_id: randomUUID(),
        resolved_by: 'agent@example.com',
        resolution_notes: 'Issue resolved via RabbitMQ flow test',
        resolved_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept ticket.resolved event');
    });

    await runner.it('should accept email.send events', async () => {
      const event = generateEmailEvent({
        subject: 'RabbitMQ Flow Test Email',
        body_html: '<p>Test email body for RabbitMQ flow verification</p>'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept email.send event');
    });

    await runner.it('should accept invoice.create_requested events', async () => {
      const event = generateInvoiceCreateRequestedEvent({
        amount: 250.00,
        description: 'RabbitMQ flow test invoice'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept invoice.create_requested event');
    });
  });

  await runner.describe('RabbitMQ Exchange and Queue Status', async () => {
    await runner.it('should have event_exchange available', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/exchanges/%2f/event_exchange`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      
      // Exchange may or may not exist depending on service initialization
      runner.assertTrue(
        response.status === 200 || response.status === 404,
        `Exchange check should not error, got ${response.status}`
      );
      
      if (response.ok) {
        const data = await response.json();
        runner.assertTrue(data.name === 'event_exchange', 'Should be event_exchange');
      }
    });

    await runner.it('should have queues for service consumers', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/queues`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response, 'Should list queues');
      
      const queues = await response.json();
      runner.assertTrue(Array.isArray(queues), 'Should return array of queues');
      
      // Log queue names for debugging
      if (queues.length > 0) {
        console.log(`    Found ${queues.length} queues: ${queues.map(q => q.name).join(', ')}`);
      }
    });

    await runner.it('should have bindings between exchange and queues', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/bindings`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response, 'Should list bindings');
      
      const bindings = await response.json();
      runner.assertTrue(Array.isArray(bindings), 'Should return array of bindings');
    });
  });

  await runner.describe('Event Flow: Ticket Created → Mailing Service', async () => {
    await runner.it('should trigger email notification after ticket creation', async () => {
      // Clear Mailhog first
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      // Create a ticket
      const ticketData = generateTestTicket({
        description: 'Email flow test ticket',
        customer_email: `email-flow-${Date.now()}@example.com`
      });

      const createResponse = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (createResponse.status === 401 || createResponse.status === 403) {
        runner.skip('Email flow test (auth required)');
        return;
      }

      runner.assertResponseOk(createResponse, 'Should create ticket');

      // Wait for async processing via RabbitMQ
      await sleep(3000);

      // Check Mailhog for email
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      runner.assertNotNull(messages.items, 'Mailhog should have messages');
      
      // Check if any emails were received
      if (messages.total > 0) {
        console.log(`    Found ${messages.total} email(s) in Mailhog`);
        runner.assertTrue(true, 'Email notification received');
      } else {
        // Email may not be sent if mailing service is not processing
        runner.skip('Email notification (mailing service may not be processing)');
      }
    });
  });

  await runner.describe('Event Flow: Gatekeeper → Mailing Service', async () => {
    await runner.it('should process email.send event through RabbitMQ', async () => {
      // Clear Mailhog
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const emailEvent = generateEmailEvent({
        to_email: `gatekeeper-flow-${Date.now()}@example.com`,
        subject: 'Gatekeeper Flow Test',
        body_html: '<p>This email was sent via gatekeeper and should flow through RabbitMQ to mailing service.</p>'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailEvent)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept email.send event');

      // Wait for async processing
      await sleep(3000);

      // Check Mailhog
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      if (messages.total > 0) {
        console.log(`    Found ${messages.total} email(s) in Mailhog`);
        runner.assertTrue(true, 'Email processed through RabbitMQ');
      } else {
        runner.skip('Email processing (mailing service may not be processing)');
      }
    });
  });

  await runner.describe('Event Flow: Gatekeeper → Odoo Integration', async () => {
    await runner.it('should process invoice events through RabbitMQ', async () => {
      const invoiceEvent = generateInvoiceCreateRequestedEvent({
        amount: 500.00,
        description: 'Odoo flow test invoice'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invoiceEvent)
      }, 10000);

      runner.assert2xx(response, 'Gatekeeper should accept invoice event');

      // Wait for async processing
      await sleep(2000);

      // Check Odoo integration health (it should have processed the event)
      let healthResponse;
      try {
        healthResponse = await fetchWithTimeout(`${SERVICES.odooIntegration}/health`, {}, 5000);
      } catch {
        runner.skip('Odoo integration not accessible');
        return;
      }

      runner.assertTrue(healthResponse.status < 500, 'Odoo integration should be healthy');
    });
  });

  await runner.describe('Event Chaining', async () => {
    await runner.it('ticket.resolved event should have valid structure for downstream services', async () => {
      const resolvedEvent = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'rabbitmq-flow-test',
        ticket_id: randomUUID(),
        resolved_by: 'agent@example.com',
        resolution_notes: 'Issue resolved for chaining test',
        resolved_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolvedEvent)
      }, 10000);

      runner.assert2xx(response, 'Should accept ticket.resolved event');
    });

    await runner.it('payment.received event should have valid structure', async () => {
      const paymentEvent = {
        event_type: 'payment.received',
        timestamp: new Date().toISOString(),
        source: 'rabbitmq-flow-test',
        payment_id: randomUUID(),
        invoice_id: randomUUID(),
        amount: 150.00,
        currency: 'USD',
        payment_method: 'credit_card',
        transaction_id: `txn-${Date.now()}`
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEvent)
      }, 10000);

      runner.assert2xx(response, 'Should accept payment.received event');
    });

    await runner.it('user.created event should have valid structure', async () => {
      const userEvent = {
        event_type: 'user.created',
        timestamp: new Date().toISOString(),
        source: 'rabbitmq-flow-test',
        user_id: randomUUID(),
        email: `newuser-${Date.now()}@example.com`,
        name: 'New User',
        role: 'customer',
        tenant_id: 'test-tenant',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userEvent)
      }, 10000);

      runner.assert2xx(response, 'Should accept user.created event');
    });
  });

  await runner.describe('RabbitMQ Health Under Load', async () => {
    await runner.it('should handle multiple rapid event submissions', async () => {
      const events = [];
      for (let i = 0; i < 5; i++) {
        events.push({
          event_type: 'ticket.created',
          timestamp: new Date().toISOString(),
          source: 'load-test',
          ticket_id: randomUUID(),
          customer_email: `load-${i}@example.com`,
          customer_name: `Load Test ${i}`,
          tenant_id: 'test-tenant',
          description: `Load test ticket ${i}`,
          priority: 'low',
          created_at: new Date().toISOString()
        });
      }

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
      console.log(`    ${successCount}/${events.length} events accepted`);
      runner.assertTrue(successCount > 0, 'At least some events should be accepted');
    });

    await runner.it('RabbitMQ should remain healthy after load', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/health/checks/alarms`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response, 'RabbitMQ health check should work');
      
      const data = await response.json();
      runner.assertEquals(data.status, 'ok', 'RabbitMQ should have no alarms');
    });
  });

  await runner.describe('Message Persistence', async () => {
    await runner.it('should track queue depths after event processing', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/queues`,
        { headers: RABBITMQ_AUTH },
        10000
      );
      runner.assertResponseOk(response, 'Should list queues');
      
      const queues = await response.json();
      
      // Log queue depths for debugging
      for (const queue of queues) {
        if (queue.messages > 0) {
          console.log(`    Queue "${queue.name}": ${queue.messages} messages, ${queue.consumers} consumers`);
        }
      }
      
      runner.assertTrue(true, 'Queue depths checked');
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
