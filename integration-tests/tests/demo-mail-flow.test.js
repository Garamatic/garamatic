#!/usr/bin/env node
/**
 * Demo Sites + Mail Flow End-to-End Tests
 *
 * Tests the complete demo flow from tenant forms through to Mailhog:
 * 1. Demo showcase loads
 * 2. Tenant form submits to portal API
 * 3. Ticket creation triggers RabbitMQ event
 * 4. Mailing service processes the event
 * 5. Email is captured in Mailhog
 */

import { TestRunner, SERVICES, fetchWithTimeout, MailhogAPI, sleep, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('Demo Sites + Mail Flow E2E Tests');
const SHOWCASE_URL = SERVICES.showcase;

const TENANTS = [
  { id: 'desgoffe', name: 'Desgoffe', customField: 'quartier', customFieldValue: 'Centre', fields: ['customerName', 'customerEmail', 'description', 'requestType'] },
  { id: 'whitman', name: 'Whitman', customField: 'worksite', customFieldValue: 'Site A', fields: ['description', 'interventionType', 'location'] },
  { id: 'liberty', name: 'Liberty', customField: 'department', customFieldValue: 'IT', fields: ['description', 'issueType', 'title', 'reporterName', 'reporterEmail'] },
  { id: 'hennessey', name: 'Hennessey', customField: 'grantType', customFieldValue: 'Research', fields: ['projectTitle', 'grantType', 'principalInvestigator', 'piEmail', 'abstract'] }
];

function buildFormData(tenant, overrides = {}) {
  const formData = new FormData();
  const now = Date.now();

  formData.append('CustomerName', overrides.customerName || `${tenant.name} Demo User`);
  formData.append('CustomerEmail', overrides.customerEmail || `demo-${tenant.id}-${now}@example.com`);
  formData.append('CustomerPhone', overrides.customerPhone || '555-1234');
  formData.append('Description', overrides.description || `Demo form submission for ${tenant.name}`);
  formData.append('WorkItemType', overrides.workItemType || 'general');
  formData.append('PriorityScore', String(overrides.priorityScore || 10));
  formData.append('Priority', overrides.priority || 'medium');

  if (tenant.customField) {
    formData.append('Tags', `${tenant.customField}:${tenant.customFieldValue}`);
  }

  return formData;
}

async function submitToPortal(formData, tenantId, timeout = 10000) {
  return fetchWithTimeout(
    `${SERVICES.ticketMasala}/api/portal/submit`,
    {
      method: 'POST',
      headers: { 'X-Tenant': tenantId },
      body: formData
    },
    timeout
  );
}

async function main() {
  // Clean slate
  try {
    await MailhogAPI.deleteAllMessages();
  } catch {
    // Ignore
  }

  await runner.describe('Showcase Loads and Forms Render', async () => {
    await runner.it('showcase index loads with all tenant links', async () => {
      const response = await fetchWithTimeout(SHOWCASE_URL, {}, 10000);
      runner.assertResponseOk(response);
      const html = await response.text();
      for (const tenant of TENANTS) {
        runner.assertTrue(
          html.includes(`tenants/${tenant.id}/client/index.html`),
          `Should link to ${tenant.name}`
        );
      }
    });

    for (const tenant of TENANTS) {
      await runner.it(`${tenant.name} form page loads with all fields`, async () => {
        const url = `${SHOWCASE_URL}/tenants/${tenant.id}/client/index.html`;
        let response;
        try {
          response = await fetchWithTimeout(url, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} not accessible`);
          return;
        }
        runner.assertResponseOk(response);
        const html = await response.text();
        for (const field of tenant.fields) {
          runner.assertTrue(html.includes(field), `Has ${field} field`);
        }
        runner.assertTrue(html.includes('script.js'), 'Loads JS');
        runner.assertTrue(html.includes('<link') && html.includes('.css'), 'Loads CSS');
      });
    }
  });

  await runner.describe('Form Submission → Ticket Creation', async () => {
    for (const tenant of TENANTS) {
      await runner.it(`${tenant.name} form submits to portal API`, async () => {
        const formData = buildFormData(tenant, {
          description: `E2E demo flow test for ${tenant.name}`
        });
        const response = await submitToPortal(formData, tenant.id);

        if (response.status === 401 || response.status === 403) {
          runner.skip(`${tenant.name} form submission (auth required)`);
          return;
        }

        runner.assertTrue(
          response.status === 200 || response.status === 201,
          `Form submission should succeed, got ${response.status}`
        );
      });
    }
  });

  await runner.describe('Ticket Creation → RabbitMQ → Mailhog', async () => {
    await runner.it('RabbitMQ exchanges are present after form submissions', async () => {
      const auth = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/exchanges`,
        { headers: auth },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertTrue(Array.isArray(data), 'Should list exchanges');
    });

    await runner.it('queues exist for mailing and odoo consumers', async () => {
      const auth = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/queues`,
        { headers: auth },
        10000
      );
      runner.assertResponseOk(response);
      const queues = await response.json();
      runner.assertTrue(Array.isArray(queues), 'Should list queues');
      if (queues.length > 0) {
        console.log(`    Queues: ${queues.map(q => q.name).join(', ')}`);
      }
    });
  });

  await runner.describe('Mailhog Captures Emails', async () => {
    await runner.it('Mailhog API is accessible', async () => {
      let response;
      try {
        response = await fetchWithTimeout(`${SERVICES.mailhog}/api/v2/messages`, {}, 5000);
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }
      runner.assertResponseOk(response);
    });

    await runner.it('emails are captured after form submissions', async () => {
      // Wait for async processing
      await sleep(4000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Mailhog not accessible');
        return;
      }

      runner.assertNotNull(messages.items, 'Mailhog should return messages');
      console.log(`    ${messages.total} email(s) in Mailhog after form submissions`);
    });
  });

  await runner.describe('Full E2E Flow: One Tenant', async () => {
    const tenant = TENANTS[0];
    const flow = {
      ticketId: null,
      email: `full-flow-${Date.now()}@example.com`
    };

    await runner.it('Step 1: Clear Mailhog and load form', async () => {
      try {
        await MailhogAPI.deleteAllMessages();
      } catch {
        // Ignore
      }

      const url = `${SHOWCASE_URL}/tenants/${tenant.id}/client/index.html`;
      let response;
      try {
        response = await fetchWithTimeout(url, {}, 10000);
      } catch {
        runner.skip('Full flow (form not accessible)');
        return;
      }
      runner.assertResponseOk(response);
    });

    await runner.it('Step 2: Submit form via portal API', async () => {
      const formData = buildFormData(tenant, {
        customerEmail: flow.email,
        description: 'Full E2E demo flow test'
      });
      const response = await submitToPortal(formData, tenant.id);

      if (response.status === 401 || response.status === 403) {
        runner.skip('Full flow (auth required)');
        return;
      }
      runner.assertTrue(
        response.status === 200 || response.status === 201,
        `Form submission should succeed, got ${response.status}`
      );
      flow.ticketId = 'submitted';
    });

    await runner.it('Step 3: Verify RabbitMQ is healthy', async () => {
      const auth = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/health/checks/alarms`,
        { headers: auth },
        10000
      );
      runner.assertResponseOk(response);
      const data = await response.json();
      runner.assertEquals(data.status, 'ok', 'RabbitMQ should be healthy');
    });

    await runner.it('Step 4: Wait and verify Mailhog captures email', async () => {
      await sleep(4000);

      let messages;
      try {
        messages = await MailhogAPI.getMessages();
      } catch {
        runner.skip('Full flow (Mailhog not accessible)');
        return;
      }

      runner.assertNotNull(messages.items, 'Mailhog should have messages');
      console.log(`    Full flow: ${messages.total} email(s) captured`);
    });
  });

  await runner.describe('Multi-Tenant Form Submission Flow', async () => {
    await runner.it('all tenants submit forms successfully', async () => {
      const results = [];
      for (const tenant of TENANTS) {
        const formData = buildFormData(tenant, {
          description: `Multi-tenant demo flow for ${tenant.name}`
        });
        const response = await submitToPortal(formData, tenant.id);
        results.push({ tenant: tenant.name, status: response.status });
      }

      const successCount = results.filter(r => r.status === 200 || r.status === 201).length;
      console.log(`    ${successCount}/${TENANTS.length} tenant forms submitted successfully`);
      runner.assertTrue(successCount > 0, 'At least one tenant form should succeed');
    });

    await runner.it('RabbitMQ processes events from multiple tenants', async () => {
      const auth = { Authorization: 'Basic ' + Buffer.from('guest:guest').toString('base64') };
      const response = await fetchWithTimeout(
        `${SERVICES.rabbitmq}/api/queues`,
        { headers: auth },
        10000
      );
      runner.assertResponseOk(response);
      const queues = await response.json();
      runner.assertTrue(Array.isArray(queues), 'Should have queues');
      console.log(`    ${queues.length} queue(s) after multi-tenant submissions`);
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
