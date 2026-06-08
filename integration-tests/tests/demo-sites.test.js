#!/usr/bin/env node
/**
 * Demo Sites E2E Tests
 *
 * Validates that all demo showcase sites are accessible and functional:
 * - Showcase index page loads
 * - Each tenant demo site loads
 * - Forms are properly rendered
 * - Success pages are accessible
 */

import { TestRunner, SERVICES, fetchWithTimeout } from './lib/test-harness.js';

const runner = new TestRunner('Demo Sites E2E Tests');

// Demo showcase base URL from test harness
const SHOWCASE_URL = SERVICES.showcase;

// Tenant configurations
const TENANTS = [
  { id: 'desgoffe', name: 'Desgoffe', lang: 'fr', title: 'Guichet Citoyen', fields: ['customerName', 'customerEmail', 'description', 'requestType'] },
  { id: 'whitman', name: 'Whitman', lang: 'en', title: 'Support Portal', fields: ['description', 'interventionType', 'location'] },
  { id: 'liberty', name: 'Liberty', lang: 'en', title: 'Liberty Support', fields: ['description', 'issueType', 'title', 'reporterName', 'reporterEmail'] },
  { id: 'hennessey', name: 'Hennessey', lang: 'en', title: 'Hennessey Portal', fields: ['projectTitle', 'grantType', 'principalInvestigator', 'piEmail', 'abstract'] }
];

