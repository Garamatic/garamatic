# ═══════════════════════════════════════════════════════════════════════════
# Demo Seeder Image
#
# Waits for all services to be healthy, then seeds them via APIs.
# Based on node:20-alpine for a small footprint.
# ═══════════════════════════════════════════════════════════════════════════

FROM node:20-alpine

# Install curl and wait-for-it
RUN apk add --no-cache curl bash netcat-openbsd

WORKDIR /seeder

# Copy seeding data and scripts
COPY data/ ./data/
COPY data-desgoffe/ ./data-desgoffe/
COPY lib/ ./lib/
COPY scripts/ ./scripts/
COPY seed.js ./

# Make scripts executable
RUN chmod +x scripts/*.sh

# Default: run the seed orchestrator
CMD ["node", "seed.js"]
