#!/usr/bin/env node
/**
 * Contract Compliance Tests (v2)
 *
 * Uses the @garamatic/integration-contracts validator instead of
 * reimplementing AJV setup and schema loading.
 */

import { createRequire } from 'module';
import { TestRunner } from './lib/test-harness.js';

const require = createRequire(import.meta.url);
const { validate, createValidatorMap } = require('../../integration-contracts/src/validator.js');
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CONTRACTS_ROOT = join(__dirname, '../../integration-contracts');

const runner = new TestRunner('Contract Compliance Tests');

async function main() {
  const report = await validate({ rootDir: CONTRACTS_ROOT });
  const validators = await createValidatorMap({ rootDir: CONTRACTS_ROOT });

  // ════════════════════════════════════════════════════════════
  // Phase 1: Deep consistency check (schemas + samples + docs + routing)
  // ════════════════════════════════════════════════════════════
  await runner.describe('Contract Consistency', async () => {
    await runner.it('should pass the full contract validator', async () => {
      runner.assert(report.ok, `Contract validator failed: ${JSON.stringify(report.summary)}`);
    });

    await runner.it('should find all 9 canonical event schemas', async () => {
      runner.assert(report.summary.schemasFound >= 9, `Only ${report.summary.schemasFound} schemas found`);
    });

    await runner.it('should have at least 10 sample events', async () => {
      runner.assert(report.summary.samplesFound >= 10, `Only ${report.summary.samplesFound} samples found`);
    });
  });

  // ════════════════════════════════════════════════════════════
  // Phase 2: Per-schema validation using compiled AJV validators
  // ════════════════════════════════════════════════════════════
  await runner.describe('Schema-Specific Validation', async () => {

    await runner.it('ticket.created should accept a well-formed event', () => {
      const valid = validators['ticket.created']({
        event_type: 'ticket.created',
        timestamp: '2024-01-15T09:00:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440001',
        customer_email: 'jane@example.com',
        customer_name: 'Jane Smith',
        tenant_id: 'tenant-001',
        description: 'Need help with network configuration',
        priority: 'high',
        created_at: '2024-01-15T09:00:00Z',
      });
      runner.assert(valid, 'ticket.created should accept well-formed event');
    });

    await runner.it('ticket.resolved should accept a well-formed event', () => {
      const valid = validators['ticket.resolved']({
        event_type: 'ticket.resolved',
        timestamp: '2024-01-15T10:30:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'user@example.com',
        customer_name: 'John Doe',
        service_description: 'IT support consultation',
        amount: 150.00,
        tenant_id: 'tenant-001',
        resolved_at: '2024-01-15T10:30:00Z',
        resolution_notes: 'Issue resolved successfully',
      });
      runner.assert(valid, 'ticket.resolved should accept well-formed event');
    });

    await runner.it('invoice.created should require odoo_invoice_id as integer', () => {
      const valid = validators['invoice.created']({
        event_type: 'invoice.created',
        timestamp: '2024-01-15T11:00:00Z',
        source: 'odoo-bridge',
        invoice_id: '11111111-1111-1111-1111-111111111111',
        odoo_invoice_id: 1234,
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'user@example.com',
        amount: 150.00,
        currency: 'USD',
        status: 'posted',
        created_at: '2024-01-15T11:00:00Z',
      });
      runner.assert(valid, 'invoice.created should accept integer odoo_invoice_id');
    });

    await runner.it('email.send should require all email fields', () => {
      const valid = validators['email.send']({
        event_type: 'email.send',
        timestamp: '2024-01-15T10:30:00Z',
        source: 'odoo-bridge',
        to_email: 'recipient@example.com',
        subject: 'Test Email',
        body_html: '<p>This is a test email.</p>',
        from_email: 'test@garamatic.io',
        from_name: 'Garamatic Test',
      });
      runner.assert(valid, 'email.send should accept well-formed event');
    });

    await runner.it('user.created should accept a well-formed event', () => {
      const valid = validators['user.created']({
        event_type: 'user.created',
        timestamp: '2024-01-15T08:00:00Z',
        source: 'garamatic-web',
        user_id: '22222222-2222-2222-2222-222222222222',
        email: 'alice@example.com',
        name: 'Alice Smith',
        role: 'customer',
        tenant_id: 'tenant-001',
        created_at: '2024-01-15T08:00:00Z',
      });
      runner.assert(valid, 'user.created should accept well-formed event');
    });

    await runner.it('ticket.assigned should accept a well-formed event', () => {
      const valid = validators['ticket.assigned']({
        event_type: 'ticket.assigned',
        timestamp: '2024-01-15T09:30:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'user@example.com',
        customer_name: 'John Doe',
        assigned_to: 'agent-001',
        assigned_by: 'supervisor-001',
        assigned_at: '2024-01-15T09:30:00Z',
      });
      runner.assert(valid, 'ticket.assigned should accept well-formed event');
    });

    await runner.it('invoice.create_requested should accept a well-formed event', () => {
      const valid = validators['invoice.create_requested']({
        event_type: 'invoice.create_requested',
        timestamp: '2024-01-15T11:00:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'billing@example.com',
        customer_name: 'Billing Customer',
        amount: 150.00,
        description: 'Service fee',
        requested_at: '2024-01-15T11:00:00Z',
      });
      runner.assert(valid, 'invoice.create_requested should accept well-formed event');
    });

    await runner.it('invoice.overdue should accept a well-formed event', () => {
      const valid = validators['invoice.overdue']({
        event_type: 'invoice.overdue',
        timestamp: '2024-01-15T12:00:00Z',
        source: 'odoo-bridge',
        invoice_id: '11111111-1111-1111-1111-111111111111',
        odoo_invoice_id: 1234,
        customer_email: 'overdue@example.com',
        amount: 250.00,
        days_overdue: 7,
      });
      runner.assert(valid, 'invoice.overdue should accept well-formed event');
    });

    await runner.it('payment.received should accept a well-formed event', () => {
      const valid = validators['payment.received']({
        event_type: 'payment.received',
        timestamp: '2024-01-15T13:00:00Z',
        source: 'payment-gateway',
        invoice_id: '11111111-1111-1111-1111-111111111111',
        odoo_invoice_id: 5678,
        amount: 150.00,
        payment_method: 'credit_card',
        paid_at: '2024-01-15T13:00:00Z',
      });
      runner.assert(valid, 'payment.received should accept well-formed event');
    });
  });

  // ════════════════════════════════════════════════════════════
  // Phase 3: Negative validation (samples should fail correctly)
  // ════════════════════════════════════════════════════════════
  await runner.describe('Negative Validation', async () => {

    await runner.it('should reject invalid ticket.resolved (bad UUID, negative amount)', () => {
      const valid = validators['ticket.resolved']({
        event_type: 'ticket.resolved',
        timestamp: '2024-01-15T10:30:00Z',
        source: 'ticket-masala',
        ticket_id: 'not-a-valid-uuid',
        customer_email: 'not-an-email',
        amount: -50.00,
      });
      runner.assert(!valid, 'Should reject invalid ticket.resolved');
    });

    await runner.it('should reject missing required fields', () => {
      const valid = validators['ticket.created']({
        event_type: 'ticket.created',
        timestamp: '2024-01-15T09:00:00Z',
        source: 'ticket-masala',
        // missing ticket_id, customer_email, etc.
      });
      runner.assert(!valid, 'Should reject missing required fields');
    });

    await runner.it('should reject invalid invoice.create_requested (missing amount)', () => {
      const valid = validators['invoice.create_requested']({
        event_type: 'invoice.create_requested',
        timestamp: '2024-01-15T11:00:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        customer_email: 'billing@example.com',
        customer_name: 'Billing Customer',
        description: 'Service fee',
        requested_at: '2024-01-15T11:00:00Z',
        // missing amount
      });
      runner.assert(!valid, 'Should reject missing amount');
    });

    await runner.it('should reject invalid invoice.overdue (negative days_overdue)', () => {
      const valid = validators['invoice.overdue']({
        event_type: 'invoice.overdue',
        timestamp: '2024-01-15T12:00:00Z',
        source: 'odoo-bridge',
        invoice_id: '11111111-1111-1111-1111-111111111111',
        odoo_invoice_id: 1234,
        customer_email: 'overdue@example.com',
        amount: 250.00,
        days_overdue: -1,
      });
      runner.assert(!valid, 'Should reject negative days_overdue');
    });

    await runner.it('should reject invalid ticket.assigned (missing assigned_to)', () => {
      const valid = validators['ticket.assigned']({
        event_type: 'ticket.assigned',
        timestamp: '2024-01-15T09:30:00Z',
        source: 'ticket-masala',
        ticket_id: '550e8400-e29b-41d4-a716-446655440000',
        assigned_by: 'supervisor-001',
        assigned_at: '2024-01-15T09:30:00Z',
        // missing assigned_to
      });
      runner.assert(!valid, 'Should reject missing assigned_to');
    });

    await runner.it('should reject invalid payment.received (bad UUID)', () => {
      const valid = validators['payment.received']({
        event_type: 'payment.received',
        timestamp: '2024-01-15T13:00:00Z',
        source: 'payment-gateway',
        invoice_id: 'not-a-valid-uuid',
        odoo_invoice_id: 5678,
        amount: 150.00,
        payment_method: 'credit_card',
        paid_at: '2024-01-15T13:00:00Z',
      });
      runner.assert(!valid, 'Should reject invalid invoice_id');
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
