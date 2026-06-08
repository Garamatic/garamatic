#!/usr/bin/env node
/**
 * Seed Agentic Service with non-ticket data only
 *
 * Seeds emails and customer context. Does NOT create tickets —
 * tickets are created via Gatekeeper and propagate through RabbitMQ.
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
  console.log(`  ${color}${status === 'pass' ? '✓' : status === 'fail' ? '✗' : '⊘'}${COLORS.reset} ${message}`);
}

const TENANT = process.env.TENANT || 'default';

async function seed() {
  console.log('Seeding agentic service (emails & customer context only)...');
  console.log(`  Tenant: ${TENANT}`);

  const dataDir = TENANT === 'desgoffe' ? '../data-desgoffe' : '../data';
  const customers = require(`${dataDir}/customers.json`);
  console.log(`  Loaded ${customers.length} customers from ${dataDir}`);

  // Phase 1: Send demo emails
  for (const customer of customers.slice(0, 4)) {
    try {
      const response = await client.post('/emails', {
        to_email: customer.email,
        subject: `Bienvenue sur le Guichet Citoyen, ${customer.name}`,
        body: `<p>Bonjour ${customer.name},</p><p>Bienvenue sur le Guichet Citoyen de la Ville de Desgoffe. Votre compte est maintenant actif.</p><p>Cordialement,<br>Mairie de Desgoffe</p>`,
        from_name: 'Mairie de Desgoffe'
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

  // Phase 2: Check customer context
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
