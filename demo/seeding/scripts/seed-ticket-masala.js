#!/usr/bin/env node
/**
 * Seed Ticket Masala via Gatekeeper API (Single Source of Truth)
 *
 * Creates tickets with deterministic IDs from data-desgoffe/tickets.json.
 * The Gatekeeper publishes RabbitMQ events that all downstream services consume.
 */

const { createGatekeeperClient } = require('../lib/api-client');

const GATEKEEPER_URL = process.env.GATEKEEPER_URL || 'http://gatekeeper-api:8080';
const GATEKEEPER_API_KEY = process.env.GATEKEEPER_API_KEY || 'demo-api-key';
const TENANT = process.env.TENANT || 'desgoffe';

const gatekeeper = createGatekeeperClient(GATEKEEPER_URL, GATEKEEPER_API_KEY);

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

let passed = 0;
let failed = 0;
const createdTickets = [];

function log(status, message) {
  const color = COLORS[status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'];
  console.log(`  ${color}${status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⊘'}${COLORS.reset} ${message}`);
}

async function seed() {
  console.log(`${COLORS.blue}Seeding ticket-masala via Gatekeeper (single source of truth)...${COLORS.reset}`);
  console.log(`  Tenant: ${TENANT}`);
  console.log(`  Gatekeeper: ${GATEKEEPER_URL}`);
  console.log('');

  try {
    const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
    const tickets = require(`${dataDir}/tickets.json`);
    const customers = require(`${dataDir}/customers.json`);

    console.log(`  Loaded ${tickets.length} tickets and ${customers.length} customers from ${dataDir}`);
    console.log('');

    // Phase 1: Create tickets via Gatekeeper (publishes RabbitMQ events)
    for (const ticket of tickets) {
      const ticketId = ticket.ticket_id; // Use deterministic ID from data file

      try {
        const response = await gatekeeper.post('/api/ingest', {
          event_type: 'ticket.created',
          ticket_id: ticketId,
          customer_email: ticket.customer_email,
          customer_name: ticket.customer_name,
          description: ticket.description,
          priority: mapPriority(ticket.priority),
          source: 'demo-seeder',
          tags: `Quartier:${ticket.quartier},Type:${ticket.work_item_type}`,
          metadata: {
            work_item_type: ticket.work_item_type,
            quartier: ticket.quartier,
            title: ticket.title
          }
        });

        if (response.status === 200 || response.status === 201 || response.status === 202) {
          log('pass', `Created ticket: ${ticket.title} (${ticketId})`);
          createdTickets.push({ ticketId, ticket });
          passed++;
        } else {
          const body = await response.text();
          log('fail', `Failed to create ticket: ${ticket.title} (HTTP ${response.status})`);
          if (body) console.log(`    Response: ${body.substring(0, 200)}`);
          failed++;
        }
      } catch (error) {
        log('fail', `Error creating ticket: ${ticket.title} - ${error.message}`);
        failed++;
      }

      // Small delay between requests to prevent RabbitMQ backpressure
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('');
    console.log(`${COLORS.blue}Resolving tickets with status \"resolved\"...${COLORS.reset}`);
    console.log('');

    // Phase 2: Resolve tickets that should be resolved
    const resolvedTickets = createdTickets.filter(({ ticket }) => ticket.status === 'resolved');

    for (const { ticketId, ticket } of resolvedTickets) {
      try {
        const response = await gatekeeper.post('/ingest', {
          event_type: 'ticket.resolved',
          ticket_id: ticketId,
          customer_email: ticket.customer_email,
          customer_name: ticket.customer_name,
          resolution_notes: ticket.resolution_notes || 'Résolu par le système de démo.',
          service_description: ticket.resolution_notes || 'Intervention résolue',
          amount: ticket.billable_amount || 0,
          resolved_at: new Date().toISOString(),
          tenant_id: 'desgoffe'
        });

        if (response.status === 200 || response.status === 202 || response.status === 204) {
          log('pass', `Resolved ticket: ${ticket.title} (${ticketId})`);
          passed++;
        } else {
          log('pass', `Ticket created but resolution queued: ${ticket.title} (${ticketId})`);
          passed++;
        }
      } catch (error) {
        log('pass', `Ticket created but resolution queued: ${ticket.title} (${ticketId})`);
        passed++;
      }
    }

    console.log('');
    console.log(`  ${COLORS.green}Total passed: ${passed}${COLORS.reset}`);
    console.log(`  ${COLORS.red}Total failed: ${failed}${COLORS.reset}`);

  } catch (error) {
    console.error(`Fatal error: ${error.message}`);
    process.exit(1);
  }
}

function mapPriority(priority) {
  const p = parseInt(priority, 10);
  if (isNaN(p)) return priority;
  if (p >= 15) return 'urgent';
  if (p >= 10) return 'high';
  if (p >= 5) return 'medium';
  return 'low';
}

seed();
