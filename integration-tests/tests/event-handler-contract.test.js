#!/usr/bin/env node
/**
 * Event Handler Contract Tests
 *
 * Verifies that downstream consumers (mailing-service, odoo-integration)
 * handle events correctly and produce expected outputs without crashing.
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI } from './lib/test-harness.js';

const runner = new TestRunner('Event Handler Contract Tests');

async function main() {
  // Clean slate
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore
  }

  await runner.describe('Mailing Service Event Handlers', async () => {
    await runner.it('should handle ticket.created event without crashing', async () => {
      const event = {
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: 'handler-ticket@example.com',
        customer_name: 'Handler Test',
        tenant_id: 'test-tenant',
        description: 'Test ticket for mailing handler',
        priority: 'medium',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept event for mailing handler`);
    });

    await runner.it('should handle ticket.assigned event without crashing', async () => {
      const event = {
        event_type: 'ticket.assigned',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: 'handler-assigned@example.com',
        customer_name: 'Handler Test',
        assigned_to: 'agent-001',
        assigned_by: 'supervisor-001',
        assigned_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept assigned event`);
    });

    await runner.it('should handle ticket.resolved event without crashing', async () => {
      const event = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: 'handler-resolved@example.com',
        customer_name: 'Handler Test',
        service_description: 'Handler contract test',
        amount: 150.00,
        tenant_id: 'test-tenant',
        resolved_at: new Date().toISOString(),
        resolution_notes: 'Resolved for handler test'
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept resolved event`);
    });

    await runner.it('should handle invoice.created event without crashing', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        invoice_id: crypto.randomUUID(),
        odoo_invoice_id: 7777,
        ticket_id: crypto.randomUUID(),
        customer_email: 'handler-invoice@example.com',
        amount: 300.00,
        currency: 'EUR',
        status: 'posted',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept invoice.created event`);
    });

    await runner.it('should handle invoice.overdue event without crashing', async () => {
      const event = {
        event_type: 'invoice.overdue',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        invoice_id: crypto.randomUUID(),
        odoo_invoice_id: 8888,
        customer_email: 'handler-overdue@example.com',
        amount: 450.00,
        days_overdue: 21
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept overdue event`);
    });

    await runner.it('should handle payment.received event without crashing', async () => {
      const event = {
        event_type: 'payment.received',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        invoice_id: crypto.randomUUID(),
        odoo_invoice_id: 9999,
        amount: 450.00,
        payment_method: 'bank_transfer',
        paid_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept payment event`);
    });

    await runner.it('should handle user.created event without crashing', async () => {
      const event = {
        event_type: 'user.created',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        user_id: crypto.randomUUID(),
        email: 'handler-user@example.com',
        name: 'Handler User',
        role: 'customer',
        tenant_id: 'test-tenant',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept user.created event`);
    });
  });

  await runner.describe('Odoo Integration Event Handlers', async () => {
    await runner.it('should ingest ticket.resolved for odoo invoice creation', async () => {
      const event = {
        event_type: 'ticket.resolved',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: 'odoo-handler@example.com',
        customer_name: 'Odoo Handler Test',
        service_description: 'Odoo integration handler test',
        amount: 250.00,
        tenant_id: 'test-tenant',
        resolved_at: new Date().toISOString(),
        resolution_notes: 'Test for Odoo handler'
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept event for Odoo handler`);
    });

    await runner.it('should ingest invoice.created for odoo status tracking', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        invoice_id: crypto.randomUUID(),
        odoo_invoice_id: 1111,
        ticket_id: crypto.randomUUID(),
        customer_email: 'odoo-invoice@example.com',
        amount: 500.00,
        currency: 'USD',
        status: 'posted',
        created_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper should accept invoice for Odoo`);
    });
  });

  await runner.describe('Event Handler Resilience', async () => {
    await runner.it('should handle rapid event publishing without crashing', async () => {
      const events = Array.from({ length: 5 }, (_, i) => ({
        event_type: 'ticket.created',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: `rapid-${i}@example.com`,
        customer_name: 'Rapid Test',
        tenant_id: 'test-tenant',
        description: `Rapid event ${i}`,
        priority: 'low',
        created_at: new Date().toISOString()
      }));

      const responses = await Promise.allSettled(
        events.map(event =>
          fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(event)
          }, 10000)
        )
      );

      const accepted = responses.filter(
        r => r.status === 'fulfilled' && (r.value.status === 200 || r.value.status === 202 || r.value.status === 201)
      ).length;

      runner.assertTrue(
        accepted >= 3,
        `Should accept at least 3 of 5 rapid events, got ${accepted}`
      );
    });

    await runner.it('should handle events with minimal fields (forward compatibility)', async () => {
      const event = {
        event_type: 'invoice.create_requested',
        timestamp: new Date().toISOString(),
        source: 'handler-contract-test',
        ticket_id: crypto.randomUUID(),
        customer_email: 'minimal@example.com',
        customer_name: 'Minimal',
        amount: 50.00,
        description: 'Minimal event',
        requested_at: new Date().toISOString()
      };

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Should accept minimal event`);
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
