#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Restore Script
# ═══════════════════════════════════════════════════════════════════════════
# Restores Docker volumes and databases from a backup.
# Usage: ./scripts/restore.sh <timestamp>
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP="${1:-}"

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$TIMESTAMP" ]; then
    echo -e "${RED}Error: Please provide a backup timestamp.${NC}"
    echo ""
    echo "  Usage: ./scripts/restore.sh <timestamp>"
    echo ""
    echo "  Available backups:"
    ls -1 "$BACKUP_DIR"/*_* 2>/dev/null | grep -oE '[0-9]{8}_[0-9]{6}' | sort -u | head -10 || echo "  No backups found"
    exit 1
fi

echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Restore — $TIMESTAMP${NC}"
echo -e "${BLUE}  Source: $BACKUP_DIR${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""

# ─── Restore Docker Volumes ──────────────────────────────────────────────
echo -e "${YELLOW}▶ Restoring Docker volumes...${NC}"

restore_volume() {
    local volume_name=$1
    local backup_file="$BACKUP_DIR/${volume_name}_${TIMESTAMP}.tar.gz"
    
    if [ -f "$backup_file" ]; then
        docker volume create "$volume_name" 2>/dev/null || true
        docker run --rm \
            -v "$volume_name:/data" \
            -v "$BACKUP_DIR:/backups:ro" \
            alpine:latest \
            tar xzf "/backups/$(basename "$backup_file")" -C /data
        echo -e "  ${GREEN}✓${NC} $volume_name"
    else
        echo -e "  ${YELLOW}⊘${NC} $volume_name (backup not found)"
    fi
}

restore_volume "garamatic_ticket_masala_data"
restore_volume "garamatic_ticket_masala_keys"
restore_volume "garamatic_event_planner_db_data"
restore_volume "garamatic_odoo_data"
restore_volume "garamatic_odoo_db_data"
restore_volume "garamatic_odoo_bridge_data"
restore_volume "garamatic_ollama_data"

# ─── Restore Databases ────────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Restoring databases...${NC}"

# Event Planner (MariaDB)
if [ -f "$BACKUP_DIR/event_planner_db_${TIMESTAMP}.sql" ] && docker ps --format '{{.Names}}' | grep -q "garamatic_event_planner_db"; then
    docker exec -i garamatic_event_planner_db sh -c 'exec mysql -u drupal -pdrupal drupal' < "$BACKUP_DIR/event_planner_db_${TIMESTAMP}.sql"
    echo -e "  ${GREEN}✓${NC} Event Planner DB (MariaDB)"
fi

# Odoo (PostgreSQL)
if [ -f "$BACKUP_DIR/odoo_db_${TIMESTAMP}.sql" ] && docker ps --format '{{.Names}}' | grep -q "garamatic_odoo_db"; then
    docker exec -i garamatic_odoo_db sh -c 'exec psql -U odoo -d odoo' < "$BACKUP_DIR/odoo_db_${TIMESTAMP}.sql"
    echo -e "  ${GREEN}✓${NC} Odoo DB (PostgreSQL)"
fi

# ─── Restore Environment ────────────────────────────────────────────────
echo ""
echo -e "${YELLOW}▶ Restoring environment...${NC}"
if [ -f "$BACKUP_DIR/env_${TIMESTAMP}.backup" ]; then
    cp "$BACKUP_DIR/env_${TIMESTAMP}.backup" ".env"
    echo -e "  ${GREEN}✓${NC} .env file"
fi

# ─── Summary ──────────────────────────────────────────────────────────────
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Restore Complete${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "  ${YELLOW}Restart services:${NC} make down && make up"
echo ""
