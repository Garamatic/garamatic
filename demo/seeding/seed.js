#!/usr/bin/env node
/**
 * Demo Seed Orchestrator
 *
 * Waits for all services to be healthy, then seeds them via APIs.
 * Each service gets its own seeding script for modularity.
 */

const { execSync } = require('child_process');
const { existsSync } = require('fs');
const path = require('path');

const SERVICES = {
  ticketMasala: { url: process.env.TICKET_MASALA_URL || 'http://ticket-masala:8080', path: '/health' },
  gatekeeper: { url: process.env.GATEKEEPER_URL || 'http://gatekeeper-api:8080', path: '/health' },
  mailing: { url: process.env.MAILING_URL || 'http://mailing-service:8080', path: '/health' },
  agentic: { url: process.env.AGENTIC_URL || 'http://agentic-service:3001', path: '/health' },
  odoo: { url: process.env.ODOO_URL || 'http://odoo-integration:8080', path: '/health' },
  eventPlanner: { url: process.env.EVENT_PLANNER_URL || 'http://event-planner:80', path: '/' },
  mailhog: { url: process.env.MAILHOG_URL || 'http://mailhog:8025', path: '/api/v2/messages' },
  rabbitmq: { url: process.env.RABBITMQ_URL || 'http://rabbitmq:15672', path: '/api/overview', auth: 'guest:guest' }
};

const COLORS = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(level, message) {
  const color = COLORS[level === 'error' ? 'red' : level === 'warn' ? 'yellow' : level === 'success' ? 'green' : 'blue'];
  console.log(`${color}[${level.toUpperCase()}]${COLORS.reset} ${message}`);
}

async function waitForService(name, service, maxAttempts = 60, interval = 3000) {
  const url = `${service.url}${service.path}`;
  const auth = service.auth ? `-u ${service.auth}` : '';

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      execSync(`curl -sf ${auth} "${url}" > /dev/null 2>&1`, { timeout: 5000 });
      log('success', `${name} is ready (${url})`);
      return true;
    } catch {
      if (attempt < maxAttempts) {
        process.stdout.write(`  Waiting for ${name} (${attempt}/${maxAttempts})...\r`);
        await new Promise(r => setTimeout(r, interval));
      }
    }
  }

  log('error', `${name} failed to become healthy after ${maxAttempts} attempts`);
  return false;
}

async function runSeedingScript(name, scriptPath) {
  if (!existsSync(scriptPath)) {
    log('warn', `Seeding script not found: ${scriptPath}`);
    return false;
  }

  log('info', `Seeding ${name}...`);
  try {
    const output = execSync(`node ${scriptPath}`, { encoding: 'utf-8', timeout: 120000 });
    console.log(output);
    log('success', `${name} seeding complete`);
    return true;
  } catch (error) {
    log('error', `${name} seeding failed: ${error.message}`);
    if (error.stdout) console.log(error.stdout.toString());
    if (error.stderr) console.error(error.stderr.toString());
    return false;
  }
}

async function runShellScript(name, scriptPath) {
  if (!existsSync(scriptPath)) {
    log('warn', `Shell script not found: ${scriptPath}`);
    return false;
  }

  log('info', `Seeding ${name}...`);
  try {
    const output = execSync(`bash ${scriptPath}`, { encoding: 'utf-8', timeout: 120000 });
    console.log(output);
    log('success', `${name} seeding complete`);
    return true;
  } catch (error) {
    log('error', `${name} seeding failed: ${error.message}`);
    return false;
  }
}

async function main() {
  console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}  Garamatic Demo Seeder${COLORS.reset}`);
  console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);

  // Phase 1: Wait for all services
  console.log(`${COLORS.yellow}Phase 1: Waiting for services to be healthy...${COLORS.reset}\n`);

  const servicesReady = await Promise.all(
    Object.entries(SERVICES).map(([name, service]) =>
      waitForService(name, service)
    )
  );

  if (servicesReady.some(r => !r)) {
    log('error', 'Some services failed to start. Aborting seeding.');
    process.exit(1);
  }

  console.log(`\n${COLORS.green}All services are healthy!${COLORS.reset}\n`);

  // Phase 2: Seed services
  console.log(`${COLORS.yellow}Phase 2: Seeding services via APIs...${COLORS.reset}\n`);

  const results = [];

  // 2.1: Seed Ticket Masala (tickets, customers, projects)
  results.push(await runSeedingScript('ticket-masala', './scripts/seed-ticket-masala.js'));

  // 2.2: Seed Gatekeeper (events)
  results.push(await runSeedingScript('gatekeeper', './scripts/seed-gatekeeper.js'));

  // 2.3: Seed Event Planner (contact forms)
  results.push(await runShellScript('event-planner', './scripts/seed-event-planner.sh'));

  // 2.4: Seed Agentic Service (tickets, invoices, emails)
  results.push(await runSeedingScript('agentic-service', './scripts/seed-agentic-service.js'));

  // 2.5: Seed Odoo Integration (LiteDB state)
  results.push(await runShellScript('odoo-integration', './scripts/seed-odoo-integration.sh'));

  // 2.6: Wait for async processing (RabbitMQ events)
  console.log(`${COLORS.yellow}Phase 3: Waiting for async processing...${COLORS.reset}\n`);
  await new Promise(r => setTimeout(r, 5000));

  // Phase 4: Summary
  const passed = results.filter(r => r).length;
  const failed = results.filter(r => !r).length;

  console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`${COLORS.cyan}  Seeding Summary${COLORS.reset}`);
  console.log(`${COLORS.cyan}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
  console.log(`  ${COLORS.green}Passed: ${passed}${COLORS.reset}`);
  console.log(`  ${COLORS.red}Failed: ${failed}${COLORS.reset}`);
  console.log(`\n${COLORS.green}Demo environment is ready!${COLORS.reset}`);
  console.log(`\nAccess points:`);
  console.log(`  Ticket Masala:    http://localhost:8085`);
  console.log(`  Gatekeeper:       http://localhost:8086`);
  console.log(`  Mailing Service:  http://localhost:8087`);
  console.log(`  Event Planner:    http://localhost:8088`);
  console.log(`  Agentic Service:  http://localhost:3001`);
  console.log(`  Odoo Integration: http://localhost:8089`);
  console.log(`  Mailhog UI:       http://localhost:8025`);
  console.log(`  RabbitMQ UI:      http://localhost:15672 (guest/guest)`);
  console.log(`\n${COLORS.cyan}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);

  process.exit(failed > 0 ? 1 : 0);
}

main().catch(err => {
  log('error', `Fatal error: ${err.message}`);
  process.exit(1);
});
