#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Odoo Auto-Init — Initialize the database on first run
# ═══════════════════════════════════════════════════════════════════════════
set -e

# Wait for PostgreSQL
until pg_isready -h odoo-db -U odoo; do
  echo "Waiting for PostgreSQL..."
  sleep 2
done

# Check if the database exists
if psql -h odoo-db -U odoo -d odoo -c "SELECT 1 FROM ir_module_module WHERE name='base'" 2>/dev/null | grep -q 1; then
  echo "Odoo database already initialized."
else
  echo "Initializing Odoo database..."
  # Create database and install base module
  odoo -i base -d odoo \
    --db_host=odoo-db \
    --db_user=odoo \
    --db_password=odoo \
    --stop-after-init \
    --no-http
  echo "Odoo database initialized."
fi

# Start Odoo normally
exec odoo --db_host=odoo-db --db_user=odoo --db_password=odoo
