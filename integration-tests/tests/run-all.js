#!/usr/bin/env node
/**
 * Unified Integration Test Runner
 *
 * Runs all test suites in sequence, aggregates results, and produces
 * JSON/CI-friendly output to test-results/test-results.json.
 *
 * Usage:
 *   node tests/run-all.js [--json] [--verbose]
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const SUITES = [
  { name: 'Contract Compliance', file: 'contract-compliance.test.js', env: 'test' },
  { name: 'Contract Drift', file: 'contract-drift.test.js', env: 'test' },
  { name: 'Service Health', file: 'service-health.test.js', env: 'test' },
  { name: 'Cross-Service', file: 'cross-service.test.js', env: 'test' },
  { name: 'End-to-End Workflows', file: 'e2e-workflows.test.js', env: 'test' },
  { name: 'RabbitMQ Connectivity', file: 'rabbitmq-connectivity.test.js', env: 'test' },
  { name: 'Webhook Receiver', file: 'webhook-receiver.test.js', env: 'test' },
  { name: 'Odoo Integration', file: 'odoo-integration.test.js', env: 'test' },
  { name: 'Agentic Service Deep', file: 'agentic-service-deep.test.js', env: 'test' },
  { name: 'Event Planner Deep', file: 'event-planner-deep.test.js', env: 'test' },
  { name: 'Event Handler Contract', file: 'event-handler-contract.test.js', env: 'test' }
];

async function runSuite(suite, verbose) {
  const filePath = join(__dirname, suite.file);

  try {
    await readFile(filePath, 'utf-8');
  } catch {
    return {
      suite: suite.name,
      status: 'missing',
      passed: 0,
      failed: 0,
      skipped: 0,
      tests: [],
      duration: 0,
      error: `Test file not found: ${suite.file}`
    };
  }

  const start = Date.now();
  const { spawn } = await import('child_process');

  return new Promise((resolve) => {
    const proc = spawn('node', [filePath], {
      cwd: process.cwd(),
      env: { ...process.env, __TEST_RUNNER: '1' },
      stdio: verbose ? 'inherit' : 'pipe'
    });

    let stdout = '';
    let stderr = '';

    if (!verbose) {
      proc.stdout.on('data', d => stdout += d);
      proc.stderr.on('data', d => stderr += d);
    }

    proc.on('close', (code) => {
      const duration = Date.now() - start;
      const result = parseTestOutput(stdout, stderr, suite.name, duration);
      result.status = code === 0 ? 'passed' : 'failed';
      resolve(result);
    });

    proc.on('error', (err) => {
      resolve({
        suite: suite.name,
        status: 'error',
        passed: 0,
        failed: 0,
        skipped: 0,
        tests: [],
        duration: Date.now() - start,
        error: err.message
      });
    });
  });
}

function parseTestOutput(stdout, stderr, suiteName, duration) {
  const lines = (stdout + stderr).split('\n');
  let passed = 0;
  let failed = 0;
  let skipped = 0;
  const tests = [];

  for (const line of lines) {
    const passMatch = line.match(/^\s*\x1b\[32m\u2713\x1b\[0m\s+(.+)$/);
    const failMatch = line.match(/^\s*\x1b\[31m\u2717\x1b\[0m\s+(.+)$/);
    const skipMatch = line.match(/^\s*\x1b\[33m\u2298\x1b\[0m\s+(.+?)\s+\x1b\[33m\(skipped\)\x1b\[0m/);

    if (passMatch) {
      passed++;
      tests.push({ name: passMatch[1].trim(), status: 'passed' });
    } else if (failMatch) {
      failed++;
      tests.push({ name: failMatch[1].trim(), status: 'failed' });
    } else if (skipMatch) {
      skipped++;
      tests.push({ name: skipMatch[1].trim(), status: 'skipped' });
    }
  }

  return { suite: suiteName, status: 'unknown', passed, failed, skipped, tests, duration };
}

async function main() {
  const args = process.argv.slice(2);
  const verbose = args.includes('--verbose') || args.includes('-v');
  const jsonOnly = args.includes('--json');
  const resultsDir = join(process.cwd(), 'test-results');

  await mkdir(resultsDir, { recursive: true });

  if (!jsonOnly) {
    console.log(`${COLORS.bright}${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}  Garamatic Unified Integration Test Runner${COLORS.reset}`);
    console.log(`${COLORS.bright}${COLORS.blue}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
  }

  const results = [];
  let totalPassed = 0;
  let totalFailed = 0;
  let totalSkipped = 0;

  for (const suite of SUITES) {
    if (!jsonOnly) {
      console.log(`${COLORS.cyan}▶ ${suite.name} (${suite.file})${COLORS.reset}`);
    }
    const result = await runSuite(suite, verbose);
    results.push(result);
    totalPassed += result.passed;
    totalFailed += result.failed;
    totalSkipped += result.skipped;

    if (!jsonOnly) {
      const color = result.failed === 0 ? COLORS.green : COLORS.red;
      const icon = result.failed === 0 ? '✓' : '✗';
      console.log(`  ${color}${icon} ${result.passed} passed, ${result.failed} failed, ${result.skipped} skipped (${result.duration}ms)${COLORS.reset}\n`);
    }
  }

  const total = totalPassed + totalFailed + totalSkipped;
  const overall = totalFailed === 0 ? 'passed' : 'failed';

  const report = {
    timestamp: new Date().toISOString(),
    overall,
    summary: {
      passed: totalPassed,
      failed: totalFailed,
      skipped: totalSkipped,
      total
    },
    suites: results,
    services: {
      ticket_masala: process.env.TICKET_MASALA_URL || 'http://localhost:8085',
      gatekeeper: process.env.GATEKEEPER_URL || 'http://localhost:8086',
      mailing: process.env.MAILING_SERVICE_URL || 'http://localhost:8087',
      event_planner: process.env.EVENT_PLANNER_URL || 'http://localhost:8088',
      agentic: process.env.AGENTIC_SERVICE_URL || 'http://localhost:3001',
      odoo_integration: process.env.ODOO_INTEGRATION_URL || 'http://localhost:8089',
      rabbitmq: process.env.RABBITMQ_URL || 'http://localhost:15672',
      mailhog: process.env.MAILHOG_URL || 'http://localhost:8025'
    }
  };

  await writeFile(join(resultsDir, 'test-results.json'), JSON.stringify(report, null, 2));

  if (!jsonOnly) {
    console.log(`${COLORS.bright}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.bright}  Overall: ${overall === 'passed' ? COLORS.green + 'ALL PASSED' : COLORS.red + 'FAILED'}${COLORS.reset}`);
    console.log(`${COLORS.bright}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`  ${COLORS.green}Passed:  ${totalPassed}${COLORS.reset}`);
    console.log(`  ${COLORS.red}Failed:  ${totalFailed}${COLORS.reset}`);
    console.log(`  ${COLORS.yellow}Skipped: ${totalSkipped}${COLORS.reset}`);
    console.log(`  ${COLORS.blue}Total:   ${total}${COLORS.reset}`);
    console.log(`\n${COLORS.bright}Report written to: test-results/test-results.json${COLORS.reset}\n`);
  }

  if (jsonOnly) {
    console.log(JSON.stringify(report, null, 2));
  }

  process.exit(totalFailed > 0 ? 1 : 0);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
