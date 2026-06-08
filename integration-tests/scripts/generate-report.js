#!/usr/bin/env node
/**
 * Integration Test Report Generator
 *
 * Generates HTML and JSON reports from test results
 */

import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';

const RESULTS_DIR = './test-results';
const REPORTS_DIR = './test-reports';

async function generateHTMLReport(results) {
  const timestamp = results.timestamp || new Date().toISOString();
  const summary = results.summary || {};
  const suites = results.suites || [];
  const services = results.services || {};

  const overall = summary.failed === 0 ? 'passed' : 'failed';

  const suiteRows = suites.map(s => {
    const statusColor = s.failed === 0 ? '#22c55e' : '#ef4444';
    const status = s.failed === 0 ? 'pass' : 'fail';
    return `
      <tr>
        <td>${s.suite}</td>
        <td><span class="badge badge-${status}">${s.status}</span></td>
        <td>${s.passed}</td>
        <td>${s.failed}</td>
        <td>${s.skipped}</td>
        <td>${s.duration}ms</td>
      </tr>
    `;
  }).join('');

  const serviceCards = Object.entries(services).map(([name, url]) => `
    <div class="service-item online">
      <div class="service-name">${name.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</div>
      <div class="service-url">${url}</div>
    </div>
  `).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Garamatic Integration Test Report</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
      padding: 20px;
    }
    .container { max-width: 1200px; margin: 0 auto; }
    header {
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 30px;
      border-radius: 12px;
      margin-bottom: 30px;
    }
    h1 { font-size: 2rem; margin-bottom: 10px; }
    .timestamp { opacity: 0.9; font-size: 0.9rem; }

    .summary-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 30px;
    }
    .card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
      text-align: center;
    }
    .card-value { font-size: 3rem; font-weight: bold; margin-bottom: 5px; }
    .card-label { color: #666; text-transform: uppercase; font-size: 0.85rem; letter-spacing: 1px; }
    .card.passed { border-top: 4px solid #22c55e; }
    .card.failed { border-top: 4px solid #ef4444; }
    .card.skipped { border-top: 4px solid #f59e0b; }
    .card.total { border-top: 4px solid #3b82f6; }
    .passed .card-value { color: #22c55e; }
    .failed .card-value { color: #ef4444; }
    .skipped .card-value { color: #f59e0b; }
    .total .card-value { color: #3b82f6; }

    .section {
      background: white;
      border-radius: 12px;
      padding: 25px;
      margin-bottom: 20px;
      box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    }
    h2 { margin-bottom: 20px; color: #444; }

    .service-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 15px;
    }
    .service-item {
      padding: 15px;
      border-radius: 8px;
      background: #f8f9fa;
      border-left: 4px solid #ddd;
    }
    .service-item.online { border-left-color: #22c55e; }
    .service-item.offline { border-left-color: #ef4444; }
    .service-name { font-weight: 600; margin-bottom: 5px; }
    .service-url { font-size: 0.85rem; color: #666; font-family: monospace; }

    table {
      width: 100%;
      border-collapse: collapse;
    }
    th, td {
      padding: 12px 15px;
      text-align: left;
      border-bottom: 1px solid #eee;
    }
    th {
      font-weight: 600;
      color: #666;
      text-transform: uppercase;
      font-size: 0.75rem;
      letter-spacing: 1px;
    }
    tr:last-child td { border-bottom: none; }

    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 20px;
      font-size: 0.75rem;
      font-weight: 600;
      text-transform: uppercase;
    }
    .badge-pass { background: #dcfce7; color: #166534; }
    .badge-fail { background: #fee2e2; color: #991b1b; }
    .badge-skipped { background: #fef3c7; color: #92400e; }
    .badge-success { background: #dcfce7; color: #166534; }
    .badge-failure { background: #fee2e2; color: #991b1b; }

    footer {
      text-align: center;
      padding: 30px;
      color: #666;
      font-size: 0.9rem;
    }
  </style>
</head>
<body>
  <div class="container">
    <header>
      <h1>🔧 Garamatic Integration Test Report</h1>
      <p class="timestamp">Generated: ${timestamp}</p>
    </header>

    <div class="summary-cards">
      <div class="card passed">
        <div class="card-value">${summary.passed || 0}</div>
        <div class="card-label">Passed</div>
      </div>
      <div class="card failed">
        <div class="card-value">${summary.failed || 0}</div>
        <div class="card-label">Failed</div>
      </div>
      <div class="card skipped">
        <div class="card-value">${summary.skipped || 0}</div>
        <div class="card-label">Skipped</div>
      </div>
      <div class="card total">
        <div class="card-value">${summary.total || 0}</div>
        <div class="card-label">Total Tests</div>
      </div>
    </div>

    <div class="section">
      <h2>🌐 Service Status</h2>
      <div class="service-grid">
        ${serviceCards}
      </div>
    </div>

    <div class="section">
      <h2>📋 Test Suites</h2>
      <table>
        <thead>
          <tr>
            <th>Suite</th>
            <th>Status</th>
            <th>Passed</th>
            <th>Failed</th>
            <th>Skipped</th>
            <th>Duration</th>
          </tr>
        </thead>
        <tbody>
          ${suiteRows}
        </tbody>
      </table>
    </div>

    <div class="section">
      <h2>📊 Overall Status</h2>
      <p>
        <span class="badge ${overall === 'passed' ? 'badge-success' : 'badge-failure'}">
          ${overall === 'passed' ? 'All Tests Passed' : 'Tests Failed'}
        </span>
      </p>
      <p style="margin-top: 15px;">
        ${overall === 'passed'
          ? '✅ All integration tests completed successfully. The services are properly integrated.'
          : `⚠️ ${summary.failed} test(s) failed. Review the logs for details.`}
      </p>
    </div>

    <footer>
      <p>Garamatic Integration Test Suite &bull; Generated by unified test runner</p>
    </footer>
  </div>
</body>
</html>`;
}

async function main() {
  try {
    await mkdir(REPORTS_DIR, { recursive: true });

    // Read test results
    const resultsPath = join(RESULTS_DIR, 'test-results.json');
    const results = JSON.parse(await readFile(resultsPath, 'utf-8'));

    // Generate HTML report
    const html = await generateHTMLReport(results);
    await writeFile(join(REPORTS_DIR, 'report.html'), html);

    // Generate Markdown summary
    const md = `# Integration Test Report

**Generated:** ${results.timestamp}
**Overall:** ${results.overall === 'passed' ? '✅ All tests passed' : '⚠️ Some tests failed'}

## Summary

| Metric | Count |
|--------|-------|
| ✅ Passed | ${results.summary?.passed || 0} |
| ❌ Failed | ${results.summary?.failed || 0} |
| ⏭️ Skipped | ${results.summary?.skipped || 0} |
| **Total** | **${results.summary?.total || 0}** |

## Test Suites

| Suite | Status | Passed | Failed | Skipped | Duration |
|-------|--------|--------|--------|---------|----------|
${(results.suites || []).map(s => `| ${s.suite} | ${s.status} | ${s.passed} | ${s.failed} | ${s.skipped} | ${s.duration}ms |`).join('\n')}

## Services Tested

${Object.entries(results.services || {}).map(([name, url]) => `- **${name}:** ${url}`).join('\n')}

## Status

${results.summary?.failed === 0 ? '✅ All tests passed' : `⚠️ ${results.summary?.failed} test(s) failed`}
`;
    await writeFile(join(REPORTS_DIR, 'report.md'), md);

    console.log('Reports generated:');
    console.log(`  - ${join(REPORTS_DIR, 'report.html')}`);
    console.log(`  - ${join(REPORTS_DIR, 'report.md')}`);

  } catch (error) {
    console.error('Failed to generate report:', error.message);
    process.exit(1);
  }
}

main();
