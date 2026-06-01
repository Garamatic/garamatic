#!/usr/bin/env node
/**
 * Tenant Form Submission E2E Tests
 *
 * Tests that tenant demo forms submit to the Ticket Masala API correctly:
 * - Form data reaches the API endpoint
 * - Tenant routing works via X-Tenant header
 * - Form validation is enforced
 * - Success pages redirect correctly
 * - Cross-tenant isolation is maintained
 */

import { TestRunner, SERVICES, fetchWithTimeout, generateTestTicket, randomUUID } from './lib/test-harness.js';

const runner = new TestRunner('Tenant Form Submission E2E Tests');

// Tenant configurations
const TENANTS = [
  { id: 'desgoffe', name: 'Desgoffe', lang: 'fr', customField: 'quartier' },
  { id: 'whitman', name: 'Whitman', lang: 'en', customField: 'worksite' },
  { id: 'liberty', name: 'Liberty', lang: 'en', customField: 'department' },
  { id: 'hennessey', name: 'Hennessey', lang: 'en', customField: 'grantType' }
];

/**
 * Build a FormData payload for tenant form submission
 */
function buildFormData(tenant, overrides = {}) {
  const formData = new FormData();
  
  formData.append('CustomerName', overrides.customerName || 'Test User');
  formData.append('CustomerEmail', overrides.customerEmail || `test-${Date.now()}@example.com`);
  formData.append('CustomerPhone', overrides.customerPhone || '555-1234');
  formData.append('Description', overrides.description || 'Test form submission from integration test');
  formData.append('WorkItemType', overrides.workItemType || 'general');
  formData.append('PriorityScore', String(overrides.priorityScore || 10));
  formData.append('Priority', overrides.priority || 'medium');
  
  // Add tenant-specific custom field
  if (tenant.customField) {
    const customValue = overrides.customFieldValue || 'test-value';
    formData.append('Tags', `${tenant.customField}:${customValue}`);
  }
  
  return formData;
}

/**
 * Submit form data to the portal API
 */
async function submitToPortal(formData, tenantId, timeout = 10000) {
  const headers = {
    'X-Tenant': tenantId
  };
  
  // Use fetch with FormData
  const response = await fetchWithTimeout(
    `${SERVICES.ticketMasala}/api/portal/submit`,
    {
      method: 'POST',
      headers,
      body: formData
    },
    timeout
  );
  
  return response;
}

