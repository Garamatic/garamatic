#!/usr/bin/env node
/**
 * Seed Agentic Service via REST API
 */

const { createAgenticClient } = require('../lib/api-client');

const BASE_URL = process.env.AGENTIC_URL || 'http://agentic-service:3001';
const client = createAgenticClient(BASE_URL);

const COLORS = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m'
};

let passed = 0;
let failed = 0;

function log(status, message) {
  const color = COLORS[status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'];
  console.log(`  ${color}${status === 'pass' ? '✓' : '✗'}${COLORS.reset} ${message}`);
}

const TENANT = process.env.TENANT || 'default';

async function seed() {
  console.log('Seeding agentic service...');
  console.log(`  Tenant: ${TENANT}`);

  const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
  const tickets = require(`${dataDir}/tickets.json`);
  const customers = require(`${dataDir}/customers.json`);
  console.log(`  Loaded ${tickets.length} tickets and ${customers.length} customers from ${dataDir}`);

  // Create tickets via agentic API
  for (const ticket of tickets.slice(0, 8)) {
    try {
      const response = await client.post('/tickets', {
        title: ticket.title,
        description: ticket.description,
        customer_email: ticket.customer_email,
        customer_name: ticket.customer_name,
        priority: ticket.priority
      });

      if (response.status === 200 || response.status === 201) {
        const data = await response.json();
        log('pass', `Created ticket: ${data.ticket_id || 'OK'}`);
        passed++;

        // If resolved, try to resolve
        if (ticket.status === 'resolved' && ticket.billable_amount) {
          try {
            const resolveResponse = await client.post(`/tickets/${data.ticket_id}/resolve`, {
              resolution_notes: ticket.resolution_notes,
              billable_amount: ticket.billable_amount
            });
            if (resolveResponse.status === 200) {
              log('pass', `Resolved ticket: ${data.ticket_id}`);
              passed++;
            }
          } catch (e) {
            log('fail', `Resolve failed: ${e.message}`);
            failed++;
          }
        }
      } else {
        log('fail', `Create ticket failed: ${ticket.title} (HTTP ${response.status})`);
        failed++;
      }
    } catch (error) {
      log('fail', `Error: ${ticket.title} - ${error.message}`);
      failed++;
    }
  }

  // Send demo emails
  for (const customer of customers.slice(0, 4)) {
    try {
      const response = await client.post('/emails', {
        to_email: customer.email,
        subject: `Welcome to Garamatic, ${customer.name}!`,
        body: `<p>Welcome to Garamatic! Your account is now active.</p>`,
        from_name: 'Garamatic Demo'
      });

      if (response.status === 200 || response.status === 201) {
        log('pass', `Sent email to: ${customer.email}`);
        passed++;
      } else {
        log('fail', `Email failed: ${customer.email} (HTTP ${response.status})`);
        failed++;
      }
    } catch (error) {
      log('fail', `Email error: ${customer.email} - ${error.message}`);
      failed++;
    }
  }

  // Check customer context
  try {
    const response = await client.get(`/customers/${encodeURIComponent(customers[0].email)}/context`);
    if (response.status === 200) {
      log('pass', `Customer context retrieved: ${customers[0].email}`);
      passed++;
    }
  } catch (error) {
    log('fail', `Customer context: ${error.message}`);
    failed++;
  }

  console.log(`\n  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${failed}${COLORS.reset}`);
}

seed();
