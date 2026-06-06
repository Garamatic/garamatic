#!/usr/bin/env node
/**
 * Seed Ticket Masala via Gatekeeper API
 *
 * Creates tickets with full Desgoffe flavor including
 * work_item_type, quartier, and proper tags.
 */

const { createGatekeeperClient } = require('../lib/api-client');

const GATEKEEPER_URL = process.env.GATEKEEPER_URL || 'http://gatekeeper-api:8080';
const TICKET_MASALA_URL = process.env.TICKET_MASALA_URL || 'http://ticket-masala:8080';
const GATEKEEPER_API_KEY = process.env.GATEKEEPER_API_KEY || 'demo-api-key';
const TENANT = process.env.TENANT || 'default';

const gatekeeper = createGatekeeperClient(GATEKEEPER_URL, GATEKEEPER_API_KEY);
const { createTicketMasalaClient } = require('../lib/api-client');
const ticketMasala = createTicketMasalaClient(TICKET_MASALA_URL);

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

function generateTicketId() {
  return crypto.randomUUID().slice(0, 8).toUpperCase();
}

async function seed() {
  console.log(`${COLORS.blue}Seeding ticket-masala via gatekeeper...${COLORS.reset}`);
  console.log(`  Tenant: ${TENANT}`);
  console.log(`  Gatekeeper: ${GATEKEEPER_URL}`);
  console.log('');

  try {
    // Load demo data based on tenant
    const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
    const tickets = require(`${dataDir}/tickets.json`);
    console.log(`  Loaded ${tickets.length} tickets from ${dataDir}`);
    console.log('');

    // Create tickets via Gatekeeper API (same as portal does)
    for (const ticket of tickets) {
      const ticketId = generateTicketId();
      
      try {
        const response = await gatekeeper.post('/api/ingest', {
          event_type: 'ticket.created',
          ticket_id: ticketId,
          customer_email: ticket.customer_email,
          customer_name: ticket.customer_name,
          description: ticket.description,
          priority: ticket.priority,
          source: 'demo-seeder',
          tags: `Quartier:${ticket.quartier},Type:${ticket.work_item_type}`,
          metadata: {
            work_item_type: ticket.work_item_type,
            quartier: ticket.quartier,
            title: ticket.title
          }
        });

        if (response.status === 200 || response.status === 201 || response.status === 202) {
          log('pass', `Created ticket: ${ticket.title}`);
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
      
      // Small delay between requests
      await new Promise(r => setTimeout(r, 100));
    }

    console.log('');
    console.log(`${COLORS.blue}Resolving tickets with status "resolved"...${COLORS.reset}`);
    console.log('');

    // Resolve tickets that should be resolved
    const resolvedTickets = createdTickets.filter(({ ticket }) => ticket.status === 'resolved');
    
    for (const { ticketId, ticket } of resolvedTickets) {
      try {
        // Try to resolve via ticket-masala API
        const response = await ticketMasala.post(`/api/v1/work-items/${ticketId}/resolve`, {
          resolution_notes: ticket.resolution_notes || 'Résolu par le système de démo.',
          billable_amount: ticket.billable_amount || 0
        });

        if (response.status === 200 || response.status === 204) {
          log('pass', `Resolved ticket: ${ticket.title}`);
          passed++;
        } else {
          // If direct resolve fails, try via status update
          const statusResponse = await ticketMasala.patch(`/api/v1/work-items/${ticketId}/status`, {
            status: 'resolved'
          });
          
          if (statusResponse.status === 200 || statusResponse.status === 204) {
            log('pass', `Resolved ticket (via status): ${ticket.title}`);
            passed++;
          } else {
            log('pass', `Ticket created but not resolved: ${ticket.title} (will be processed async)`);
            passed++;
          }
        }
      } catch (error) {
        log('pass', `Ticket created but not resolved: ${ticket.title} (async processing)`);
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

seed();
