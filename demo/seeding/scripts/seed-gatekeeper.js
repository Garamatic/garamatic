#!/usr/bin/env node
/**
 * Seed Gatekeeper with follow-up events only
 *
 * Seeds resolutions, invoices, payments, and emails that reference
 * tickets created by seed-ticket-masala.js. Does NOT create tickets.
 */

const { createGatekeeperClient } = require('../lib/api-client');

const BASE_URL = process.env.GATEKEEPER_URL || 'http://gatekeeper-api:8080';
const API_KEY = process.env.GATEKEEPER_API_KEY || 'demo-api-key';
const client = createGatekeeperClient(BASE_URL, API_KEY);

const COLORS = {
  reset: '\x1b[0m', green: '\x1b[32m', red: '\x1b[31m', yellow: '\x1b[33m'
};

let passed = 0;
let failed = 0;

function log(status, message) {
  const color = COLORS[status === 'pass' ? 'green' : status === 'fail' ? 'red' : 'yellow'];
  console.log(`  ${color}${status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⊘'}${COLORS.reset} ${message}`);
}

const TENANT = process.env.TENANT || 'default';

async function seed() {
  console.log('Seeding Gatekeeper with follow-up events...');
  console.log(`  Tenant: ${TENANT}`);

  const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
  const events = require(`${dataDir}/events.json`);

  // Only process follow-up events (skip ticket.created — handled by seed-ticket-masala.js)
  const followUpEvents = events.filter(e => e.event_type !== 'ticket.created');
  console.log(`  Loaded ${events.length} events, ${followUpEvents.length} are follow-up events`);

  for (const event of followUpEvents) {
    try {
      const now = new Date().toISOString();
      const payload = {
        ...event,
        timestamp: event.timestamp || now,
        source: event.source || 'demo-seeder'
      };

      const response = await client.post('/ingest', payload);

      if (response.status === 200 || response.status === 202 || response.status === 204) {
        log('pass', `Published ${event.event_type} for ${event.ticket_id || event.invoice_id || event.user_id || 'email'}`);
        passed++;
      } else {
        log('fail', `${event.event_type} → HTTP ${response.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `${event.event_type} failed: ${error.message}`);
      failed++;
    }

    // Small delay between requests
    await new Promise(r => setTimeout(r, 50));
  }

  console.log(`\n  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${failed}${COLORS.reset}`);
}

seed();
