#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Odoo Auto-Init — Initialize the database on first run + seed demo data
# ═══════════════════════════════════════════════════════════════════════════
set -e

cleanup() {
  echo "Received signal, shutting down Odoo..."
  kill $ODOO_PID 2>/dev/null || true
  wait $ODOO_PID 2>/dev/null || true
  exit 0
}
trap cleanup SIGTERM SIGINT

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
  # Install base + account modules (account is required for invoicing)
  odoo -i base,account -d odoo \
    --db_host=odoo-db \
    --db_user=odoo \
    --db_password=odoo \
    --stop-after-init \
    --no-http
  echo "Odoo database initialized."
fi

# Start Odoo in background
echo "Starting Odoo..."
odoo --db_host=odoo-db --db_user=odoo --db_password=odoo &
ODOO_PID=$!

# Wait for Odoo to be ready
for i in $(seq 1 60); do
  if curl -sf http://localhost:8069/web > /dev/null 2>&1; then
    echo "Odoo is ready"
    break
  fi
  sleep 2
done

# Seed Odoo with demo data
if [ -f "/odoo-seed.py" ]; then
  echo "Seeding Odoo with demo data..."
  python3 /odoo-seed.py || echo "Odoo seeding failed (non-critical)"
fi

# Keep running until Odoo exits
wait $ODOO_PID
