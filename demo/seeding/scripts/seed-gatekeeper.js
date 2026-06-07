#!/usr/bin/env node
/**
 * Seed Gatekeeper API with integration events
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
  console.log(`  ${color}${status === 'pass' ? '✓' : '✗'}${COLORS.reset} ${message}`);
}

const TENANT = process.env.TENANT || 'default';

async function seed() {
  console.log('Seeding gatekeeper API...');
  console.log(`  Tenant: ${TENANT}`);

  const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
  const events = require(`${dataDir}/events.json`);
  console.log(`  Loaded ${events.length} events from ${dataDir}`);

  for (const event of events) {
    try {
      const now = new Date().toISOString();
      const payload = {
        ...event,
        timestamp: event.timestamp || now,
        source: event.source || 'demo-seeder'
      };

      const response = await client.post('/ingest', payload);

      if (response.status === 200 || response.status === 202 || response.status === 201) {
        log('pass', `Published ${event.event_type}`);
        passed++;
      } else {
        log('fail', `${event.event_type} → HTTP ${response.status}`);
        failed++;
      }
    } catch (error) {
      log('fail', `${event.event_type} → ${error.message}`);
      failed++;
    }
  }

  console.log(`\n  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${failed}${COLORS.reset}`);
}

seed();