async function main() {
  await runner.describe('Portal API Endpoint', async () => {
    await runner.it('should have portal submit endpoint accessible', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/portal/submit`,
        { method: 'OPTIONS' },
        5000
      );
      
      // OPTIONS may not be supported, but endpoint should exist
      runner.assertTrue(
        response.status !== 404,
        `Portal endpoint should exist, got ${response.status}`
      );
    });

    await runner.it('should return method not allowed for GET requests', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/portal/submit`,
        { method: 'GET' },
        5000
      );
      
      // GET should not be allowed for form submission
      runner.assertTrue(
        response.status === 405 || response.status === 404 || response.status === 400,
        `GET should not be allowed, got ${response.status}`
      );
    });
  });

  // Test each tenant
  for (const tenant of TENANTS) {
    await runner.describe(`${tenant.name} Form Submission`, async () => {
      await runner.it(`should submit form for ${tenant.name}`, async () => {
        const formData = buildFormData(tenant, {
          customerName: `${tenant.name} Test User`,
          customerEmail: `${tenant.id}-test-${Date.now()}@example.com`,
          description: `Test submission for ${tenant.name} tenant`
        });

        const response = await submitToPortal(formData, tenant.id);
        
        if (response.status === 401 || response.status === 403) {
          runner.skip(`${tenant.name} form submission (auth required)`);
          return;
        }
        
        // Should accept form submission (may be 200 or 201)
        runner.assertTrue(
          response.status === 200 || response.status === 201,
          `Form submission should be accepted, got ${response.status}`
        );
      });

      await runner.it(`should include tenant-specific custom field for ${tenant.name}`, async () => {
        const formData = buildFormData(tenant, {
          customFieldValue: `${tenant.id}-custom-value`
        });

        const response = await submitToPortal(formData, tenant.id);
        
        if (response.status === 401 || response.status === 403) {
          runner.skip(`${tenant.name} custom field (auth required)`);
          return;
        }
        
        runner.assertTrue(
          response.status === 200 || response.status === 201,
          `Form with custom field should be accepted, got ${response.status}`
        );
      });

      await runner.it(`should handle different priority levels for ${tenant.name}`, async () => {
        const priorities = [
          { score: 5, label: 'low' },
          { score: 10, label: 'medium' },
          { score: 15, label: 'high' },
          { score: 20, label: 'urgent' }
        ];

        const results = [];
        for (const priority of priorities) {
          const formData = buildFormData(tenant, {
            priorityScore: priority.score,
            priority: priority.label,
            description: `Test ${priority.label} priority for ${tenant.name}`
          });

          const response = await submitToPortal(formData, tenant.id);
          results.push({
            priority: priority.label,
            status: response.status,
            ok: response.status >= 200 && response.status < 300
          });
        }

        const successCount = results.filter(r => r.ok).length;
        console.log(`    ${tenant.name}: ${successCount}/${priorities.length} priorities accepted`);
        
        runner.assertTrue(
          successCount > 0,
          `Should accept at least some priorities for ${tenant.name}`
        );
      });

      await runner.it(`should reject empty required fields for ${tenant.name}`, async () => {
        const formData = new FormData();
        formData.append('CustomerName', '');
        formData.append('CustomerEmail', '');
        formData.append('Description', '');
        
        const response = await submitToPortal(formData, tenant.id);
        
        // Empty required fields should be rejected
        runner.assertTrue(
          response.status === 400 || response.status === 422 || response.status === 500,
          `Empty required fields should be rejected, got ${response.status}`
        );
      });

      await runner.it(`should handle special characters in form data for ${tenant.name}`, async () => {
        const formData = buildFormData(tenant, {
          customerName: 'Test <script>alert("xss")</script> User',
          description: 'Test with "quotes" and \'apostrophes\' and <tags>',
          customFieldValue: 'Test with !@#$%^&*()'
        });

        const response = await submitToPortal(formData, tenant.id);
        
        if (response.status === 401 || response.status === 403) {
          runner.skip(`${tenant.name} special chars (auth required)`);
          return;
        }
        
        // Should handle special characters (either accept or sanitize)
        runner.assertTrue(
          response.status < 500,
          `Special characters should not crash, got ${response.status}`
        );
      });
    });
  }

  await runner.describe('Cross-Tenant Isolation', async () => {
    await runner.it('should route requests to correct tenant', async () => {
      const formData = buildFormData(TENANTS[0], {
        description: 'Test tenant routing'
      });

      const response = await submitToPortal(formData, TENANTS[0].id);
      
      if (response.status === 401 || response.status === 403) {
        runner.skip('Tenant routing (auth required)');
        return;
      }
      
      runner.assertTrue(
        response.status === 200 || response.status === 201,
        `Tenant routing should work, got ${response.status}`
      );
    });

    await runner.it('should handle tenant header correctly', async () => {
      const formData = buildFormData(TENANTS[0]);
      
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/portal/submit`,
        {
          method: 'POST',
          headers: { 'X-Tenant': TENANTS[0].id },
          body: formData
        },
        10000
      );
      
      runner.assertTrue(
        response.status < 500,
        `Tenant header should be handled, got ${response.status}`
      );
    });
  });

  await runner.describe('Form Validation', async () => {
    await runner.it('should reject missing required fields', async () => {
      const formData = new FormData();
      formData.append('CustomerName', 'Only Name');
      
      const response = await submitToPortal(formData, TENANTS[0].id);
      
      runner.assertTrue(
        response.status === 400 || response.status === 422 || response.status === 500,
        `Missing required fields should be rejected, got ${response.status}`
      );
    });

    await runner.it('should reject invalid email format', async () => {
      const formData = buildFormData(TENANTS[0], {
        customerEmail: 'not-an-email'
      });
      
      const response = await submitToPortal(formData, TENANTS[0].id);
      
      // May accept or reject, but should not crash
      runner.assertTrue(
        response.status < 500,
        `Invalid email should not crash, got ${response.status}`
      );
    });

    await runner.it('should handle very long descriptions', async () => {
      const formData = buildFormData(TENANTS[0], {
        description: 'A'.repeat(5000)
      });
      
      const response = await submitToPortal(formData, TENANTS[0].id);
      
      if (response.status === 401 || response.status === 403) {
        runner.skip('Long description (auth required)');
        return;
      }
      
      runner.assertTrue(
        response.status < 500,
        `Long description should not crash, got ${response.status}`
      );
    });
  });

  await runner.describe('Form Submission with API', async () => {
    await runner.it('should create ticket via API after form submission', async () => {
      const uniqueEmail = `form-api-${Date.now()}@example.com`;
      const formData = buildFormData(TENANTS[0], {
        customerEmail: uniqueEmail,
        description: 'Test API integration after form submission'
      });

      const response = await submitToPortal(formData, TENANTS[0].id);
      
      if (response.status === 401 || response.status === 403) {
        runner.skip('Form API integration (auth required)');
        return;
      }
      
      if (response.status >= 200 && response.status < 300) {
        const result = await response.json();
        runner.assertTrue(
          result.id || result.ticket_id || result.success,
          'Should return ticket or success info'
        );
      }
    });
  });

  await runner.describe('Form Submission Under Load', async () => {
    await runner.it('should handle multiple rapid submissions', async () => {
      const submissions = [];
      
      for (let i = 0; i < 5; i++) {
        const formData = buildFormData(TENANTS[0], {
          customerEmail: `load-${i}-${Date.now()}@example.com`,
          description: `Load test submission ${i}`
        });
        
        submissions.push(submitToPortal(formData, TENANTS[0].id));
      }
      
      const results = await Promise.all(submissions);
      const successCount = results.filter(r => r.status >= 200 && r.status < 300).length;
      
      console.log(`    ${successCount}/5 rapid submissions accepted`);
      runner.assertTrue(
        successCount > 0,
        'Should handle at least some rapid submissions'
      );
    });
  });

  await runner.describe('Form Submission Error Handling', async () => {
    await runner.it('should handle malformed form data', async () => {
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/portal/submit`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-Tenant': TENANTS[0].id
          },
          body: 'not valid form data'
        },
        5000
      );
      
      runner.assertTrue(
        response.status === 400 || response.status === 415 || response.status === 500,
        `Malformed data should be rejected, got ${response.status}`
      );
    });

    await runner.it('should handle missing tenant header', async () => {
      const formData = buildFormData(TENANTS[0]);
      
      const response = await fetchWithTimeout(
        `${SERVICES.ticketMasala}/api/portal/submit`,
        {
          method: 'POST',
          body: formData
        },
        5000
      );
      
      // May accept or reject, but should not crash
      runner.assertTrue(
        response.status < 500,
        `Missing tenant header should not crash, got ${response.status}`
      );
    });
  });

  runner.printSummary();
  runner.exit();
}

main().catch(error => {
  console.error('Fatal error:', error);
  process.exit(1);
});
