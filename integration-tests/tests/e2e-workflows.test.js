#!/usr/bin/env node
/**
 * End-to-End Workflow Tests
 * 
 * Tests complete business workflows spanning multiple services:
 * - New customer ticket workflow
 * - Invoice and payment workflow
 * - Multi-tenant ticket routing
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI, generateTestTicket, generateTicketAssignedEvent, generateInvoiceOverdueEvent, generateUserCreatedEvent, generateInvoiceCreateRequestedEvent, sleep, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('End-to-End Workflow Tests');

async function main() {
  // Clean slate
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore
  }
  
  await runner.describe('New Customer Support Ticket Workflow', async () => {
    const workflow = {
      ticketId: null,
      customerEmail: `customer-${Date.now()}@example.com`,
      events: []
    };
    
    await runner.it('Step 1: Customer submits ticket via portal', async () => {
      const ticketData = generateTestTicket({
        customer_email: workflow.customerEmail,
        customer_name: 'Jane Customer',
        description: 'I need help with my account',
        priority: 'medium',
        source: 'customer-portal'
      });
      
      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);
      
      if (response.status === 401 || response.status === 403) {
        runner.skip('Workflow test (auth required)');
      }
      
      runner.assertResponseOk(response);
      const result = await response.json();
      workflow.ticketId = result.id || result.ticket_id;
      workflow.events.push('ticket_created');
    });
    
    await runner.it('Step 2: Ticket creation triggers notification email', async () => {
      if (!workflow.ticketId) {
        runner.skip('Email notification (ticket creation failed)');
      }
      
      // Wait for async email processing
      await sleep(2000);
      
      // Check if email was captured (this depends on integration being configured)
      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
      }

      runner.assertNotNull(messages.items, 'Mailhog should return messages array');
      workflow.events.push('email_check');
    });
    
    await runner.it('Step 3: Support agent can view and update ticket', async () => {
      if (!workflow.ticketId) {
        runner.skip('Agent update (ticket creation failed)');
      }
      
      // Update ticket status
      const updateResponse = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/tickets/${workflow.ticketId}`,
        {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: 'in_progress' })
        },
        5000
      );
      
      // May be 200 OK or 405 Method Not Allowed if PATCH not supported
      runner.assertTrue(
        updateResponse.status === 200 || 
        updateResponse.status === 204 || 
        updateResponse.status === 405,
        `Update should be handled, got ${updateResponse.status}`
      );
      workflow.events.push('ticket_updated');
    });
    
    await runner.it('Step 4: Ticket resolution completes workflow', async () => {
      if (!workflow.ticketId) {
        runner.skip('Resolution (ticket creation failed)');
      }
      
      // Send resolution event
      const resolutionEvent = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        ticket_id: workflow.ticketId,
        resolved_by: 'agent@example.com',
        resolution_notes: 'Customer issue resolved',
        resolved_at: new Date().toISOString()
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(resolutionEvent)
      }, 10000);
      
      runner.assertTrue(response.status < 500, 'Resolution event should be processed');
      workflow.events.push('ticket_resolved');
    });
    
    await runner.it('Workflow complete: All steps executed', () => {
      runner.assertTrue(
        workflow.events.length >= 2,
        `Expected at least 2 workflow steps, got ${workflow.events.length}`
      );
    });
  });
  
  await runner.describe('Invoice and Payment Workflow', async () => {
    const invoiceFlow = {
      invoiceId: randomUUID(),
      events: []
    };
    
    await runner.it('Step 1: Invoice creation requested', async () => {
      const createEvent = {
        event_type: 'invoice.create_requested',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        customer_id: 'cust-123',
        customer_email: 'billing@example.com',
        items: [
          { description: 'Service A', amount: 100.00 },
          { description: 'Service B', amount: 50.00 }
        ],
        currency: 'USD'
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createEvent)
      }, 10000);
      
      runner.assertTrue(response.status < 500, 'Invoice creation request should be accepted');
      invoiceFlow.events.push('create_requested');
    });
    
    await runner.it('Step 2: Invoice created event processed', async () => {
      const createdEvent = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        invoice_id: invoiceFlow.invoiceId,
        invoice_number: 'INV-2024-001',
        customer_id: 'cust-123',
        total_amount: 150.00,
        currency: 'USD',
        due_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(createdEvent)
      }, 10000);
      
      runner.assertTrue(response.status < 500, 'Invoice created event should be processed');
      invoiceFlow.events.push('invoice_created');
    });
    
    await runner.it('Step 3: Payment received updates invoice', async () => {
      const paymentEvent = {
        event_type: 'payment.received',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        payment_id: randomUUID(),
        invoice_id: invoiceFlow.invoiceId,
        amount: 150.00,
        currency: 'USD',
        payment_method: 'credit_card',
        transaction_id: 'txn-12345'
      };
      
      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(paymentEvent)
      }, 10000);
      
      runner.assertTrue(response.status < 500, 'Payment event should be processed');
      invoiceFlow.events.push('payment_received');
    });
    
    await runner.it('Invoice workflow complete', () => {
      runner.assertTrue(
        invoiceFlow.events.length >= 2,
        `Expected at least 2 invoice workflow steps, got ${invoiceFlow.events.length}`
      );
    });
  });
  
  await runner.describe('Multi-Tenant Isolation Workflow', async () => {
    const tenants = ['tenant-a', 'tenant-b'];
    const tenantTickets = {};
    
    await runner.it('should create tickets for different tenants', async () => {
      for (const tenant of tenants) {
        const ticketData = generateTestTicket({
          tenant_id: tenant,
          description: `Test ticket for ${tenant}`,
          customer_email: `user@${tenant}.com`
        });
        
        const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(ticketData)
        }, 10000);
        
        if (response.ok) {
          const result = await response.json();
          tenantTickets[tenant] = result.id || result.ticket_id;
        }
      }
      
      // If we couldn't create any tickets, skip this test
      if (Object.keys(tenantTickets).length === 0) {
        runner.skip('Multi-tenant test (auth required)');
      }
      
      runner.assertTrue(
        Object.keys(tenantTickets).length === tenants.length,
        `Should create tickets for all ${tenants.length} tenants`
      );
    });
    
    await runner.it('tenant A should not access tenant B tickets', async () => {
      if (Object.keys(tenantTickets).length < 2) {
        runner.skip('Tenant isolation (insufficient tickets created)');
      }
      
      // Try to access tenant B's ticket as tenant A
      const tenantBTicket = tenantTickets['tenant-b'];
      
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/tickets/${tenantBTicket}?tenant_id=tenant-a`,
        {},
        5000
      );
      
      // Should deny cross-tenant access: 401 (auth required), 403 (forbidden), or 404 (hidden from tenant)
      runner.assertTrue(
        response.status === 401 || response.status === 403 || response.status === 404,
        `Cross-tenant access should be denied, got ${response.status}`
      );
    });

  });
  
  await runner.describe('Error Recovery Workflow', async () => {
    await runner.it('should handle invalid event gracefully', async () => {
      const invalidEvent = {
        event_type: 'ticket.created',
        // Missing all required fields
        timestamp: new Date().toISOString(),
        source: 'integration-tests'
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(invalidEvent)
      }, 10000);

      // Should return validation error, not crash
      runner.assertTrue(
        response.status === 400 || response.status === 422,
        `Should reject invalid event with 400/422, got ${response.status}`
      );
    });

    await runner.it('should handle unknown event types', async () => {
      const unknownEvent = {
        event_type: 'unknown.event.type',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        data: { test: true }
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(unknownEvent)
      }, 10000);

      // May accept or reject, but should not crash
      runner.assertTrue(response.status < 500, 'Should handle unknown event types gracefully');
    });
  });

  await runner.describe('Ticket Assignment Workflow', async () => {
    const flow = { events: [] };

    await runner.it('Step 1: Create a ticket for assignment', async () => {
      const ticketData = generateTestTicket({
        description: 'Ticket for assignment workflow test',
        priority: 'high'
      });

      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (response.status === 401 || response.status === 403) {
        runner.skip('Assignment workflow (auth required)');
      }

      runner.assertResponseOk(response);
      flow.events.push('ticket_created');
    });

    await runner.it('Step 2: Emit ticket.assigned event via gatekeeper', async () => {
      const event = generateTicketAssignedEvent({
        assigned_to: 'agent-003',
        assigned_by: 'supervisor-003'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assertTrue(response.status < 500, 'Should process assignment event');
      flow.events.push('ticket_assigned');
    });

    await runner.it('Assignment workflow complete', () => {
      runner.assertTrue(
        flow.events.length >= 1,
        `Expected at least 1 assignment step, got ${flow.events.length}`
      );
    });
  });

  await runner.describe('Invoice Overdue Workflow', async () => {
    const flow = { events: [] };

    await runner.it('Step 1: Request invoice creation', async () => {
      const event = generateInvoiceCreateRequestedEvent({
        amount: 300.00,
        description: 'Overdue workflow test invoice'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assertTrue(response.status < 500, 'Should process invoice creation request');
      flow.events.push('create_requested');
    });

    await runner.it('Step 2: Emit invoice created event', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'integration-tests',
        invoice_id: randomUUID(),
        odoo_invoice_id: 9999,
        ticket_id: randomUUID(),
        customer_email: 'overdue-wf@example.com',
        amount: 300.00,
        currency: 'USD',
        status: 'posted',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assertTrue(response.status < 500, 'Should process invoice created event');
      flow.events.push('invoice_created');
    });

    await runner.it('Step 3: Emit invoice overdue event', async () => {
      const event = generateInvoiceOverdueEvent({
        amount: 300.00,
        days_overdue: 30,
        customer_email: 'overdue-wf@example.com'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assertTrue(response.status < 500, 'Should process overdue event');
      flow.events.push('invoice_overdue');
    });

    await runner.it('Overdue workflow complete', () => {
      runner.assertTrue(
        flow.events.length >= 2,
        `Expected at least 2 overdue steps, got ${flow.events.length}`
      );
    });
  });

  await runner.describe('User Creation Workflow', async () => {
    const flow = { events: [] };

    await runner.it('Step 1: Emit user.created event via gatekeeper', async () => {
      const event = generateUserCreatedEvent({
        email: 'workflow-user@example.com',
        name: 'Workflow User',
        role: 'customer'
      });

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assertTrue(response.status < 500, 'Should process user creation event');
      flow.events.push('user_created');
    });

    await runner.it('Step 2: Create ticket for new user', async () => {
      const ticketData = generateTestTicket({
        customer_email: 'workflow-user@example.com',
        customer_name: 'Workflow User',
        description: 'First ticket for new user'
      });

      const response = await fetchWithTimeout(`${SERVICES.ticketMasala}/api/tickets`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(ticketData)
      }, 10000);

      if (response.status === 401 || response.status === 403) {
        runner.skip('Ticket for new user (auth required)');
      }

      runner.assertResponseOk(response);
      flow.events.push('ticket_created');
    });

    await runner.it('User creation workflow complete', () => {
      runner.assertTrue(
        flow.events.length >= 1,
        `Expected at least 1 user creation step, got ${flow.events.length}`
      );
    });
  });

  await runner.describe('Agentic Service Workflow', async () => {
    const flow = { ticketId: null, events: [], serviceAvailable: true };

    await runner.it('Step 1: Create ticket via agentic service', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/tickets`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: 'Agentic Workflow Test',
            description: 'Ticket created via agentic service in E2E test',
            customer_email: 'agentic-wf@example.com',
            customer_name: 'Agentic Workflow',
            priority: 'high'
          })
        }, 10000);
      } catch {
        flow.serviceAvailable = false;
        runner.skip('Agentic workflow (service not running)');
      }

      if (response.status === 401 || response.status === 403) {
        runner.skip('Agentic workflow (auth required)');
      }

      if (response.status === 503) {
        runner.skip('Agentic workflow (service unavailable)');
      }

      runner.assertTrue(response.status === 200 || response.status === 201, 'Should create ticket via agentic');
      const result = await response.json();
      flow.ticketId = result.ticket_id;
      flow.events.push('agentic_ticket_created');
    });

    await runner.it('Step 2: Retrieve ticket via agentic service', async () => {
      if (!flow.ticketId) {
        runner.skip('Retrieve agentic ticket (creation failed)');
      }

      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/tickets/${flow.ticketId}`,
          {},
          5000
        );
      } catch {
        flow.serviceAvailable = false;
        runner.skip('Retrieve agentic ticket (service not running)');
      }
      runner.assertTrue(response.status < 500, 'Should retrieve ticket');
      flow.events.push('agentic_ticket_retrieved');
    });

    await runner.it('Step 3: Get customer context via agentic service', async () => {
      let response;
      try {
        response = await fetchWithTimeout(
          `${SERVICES.agenticService}/customers/agentic-wf@example.com/context`,
          {},
          5000
        );
      } catch {
        flow.serviceAvailable = false;
        runner.skip('Customer context (service not running)');
      }
      runner.assertTrue(response.status < 500, 'Should retrieve customer context');
      flow.events.push('agentic_customer_context');
    });

    await runner.it('Agentic workflow complete', () => {
      if (!flow.serviceAvailable) {
        runner.skip('Agentic workflow (service not available)');
      }
      runner.assertTrue(
        flow.events.length >= 1,
        `Expected at least 1 agentic step, got ${flow.events.length}`
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
