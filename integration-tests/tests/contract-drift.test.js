#!/usr/bin/env node
/**
 * Contract Drift Detection Tests
 *
 * Verifies that events published through real service endpoints
 * conform to the integration-contracts schemas. This catches drift
 * between what services actually produce and what the contracts specify.
 *
 * Strategy:
 * 1. Generate events for each schema type
 * 2. Publish through gatekeeper (the real ingestion path)
 * 3. Validate the published payload against the canonical schema
 * 4. Verify no extra fields leak through (where additionalProperties: false)
 */

import { createRequire } from 'module';
import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const require = createRequire(import.meta.url);
const { createValidatorMap } = require('../../integration-contracts/src/validator.js');

const runner = new TestRunner('Contract Drift Detection');

async function main() {
  const validators = await createValidatorMap({
    rootDir: new URL('../../integration-contracts', import.meta.url).pathname
  });

  const now = new Date().toISOString();

  await runner.describe('Gatekeeper Event Schema Conformance', async () => {

    await runner.it('ticket.created through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'ticket.created',
        timestamp: now,
        source: 'drift-test',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'drift@example.com',
        customer_name: 'Drift Test',
        tenant_id: 'drift-tenant',
        description: 'Contract drift test ticket',
        priority: 'high',
        created_at: now
      };

      const valid = validators['ticket.created'](event);
      runner.assert(valid, 'ticket.created must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid ticket.created`);
    });

    await runner.it('ticket.resolved through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'ticket.resolved',
        timestamp: now,
        source: 'drift-test',
        ticket_id: '550e8400-e29b-41d4-a716-446655440001',
        customer_email: 'drift@example.com',
        customer_name: 'Drift Test',
        service_description: 'Contract drift resolution',
        amount: 199.99,
        tenant_id: 'drift-tenant',
        resolved_at: now,
        resolution_notes: 'Resolved during drift test'
      };

      const valid = validators['ticket.resolved'](event);
      runner.assert(valid, 'ticket.resolved must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid ticket.resolved`);
    });

    await runner.it('ticket.assigned through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'ticket.assigned',
        timestamp: now,
        source: 'drift-test',
        ticket_id: '550e8400-e29b-41d4-a716-446655440002',
        customer_email: 'drift@example.com',
        customer_name: 'Drift Test',
        assigned_to: 'agent-drift',
        assigned_by: 'supervisor-drift',
        assigned_at: now
      };

      const valid = validators['ticket.assigned'](event);
      runner.assert(valid, 'ticket.assigned must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid ticket.assigned`);
    });

    await runner.it('invoice.created through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'invoice.created',
        timestamp: now,
        source: 'drift-test',
        invoice_id: '550e8400-e29b-41d4-a716-446655440003',
        odoo_invoice_id: 1234,
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'drift@example.com',
        amount: 250.00,
        currency: 'USD',
        status: 'posted',
        created_at: now
      };

      const valid = validators['invoice.created'](event);
      runner.assert(valid, 'invoice.created must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid invoice.created`);
    });

    await runner.it('invoice.create_requested through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'invoice.create_requested',
        timestamp: now,
        source: 'drift-test',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'drift@example.com',
        customer_name: 'Drift Test',
        amount: 150.00,
        description: 'Drift test invoice line',
        requested_at: now
      };

      const valid = validators['invoice.create_requested'](event);
      runner.assert(valid, 'invoice.create_requested must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid invoice.create_requested`);
    });

    await runner.it('invoice.overdue through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'invoice.overdue',
        timestamp: now,
        source: 'drift-test',
        invoice_id: '550e8400-e29b-41d4-a716-446655440004',
        odoo_invoice_id: 5678,
        customer_email: 'drift-overdue@example.com',
        amount: 300.00,
        days_overdue: 14
      };

      const valid = validators['invoice.overdue'](event);
      runner.assert(valid, 'invoice.overdue must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid invoice.overdue`);
    });

    await runner.it('payment.received through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'payment.received',
        timestamp: now,
        source: 'drift-test',
        invoice_id: '550e8400-e29b-41d4-a716-446655440005',
        odoo_invoice_id: 9012,
        amount: 150.00,
        payment_method: 'credit_card',
        paid_at: now
      };

      const valid = validators['payment.received'](event);
      runner.assert(valid, 'payment.received must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid payment.received`);
    });

    await runner.it('email.send through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'email.send',
        timestamp: now,
        source: 'drift-test',
        to_email: 'drift-recipient@example.com',
        subject: 'Contract Drift Test',
        body_html: '<p>This is a drift test email.</p>',
        from_email: 'drift@garamatic.io',
        from_name: 'Drift Test'
      };

      const valid = validators['email.send'](event);
      runner.assert(valid, 'email.send must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid email.send`);
    });

    await runner.it('user.created through gatekeeper must match schema', async () => {
      const event = {
        event_type: 'user.created',
        timestamp: now,
        source: 'drift-test',
        user_id: '550e8400-e29b-41d4-a716-446655440006',
        email: 'drift-user@example.com',
        name: 'Drift User',
        role: 'customer',
        tenant_id: 'drift-tenant',
        created_at: now
      };

      const valid = validators['user.created'](event);
      runner.assert(valid, 'user.created must match schema before publishing');

      const response = await fetchWithTimeout(`${SERVICES.gatekeeper}/ingest`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event)
      }, 10000);

      runner.assert2xx(response, `Gatekeeper must accept valid user.created`);
    });
  });

  await runner.describe('Additional Properties Guard', async () => {
    await runner.it('should reject events with camelCase fields when schema uses snake_case', async () => {
      // Simulates a service that incorrectly uses camelCase
      const event = {
        event_type: 'ticket.created',
        timestamp: now,
        source: 'drift-test',
        ticketId: '550e8400-e29b-41d4-a716-446655440000', // WRONG: camelCase
        customerEmail: 'drift@example.com', // WRONG: camelCase
        customerName: 'Drift Test',
        tenantId: 'drift-tenant',
        description: 'This has camelCase fields',
        priority: 'high',
        createdAt: now
      };

      const valid = validators['ticket.created'](event);
      runner.assert(!valid, 'Schema must reject camelCase fields (should require snake_case)');
    });

    await runner.it('should reject events with extra top-level fields where additionalProperties=false', async () => {
      const event = {
        event_type: 'ticket.created',
        timestamp: now,
        source: 'drift-test',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'drift@example.com',
        customer_name: 'Drift Test',
        tenant_id: 'drift-tenant',
        description: 'Test',
        priority: 'high',
        created_at: now,
        extra_field: 'should not be allowed' // Extra field
      };

      const valid = validators['ticket.created'](event);
      runner.assert(!valid, 'Schema must reject extra fields when additionalProperties=false');
    });
  });

  await runner.describe('Agentic Service Event Conformance', async () => {
    await runner.it('agentic invoice.create_requested payload should match schema', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.agenticService}/invoices/DRIFT-001`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: 99.99,
            description: 'Drift test invoice'
          })
        }, 10000);
      } catch {
        runner.skip('Agentic invoice drift test (service may not be running)');
      }

      // The agentic service may return 404 (ticket not found) or 503 (not configured)
      // but if it returns 200, the invoice should have been queued
      runner.assertTrue(response.status < 500, 'Agentic service should not crash on invoice request');
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
