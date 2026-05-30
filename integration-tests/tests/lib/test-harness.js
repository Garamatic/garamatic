/**
 * Integration Test Harness
 * Shared utilities for all integration tests
 */

// No filesystem imports needed — all schema loading goes through integration-contracts validator

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

  skip(description) {
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
    this.assert(actual === expected, message || `Expected ${expected}, got ${actual}`);
  }

  assertTrue(value, message) {
    this.assert(value === true, message || `Expected true, got ${value}`);
  }

  assert2xx(response, message) {
    if (response.status < 200 || response.status >= 300) {
      throw new Error(message || `Expected 2xx, got HTTP ${response.status}`);
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
  testReceiver: process.env.TEST_RECEIVER_URL || 'http://localhost:8089',
  agenticService: process.env.AGENTIC_SERVICE_URL || 'http://localhost:3001',
  odooIntegration: process.env.ODOO_INTEGRATION_URL || 'http://localhost:8089',
  rabbitmq: process.env.RABBITMQ_URL || 'http://localhost:15672'
};

/**
 * HTTP request helper with timeout
 */
export async function fetchWithTimeout(url, options = {}, timeout = 5000) {
  if (url.startsWith(SERVICES.gatekeeper) || url.startsWith(SERVICES.ticketMasala)) {
    options.headers = options.headers || {};
    options.headers['X-Api-Key'] ??= 'masala-test-key';
  }

  try {
    return await fetch(url, {
      ...options,
      signal: AbortSignal.timeout(timeout)
    });
  } catch (error) {
    if (error.name === 'TimeoutError') {
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
 * Generate invoice create_requested event
 */
export function generateInvoiceCreateRequestedEvent(overrides = {}) {
  const now = new Date().toISOString();

  return {
    event_type: 'invoice.create_requested',
    timestamp: now,
    source: 'integration-tests',
    ticket_id: crypto.randomUUID(),
    customer_email: 'billing@example.com',
    customer_name: 'Billing Customer',
    amount: 150.00,
    description: 'Integration test invoice line',
    requested_at: now,
    ...overrides
  };
}

/**
 * Generate invoice overdue event
 */
export function generateInvoiceOverdueEvent(overrides = {}) {
  const now = new Date().toISOString();

  return {
    event_type: 'invoice.overdue',
    timestamp: now,
    source: 'integration-tests',
    invoice_id: crypto.randomUUID(),
    odoo_invoice_id: 1234,
    customer_email: 'overdue@example.com',
    amount: 250.00,
    days_overdue: 7,
    ...overrides
  };
}

/**
 * Generate ticket assigned event
 */
export function generateTicketAssignedEvent(overrides = {}) {
  const now = new Date().toISOString();

  return {
    event_type: 'ticket.assigned',
    timestamp: now,
    source: 'integration-tests',
    ticket_id: crypto.randomUUID(),
    customer_email: 'user@example.com',
    customer_name: 'Test User',
    assigned_to: 'agent-001',
    assigned_by: 'supervisor-001',
    assigned_at: now,
    ...overrides
  };
}

/**
 * Generate user created event
 */
export function generateUserCreatedEvent(overrides = {}) {
  const now = new Date().toISOString();

  return {
    event_type: 'user.created',
    timestamp: now,
    source: 'integration-tests',
    user_id: crypto.randomUUID(),
    email: 'newuser@example.com',
    name: 'New User',
    role: 'customer',
    tenant_id: 'test-tenant',
    created_at: now,
    ...overrides
  };
}

/**
 * Generate payment received event
 */
export function generatePaymentReceivedEvent(overrides = {}) {
  const now = new Date().toISOString();

  return {
    event_type: 'payment.received',
    timestamp: now,
    source: 'integration-tests',
    invoice_id: crypto.randomUUID(),
    odoo_invoice_id: 5678,
    amount: 150.00,
    payment_method: 'credit_card',
    paid_at: now,
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
 * Sleep for N milliseconds
 */
export const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));
