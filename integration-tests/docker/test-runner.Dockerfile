# ═══════════════════════════════════════════════════════════════════════════
# Integration Test Runner
# ═══════════════════════════════════════════════════════════════════════════

FROM node:20-alpine

# Install required packages
RUN apk add --no-cache \
    curl \
    jq \
    bash \
    docker-cli \
    docker-compose \
    wait4ports

WORKDIR /runner

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies
RUN npm install

# Copy integration-contracts package and install its deps
COPY docker/test-deps-install.sh /tmp/
RUN chmod +x /tmp/test-deps-install.sh

# Copy test files
COPY tests/ ./tests/
COPY scripts/ ./scripts/

# Make scripts executable
RUN chmod +x scripts/*.sh

# Default command: wait for services and run tests
CMD ["./scripts/run-integration-tests.sh"]
