/**
 * Integration Test Harness
 * Shared utilities for all integration tests
 */

import { readFile } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Color codes for terminal output
const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m'
};

/**
 * Test result tracking
 */
export class TestRunner {
  constructor(name) {
    this.name = name;
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.tests = [];
    this.startTime = Date.now();
  }

  async describe(description, fn) {
    console.log(`\n${COLORS.bright}${COLORS.blue}▶ ${description}${COLORS.reset}`);
    await fn();
  }

  async it(description, fn) {
    try {
      await fn();
      this.passed++;
      this.tests.push({ description, status: 'passed' });
      console.log(`  ${COLORS.green}✓${COLORS.reset} ${description}`);
    } catch (error) {
      this.failed++;
      this.tests.push({ description, status: 'failed', error: error.message });
      console.log(`  ${COLORS.red}✗${COLORS.reset} ${description}`);
      console.log(`    ${COLORS.red}${error.message}${COLORS.reset}`);
    }
  }

  skip(description, fn) {
    this.skipped++;
    this.tests.push({ description, status: 'skipped' });
    console.log(`  ${COLORS.yellow}⊘${COLORS.reset} ${description} ${COLORS.yellow}(skipped)${COLORS.reset}`);
  }

  assert(condition, message) {
    if (!condition) {
      throw new Error(message || 'Assertion failed');
    }
  }

  assertEquals(actual, expected, message) {
    if (actual !== expected) {
      throw new Error(message || `Expected ${expected}, got ${actual}`);
    }
  }

  assertTrue(value, message) {
    if (value !== true) {
      throw new Error(message || `Expected true, got ${value}`);
    }
  }

  assertFalse(value, message) {
    if (value !== false) {
      throw new Error(message || `Expected false, got ${value}`);
    }
  }

  assertNotNull(value, message) {
    if (value === null || value === undefined) {
      throw new Error(message || 'Expected non-null value');
    }
  }

  assertResponseOk(response, message) {
    if (!response.ok) {
      const statusText = response.statusText || 'Unknown Error';
      throw new Error(message || `HTTP ${response.status}: ${statusText}`);
    }
  }

  printSummary() {
    const duration = Date.now() - this.startTime;
    console.log(`\n${COLORS.bright}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`${COLORS.bright}Test Suite: ${this.name}${COLORS.reset}`);
    console.log(`${COLORS.bright}═══════════════════════════════════════════════════════════════${COLORS.reset}`);
    console.log(`  ${COLORS.green}Passed:  ${this.passed}${COLORS.reset}`);
    console.log(`  ${COLORS.red}Failed:  ${this.failed}${COLORS.reset}`);
    console.log(`  ${COLORS.yellow}Skipped: ${this.skipped}${COLORS.reset}`);
    console.log(`  Duration: ${duration}ms`);
    console.log(`${COLORS.bright}═══════════════════════════════════════════════════════════════${COLORS.reset}\n`);
    
    return this.failed === 0;
  }

  exit() {
    process.exit(this.failed > 0 ? 1 : 0);
  }
}

/**
 * Service URLs from environment
 */
export const SERVICES = {
  ticketMasala: process.env.TICKET_MASALA_URL || 'http://localhost:8085',
  gatekeeper: process.env.GATEKEEPER_URL || 'http://localhost:8086',
  mailing: process.env.MAILING_SERVICE_URL || 'http://localhost:8087',
  eventPlanner: process.env.EVENT_PLANNER_URL || 'http://localhost:8088',
  mailhog: process.env.MAILHOG_URL || 'http://localhost:8025',
  testReceiver: process.env.TEST_RECEIVER_URL || 'http://localhost:8089'
};

/**
 * HTTP request helper with timeout
 */
export async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  // Automatically inject X-Api-Key for Gatekeeper API requests in tests
  if (url.startsWith(SERVICES.gatekeeper)) {
    options.headers = options.headers || {};
    if (!options.headers['X-Api-Key']) {
      options.headers['X-Api-Key'] = 'masala-test-key';
    }
  }
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error(`Request timeout after ${timeout}ms: ${url}`);
    }
    throw error;
  }
}

/**
 * Wait for service to be healthy
 */
export async function waitForService(url, maxAttempts = 30, interval = 2000) {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const response = await fetchWithTimeout(`${url}/health`, {}, 5000);
      if (response.ok) {
        return true;
      }
    } catch (error) {
      // Service not ready yet
    }
    
    if (attempt < maxAttempts) {
      process.stdout.write(`  Waiting for ${url} (attempt ${attempt}/${maxAttempts})...\r`);
      await new Promise(resolve => setTimeout(resolve, interval));
    }
  }
  
  throw new Error(`Service ${url} failed to become healthy after ${maxAttempts} attempts`);
}

/**
 * Load JSON schema from integration-contracts
 */
export async function loadSchema(schemaName) {
  const schemaPath = join(__dirname, '../../integration-contracts/Schemas', `${schemaName}.json`);
  const content = await readFile(schemaPath, 'utf-8');
  return JSON.parse(content);
}

/**
 * Generate test data
 */
export function generateTestTicket(overrides = {}) {
  const uuid = crypto.randomUUID();
  const now = new Date().toISOString();
  
  return {
    ticket_id: uuid,
    customer_email: `test-${uuid.slice(0, 8)}@example.com`,
    customer_name: 'Test Customer',
    tenant_id: 'test-tenant',
    description: 'Test ticket created by integration test',
    priority: 'medium',
    created_at: now,
    ...overrides
  };
}

/**
 * Generate email send event
 */
export function generateEmailEvent(overrides = {}) {
  const now = new Date().toISOString();
  
  return {
    event_type: 'email.send',
    timestamp: now,
    source: 'integration-tests',
    to_email: 'recipient@example.com',
    subject: 'Test Email from Integration Tests',
    body_html: '<p>This is a test email.</p>',
    from_email: 'test@garamatic.io',
    from_name: 'Garamatic Test',
    ...overrides
  };
}

/**
 * Mailhog API helpers
 */
export const MailhogAPI = {
  async getMessages() {
    const response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v2/messages`);
    if (!response.ok) throw new Error('Failed to fetch Mailhog messages');
    return response.json();
  },
  
  async deleteAllMessages() {
    const response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v1/messages`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Failed to delete Mailhog messages');
  },
  
  async findMessageByRecipient(email) {
    const { items } = await this.getMessages();
    return items.find(msg => 
      msg.Content.Headers.To && 
      msg.Content.Headers.To.some(to => to.includes(email))
    );
  }
};

/**
 * Load test fixture from integration-contracts test-samples
 */
export async function loadFixture(name) {
  const fixturePath = join(__dirname, '../../integration-contracts/test-samples', `${name}.json`);
  const content = await readFile(fixturePath, 'utf-8');
  return JSON.parse(content);
}

let ajvInstance = null;

/**
 * JSON Schema validator setup (singleton)
 */
export async function createValidator() {
  if (ajvInstance) return ajvInstance;
  
  const { default: Ajv } = await import('ajv');
  const { default: addFormats } = await import('ajv-formats');
  
  ajvInstance = new Ajv({ strict: false, allErrors: true });
  addFormats(ajvInstance);
  
  return ajvInstance;
}
