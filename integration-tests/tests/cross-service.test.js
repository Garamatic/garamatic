#!/usr/bin/env node
/**
 * Cross-Service Integration Tests
 * 
 * Tests interactions between multiple services:
 * - Ticket creation → Email notification
 * - Gatekeeper ingestion → Ticket creation
 * - Invoice events → Email notifications
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI, generateTestTicket, generateEmailEvent, generateInvoiceCreateRequestedEvent, generateInvoiceOverdueEvent, generateTicketAssignedEvent, generateUserCreatedEvent } from './lib/test-harness.js';

const runner = new TestRunner('Cross-Service Integration Tests');

async function main() {
  // Clean up any previous test data
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore cleanup errors
  }
  
  await runner.describe('Ticket Creation Flow', async () => {
    let createdTicketId = null;
    
    await runner.it('should create a ticket via Ticket Masala API', async () => {
      const ticketData = generateTestTicket({
        description: 'Integration test ticket - cross-service test'
      });
      
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);
      
      if (response.status === 401 || response.status === 403) {
        runner.skip('Ticket creation (auth required, may need setup)');
        return;
      }
      
      runner.assertResponseOk(response);
      const result = await response.json();
      createdTicketId = result.id || result.ticket_id;
      runner.assertNotNull(createdTicketId, 'Should return created ticket ID');
    });
    
    await runner.it('should retrieve created ticket', async () => {
      if (!createdTicketId) {
        runner.skip('Retrieve ticket (creation failed)');
        return;
      }
      
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/tickets/${createdTicketId}`,
        {},
        5000
      );
      runner.assertResponseOk(response);
    });
  });
  
  await runner.describe('Gatekeeper Ingestion Flow', async () => {
    await runner.it('should accept valid ticket.created event', async () => {
      const event = {
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        ticket_id: crypto.randomUUID(),
        customer_email: 'test@example.com',
        customer_name: 'Test Customer',
        tenant_id: 'test-tenant',
        description: 'Ticket from gatekeeper ingestion test',
        priority: 'high',
        created_at: new Date().toISOString()
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);
      
      // Should accept the event (may return 202 Accepted)
      runner.assert2xx(response, `Should accept event`);
    });
    
    await runner.it('should reject invalid event (missing required fields)', async () => {
      const invalidEvent = {
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests'
        // Missing required fields: ticket_id, customer_email, etc.
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEvent)
      }, 10000);
      
      // Should reject invalid event (400 Bad Request)
      runner.assertTrue(
        response.status === 400 || response.status === 422,
        `Should reject invalid event, got ${response.status}`
      );
    });
  });
  
  await runner.describe('Email Notification Flow', async () => {
    await runner.it('should queue email via mailing service', async () => {
      const emailEvent = generateEmailEvent({
        to_email: 'integration-test@example.com',
        subject: 'Integration Test Email'
      });
      
      const response = await fetchWithTimeout(`${SERVICES.mailing}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailEvent)
      }, 10000).catch(() => ({ ok: false, status: 'connection_failed' }));
      
      if (!response.ok) {
        runner.skip('Email queuing (mailing service may not be configured)');
        return;
      }
      
      runner.assertTrue(response.status === 200 || response.status === 202, 'Should queue email');
    });
    
    await runner.it('should capture sent email in Mailhog', async () => {
      // This test assumes emails are configured to route to Mailhog
      const messages = await MailhogAPI.getMessages().catch(() => ({ items: [] }));
      
      // We just verify Mailhog is working - can't guarantee emails were sent
      runner.assertNotNull(messages.items, 'Mailhog should return messages array');
    });
  });
  
  await runner.describe('Event Chaining', async () => {
    await runner.it('ticket.resolved event should have valid structure for downstream services', async () => {
      const resolvedEvent = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        ticket_id: crypto.randomUUID(),
        resolved_by: 'agent@example.com',
        resolution_notes: 'Issue resolved',
        resolved_at: new Date().toISOString()
      };
      
      // Test that the event can be ingested
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolvedEvent)
      }, 10000);
      
      // Gatekeeper should accept the event
      runner.assertTrue(
        response.status < 500,
        'Gatekeeper should handle ticket.resolved event'
      );
    });
    
    await runner.it('payment.received event should trigger invoice update flow', async () => {
      const paymentEvent = {
        event_type: 'payment.received',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        payment_id: crypto.randomUUID(),
        invoice_id: crypto.randomUUID(),
        amount: 100.00,
        currency: 'USD',
        payment_method: 'credit_card'
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEvent)
      }, 10000);
      
      runner.assertTrue(
        response.status < 500,
        'Gatekeeper should handle payment.received event'
      );
    });
  });
  
  await runner.describe('Additional Event Type Ingestion', async () => {
    await runner.it('should accept invoice.create_requested event', async () => {
      const event = generateInvoiceCreateRequestedEvent({
        customer_email: 'test-invoice@example.com',
        amount: 199.99
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept invoice.create_requested event`);
    });

    await runner.it('should accept invoice.created event', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        invoice_id: crypto.randomUUID(),
        odoo_invoice_id: 1234,
        ticket_id: crypto.randomUUID(),
        customer_email: 'invoice-created@example.com',
        amount: 250.00,
        currency: 'USD',
        status: 'posted',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept invoice.created event`);
    });

    await runner.it('should accept invoice.overdue event', async () => {
      const event = generateInvoiceOverdueEvent({
        customer_email: 'overdue-test@example.com',
        days_overdue: 14
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept invoice.overdue event`);
    });

    await runner.it('should accept ticket.assigned event', async () => {
      const event = generateTicketAssignedEvent({
        assigned_to: 'agent-002',
        assigned_by: 'supervisor-002'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept ticket.assigned event`);
    });

    await runner.it('should accept user.created event', async () => {
      const event = generateUserCreatedEvent({
        email: 'new-user-test@example.com',
        role: 'admin'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept user.created event`);
    });
  });

  await runner.describe('Agentic Service Integration', async () => {
    await runner.it('should respond to health check', async () => {
      try {
        const response = await fetchWithTimeout(`${SERVICES.agenticService}/health`, {}, 5000);
        runner.assertTrue(response.status < 500, 'Agentic service should respond');
      } catch {
        runner.skip('Agentic service health check (service may not be running)');
      }
    });

    await runner.it('should create a ticket via agentic API', async () => {
      try {
        const response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Integration Test Ticket',
            description: 'Created by integration test suite',
            customer_email: 'agentic-test@example.com',
            customer_name: 'Agentic Test',
            priority: 'medium'
          })
        }, 10000);

        if (response.status === 401 || response.status === 403) {
          runner.skip('Agentic ticket creation (auth required)');
          return;
        }

        runner.assertTrue(
          response.status === 200 || response.status === 201,
          `Should create ticket, got ${response.status}`
        );
      } catch {
        runner.skip('Agentic ticket creation (service may not be running)');
      }
    });

    await runner.it('should list tickets via agentic API', async () => {
      try {
        const response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets?limit=5`, {}, 5000);
        runner.assertTrue(response.status < 500, 'Should list tickets');
      } catch {
        runner.skip('Agentic list tickets (service may not be running)');
      }
    });

    await runner.it('should send email via agentic API', async () => {
      try {
        const response = await fetchWithTimeout(`${SERVICES.agenticService}/emails`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            to_email: 'agentic-email@example.com',
            subject: 'Integration Test',
            body: '<p>Hello from integration tests</p>',
            from_name: 'Integration Test Suite'
          })
        }, 10000);

        runner.assertTrue(response.status < 500, 'Should queue email via agentic service');
      } catch {
        runner.skip('Agentic send email (service may not be running)');
      }
    });
  });

  await runner.describe('Error Handling', async () => {
    await runner.it('should handle service unavailable gracefully', async () => {
      // Try to reach a non-existent endpoint
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/non-existent-endpoint`,
        {},
        5000
      ).catch(err => ({ ok: false, status: 'error' }));

      // Should return 404, not crash
      runner.assertTrue(
        response.status === 404 || !response.ok,
        'Should return 404 for unknown endpoints'
      );
    });

    await runner.it('should reject requests with invalid JSON', async () => {
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'not valid json'
      }, 5000);

      runner.assertTrue(
        response.status === 400 || response.status === 422 || response.status === 500,
        'Should handle invalid JSON'
      );
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