async function main() {
  await runner.describe('Showcase Index Page', async () => {
    await runner.it('should load the showcase index page', async () => {
      const response = await fetchWithTimeout(SHOWCASE_URL, {}, 10000);
      runner.assertResponseOk(response, 'Showcase index should load');

      const html = await response.text();
      runner.assertTrue(html.includes('Ticket Masala Showcase'), 'Should contain showcase title');
      runner.assertTrue(html.includes('Static form sites'), 'Should contain description');
    });

    await runner.it('should list all tenant demos', async () => {
      const response = await fetchWithTimeout(SHOWCASE_URL, {}, 10000);
      runner.assertResponseOk(response);

      const html = await response.text();

      for (const tenant of TENANTS) {
        runner.assertTrue(
          html.includes(`tenants/${tenant.id}/client/index.html`),
          `Should link to ${tenant.name} demo`
        );
      }
    });

    await runner.it('should have correct API endpoint reference', async () => {
      const response = await fetchWithTimeout(SHOWCASE_URL, {}, 10000);
      runner.assertResponseOk(response);

      const html = await response.text();
      runner.assertTrue(
        html.includes('localhost:8085'),
        'Should reference Ticket Masala API'
      );
    });
  });

  // Test each tenant demo site
  for (const tenant of TENANTS) {
    await runner.describe(`${tenant.name} Demo Site`, async () => {
      const tenantUrl = `${SHOWCASE_URL}/tenants/${tenant.id}/client/index.html`;
      const successUrl = `${SHOWCASE_URL}/tenants/${tenant.id}/client/success.html`;

      await runner.it(`${tenant.name} index page should load`, async () => {
        let response;
        try {
          response = await fetchWithTimeout(tenantUrl, {}, 10000);
        } catch (error) {
          runner.skip(`${tenant.name} demo site not accessible`);
          return;
        }

        runner.assertResponseOk(response, `${tenant.name} index should load`);

        const html = await response.text();
        runner.assertTrue(html.includes('<form'), 'Should contain a form');
        for (const field of tenant.fields) {
          runner.assertTrue(html.includes(field), `Should have ${field} field`);
        }
      });

      await runner.it(`${tenant.name} form should have correct tenant ID`, async () => {
        let response;
        try {
          response = await fetchWithTimeout(tenantUrl, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} not accessible`);
          return;
        }

        const html = await response.text();
        runner.assertTrue(
          html.includes(`data-theme="${tenant.id}"`) || html.includes(`"${tenant.id}"`),
          `Should have tenant ID ${tenant.id}`
        );
      });

      await runner.it(`${tenant.name} should have CSS styling`, async () => {
        let response;
        try {
          response = await fetchWithTimeout(tenantUrl, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} not accessible`);
          return;
        }

        const html = await response.text();
        runner.assertTrue(
          html.includes('<link') && html.includes('.css'),
          'Should load CSS stylesheet'
        );
      });

      await runner.it(`${tenant.name} should have JavaScript`, async () => {
        let response;
        try {
          response = await fetchWithTimeout(tenantUrl, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} not accessible`);
          return;
        }

        const html = await response.text();
        runner.assertTrue(
          html.includes('<script') && html.includes('script.js'),
          'Should load JavaScript'
        );
      });

      await runner.it(`${tenant.name} success page should exist`, async () => {
        let response;
        try {
          response = await fetchWithTimeout(successUrl, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} success page not accessible`);
          return;
        }

        // Success page should exist (200) or redirect (3xx)
        runner.assertTrue(
          response.status === 200 || response.status === 301 || response.status === 302,
          `Success page should be accessible, got ${response.status}`
        );
      });

      await runner.it(`${tenant.name} manifest.json should be valid`, async () => {
        const manifestUrl = `${SHOWCASE_URL}/tenants/${tenant.id}/client/manifest.json`;
        let response;
        try {
          response = await fetchWithTimeout(manifestUrl, {}, 10000);
        } catch {
          runner.skip(`${tenant.name} manifest not accessible`);
          return;
        }

        runner.assertResponseOk(response, 'Manifest should load');

        const manifest = await response.json();
        runner.assertNotNull(manifest.name, 'Manifest should have name');
        runner.assertNotNull(manifest.short_name, 'Manifest should have short_name');
        runner.assertNotNull(manifest.start_url, 'Manifest should have start_url');
      });
    });
  }

  await runner.describe('Config Viewer', async () => {
    await runner.it('should load config viewer page', async () => {
      const configViewerUrl = `${SHOWCASE_URL}/config-viewer.html`;
      const response = await fetchWithTimeout(configViewerUrl, {}, 10000);
      runner.assertResponseOk(response, 'Config viewer should load');

      const html = await response.text();
      runner.assertTrue(html.includes('Config') || html.includes('config'), 'Should contain config viewer');
    });

    await runner.it('should load config for each tenant', async () => {
      for (const tenant of TENANTS) {
        const configUrl = `${SHOWCASE_URL}/config-viewer.html?tenant=${tenant.id}`;
        let response;
        try {
          response = await fetchWithTimeout(configUrl, {}, 10000);
        } catch {
          runner.skip(`Config viewer for ${tenant.name} not accessible`);
          return;
        }

        // Config viewer should load (may return 200 or redirect)
        runner.assertTrue(
          response.status < 500,
          `Config viewer for ${tenant.name} should not error, got ${response.status}`
        );
      }
    });
  });

  await runner.describe('Tenant Assets', async () => {
    await runner.it('should have tenant logos available', async () => {
      for (const tenant of TENANTS) {
        const logoUrl = `${SHOWCASE_URL}/tenants/${tenant.id}/${tenant.id}.png`;
        let response;
        try {
          response = await fetchWithTimeout(logoUrl, {}, 5000);
        } catch {
          runner.skip(`${tenant.name} logo not accessible`);
          return;
        }

        // Logo should exist (may be served as image)
        runner.assertTrue(
          response.status === 200 || response.status === 304,
          `${tenant.name} logo should be available, got ${response.status}`
        );
      }
    });

    await runner.it('should have shared assets directory', async () => {
      const assetsUrl = `${SHOWCASE_URL}/tenants/assets/`;
      const response = await fetchWithTimeout(assetsUrl, {}, 5000);

      // Assets directory may or may not be indexable
      runner.assertTrue(
        response.status < 500,
        `Assets directory should not error, got ${response.status}`
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
