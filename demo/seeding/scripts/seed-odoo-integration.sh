#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Seed Odoo Integration — verify Odoo data and LiteDB state
#
# The actual Odoo data is seeded by odoo-seed.py inside the Odoo container.
# This script verifies the Odoo integration worker can connect and
# initializes the LiteDB state volume if needed.
# ═══════════════════════════════════════════════════════════════════════════

set -e

ODOO_URL="${ODOO_URL:-http://odoo-integration:8080}"
ODOO_BACKEND="${ODOO_BACKEND_URL:-http://odoo:8069}"
DB_PATH="/app/data/seeded_state.db"

echo "Verifying odoo-integration seeding..."

# Wait for odoo-integration health endpoint to be ready
for i in $(seq 1 30); do
  if curl -sf "${ODOO_URL}/health" > /dev/null 2>&1; then
    echo "  ✓ Odoo integration worker is healthy"
    break
  fi
  if [ "$i" -eq 30 ]; then
    echo "  ⚠ Odoo integration worker not healthy — may need restart"
  fi
  sleep 2
done

# Check if Odoo backend is accessible
echo "  Checking Odoo backend at ${ODOO_BACKEND}..."
if curl -sf "${ODOO_BACKEND}/web" > /dev/null 2>&1; then
  echo "  ✓ Odoo backend is accessible"
else
  echo "  ⚠ Odoo backend not accessible — invoices will be created when Odoo is ready"
fi

# Ensure the LiteDB data directory exists
mkdir -p /app/data
echo "  ✓ LiteDB data directory ready at ${DB_PATH}"

# Note: The actual Odoo customers and accounts are seeded by the
# odoo-seed.py script that runs inside the Odoo container on startup.
# See: ../scripts/odoo-seed.py (mounted in the Odoo container)

echo ""
echo "Odoo integration seeding complete"
