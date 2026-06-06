/**
 * Shared API Client for Demo Seeding
 *
 * Reusable HTTP client with retry logic for all Garamatic services.
 */

const DEFAULT_TIMEOUT = 10000;
const MAX_RETRIES = 3;

class ApiClient {
  constructor(baseUrl, defaultHeaders = {}) {
    this.baseUrl = baseUrl.replace(/\/$/, '');
    this.defaultHeaders = defaultHeaders;
  }

  async request(method, path, body = null, headers = {}) {
    const url = `${this.baseUrl}${path}`;
    const allHeaders = { ...this.defaultHeaders, ...headers };
    if (body && typeof body === 'object') {
      allHeaders['Content-Type'] = 'application/json';
    }

    const options = {
      method,
      headers: allHeaders,
      signal: AbortSignal.timeout(DEFAULT_TIMEOUT)
    };

    if (body) {
      options.body = typeof body === 'string' ? body : JSON.stringify(body);
    }

    let lastError;
    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
      try {
        const response = await fetch(url, options);
        return response;
      } catch (error) {
        lastError = error;
        if (attempt < MAX_RETRIES) {
          await new Promise(r => setTimeout(r, 1000 * attempt));
        }
      }
    }
    throw lastError;
  }

  async get(path, headers = {}) {
    return this.request('GET', path, null, headers);
  }

  async post(path, body, headers = {}) {
    return this.request('POST', path, body, headers);
  }

  async patch(path, body, headers = {}) {
    return this.request('PATCH', path, body, headers);
  }

  async put(path, body, headers = {}) {
    return this.request('PUT', path, body, headers);
  }

  async delete(path, headers = {}) {
    return this.request('DELETE', path, null, headers);
  }

  async json(method, path, body = null, headers = {}) {
    const response = await this.request(method, path, body, headers);
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }
}

function createTicketMasalaClient(baseUrl) {
  return new ApiClient(baseUrl);
}

function createGatekeeperClient(baseUrl, apiKey) {
  return new ApiClient(baseUrl, { 'X-Api-Key': apiKey });
}

function createAgenticClient(baseUrl) {
  return new ApiClient(baseUrl);
}

function createOdooClient(baseUrl) {
  return new ApiClient(baseUrl);
}

function createMailhogClient(baseUrl) {
  return new ApiClient(baseUrl);
}

module.exports = {
  ApiClient,
  createTicketMasalaClient,
  createGatekeeperClient,
  createAgenticClient,
  createOdooClient,
  createMailhogClient
};
