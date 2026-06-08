#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Backup Script
# ═══════════════════════════════════════════════════════════════════════════
# Backs up all Docker volumes and databases.
# Usage: ./scripts/backup.sh [full|incremental]
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_TYPE="${1:-full}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

mkdir -p "$BACKUP_DIR"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Backup — $BACKUP_TYPE${NC}"
echo -e "${BLUE}  Destination: $BACKUP_DIR${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

# ─── Backup Docker Volumes ───────────────────────────────────────────────
echo -e "${YELLOW}▶ Backing up Docker volumes...${NC}"

backup_volume() {
    local volume_name=$1
    local backup_file="$BACKUP_DIR/${volume_name}_${TIMESTAMP}.tar.gz"

    if docker volume inspect "$volume_name" &>/dev/null; then
        docker run --rm \
            -v "$volume_name:/data:ro" \
            -v "$BACKUP_DIR:/backups" \
            alpine:latest \
            tar czf "/backups/$(basename "$backup_file")" -C /data .
        echo -e "  ${GREEN}✓${NC} $volume_name → $(basename "$backup_file")"
    else
        echo -e "  ${YELLOW}⊘${NC} $volume_name (not found, skipping)"
    fi
}

backup_volume "garamatic_ticket_masala_data"
backup_volume "garamatic_ticket_masala_keys"
backup_volume "garamatic_event_planner_db_data"
backup_volume "garamatic_odoo_data"
backup_volume "garamatic_odoo_db_data"
backup_volume "garamatic_odoo_bridge_data"
backup_volume "garamatic_ollama_data"

# ─── Backup Databases ─────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Backing up databases...${NC}"

# Ticket Masala (SQLite)
if docker ps --format '{{.Names}}' | grep -q "garamatic_ticket_masala"; then
    docker exec garamatic_ticket_masala sh -c 'cat /app/data/masala.db' > "$BACKUP_DIR/ticket_masala_db_${TIMESTAMP}.sqlite" 2>/dev/null || true
    if [ -f "$BACKUP_DIR/ticket_masala_db_${TIMESTAMP}.sqlite" ]; then
        echo -e "  ${GREEN}✓${NC} Ticket Masala DB (SQLite)"
    fi
fi

# Event Planner (MariaDB)
if docker ps --format '{{.Names}}' | grep -q "garamatic_event_planner_db"; then
    docker exec garamatic_event_planner_db sh -c 'exec mysqldump -u drupal -pdrupal drupal' > "$BACKUP_DIR/event_planner_db_${TIMESTAMP}.sql" 2>/dev/null || true
    if [ -f "$BACKUP_DIR/event_planner_db_${TIMESTAMP}.sql" ]; then
        echo -e "  ${GREEN}✓${NC} Event Planner DB (MariaDB)"
    fi
fi

# Odoo (PostgreSQL)
if docker ps --format '{{.Names}}' | grep -q "garamatic_odoo_db"; then
    docker exec garamatic_odoo_db sh -c 'exec pg_dump -U odoo -d odoo' > "$BACKUP_DIR/odoo_db_${TIMESTAMP}.sql" 2>/dev/null || true
    if [ -f "$BACKUP_DIR/odoo_db_${TIMESTAMP}.sql" ]; then
        echo -e "  ${GREEN}✓${NC} Odoo DB (PostgreSQL)"
    fi
fi

# ─── Backup Integration Contracts ────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Backing up integration contracts...${NC}"
if [ -d "integration-contracts" ]; then
    tar czf "$BACKUP_DIR/integration_contracts_${TIMESTAMP}.tar.gz" integration-contracts/
    echo -e "  ${GREEN}✓${NC} Integration Contracts"
fi

# ─── Backup Environment ─────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Backing up environment files...${NC}"
if [ -f ".env" ]; then
    cp ".env" "$BACKUP_DIR/env_${TIMESTAMP}.backup"
    echo -e "  ${GREEN}✓${NC} .env file"
fi

# ─── Summary ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Backup Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${GREEN}Files created:${NC}"
ls -lh "$BACKUP_DIR"/*"_${TIMESTAMP}"* 2>/dev/null || echo "  No files created"
echo ""
echo -e "  ${GREEN}Location:${NC} $BACKUP_DIR/"
echo ""
echo -e "  ${YELLOW}To restore:${NC}"
echo "    ./scripts/restore.sh <timestamp>"
echo ""
echo -e "  ${YELLOW}To list backups:${NC}"
echo "    ls -la $BACKUP_DIR/"
echo ""
