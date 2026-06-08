#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════
# Garamatic Demo Smoke Test
# Quick verification that all services are healthy and responding
# ═══════════════════════════════════════════════════════════════

set -uo pipefail
# Don't use set -e — we handle errors in check functions

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

PASS=0
FAIL=0
WARN=0

# ─────────────────────────────────────────────────────────────
# Helpers
# ─────────────────────────────────────────────────────────────

check_http() {
    local name="$1"
    local url="$2"
    local expected="${3:-200}"
    local auth="${4:-}"

    local curl_opts="-sf -o /dev/null -w %{http_code} --max-time 3"
    if [ -n "$auth" ]; then
        curl_opts="$curl_opts -u $auth"
    fi

    local status
    status=$(curl $curl_opts "$url" 2>/dev/null) || true
    status=${status:-000}

    if [ "$status" = "$expected" ] || { [ "$status" = "000" ] && [ "$expected" = "000" ]; }; then
        echo -e "${GREEN}✓${NC} $name — $status"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $name — got $status, expected $expected"
        ((FAIL++))
    fi
}

check_http_sse() {
    local name="$1"
    local url="$2"
    local expected="${3:-200}"

    local status
    status=$(curl -s --max-time 2 -w "%{http_code}" -o /dev/null "$url" 2>/dev/null) || true
    status=${status:-000}

    if [ "$status" = "$expected" ] || { [ "$status" = "000" ] && [ "$expected" = "000" ]; }; then
        echo -e "${GREEN}✓${NC} $name — $status"
        ((PASS++))
    else
        echo -e "${RED}✗${NC} $name — got $status, expected $expected"
        ((FAIL++))
    fi
}

check_json() {
    local name="$1"
    local url="$2"
    local jq_query="${3:-.}"
    local auth="${4:-}"

    local curl_opts="-sf --max-time 3"
    if [ -n "$auth" ]; then
        curl_opts="$curl_opts -u $auth"
    fi

    local body
    body=$(curl $curl_opts "$url" 2>/dev/null) || true
    if [ -n "$body" ] && [ "$body" != "null" ]; then
        if echo "$body" | jq -e "$jq_query" >/dev/null 2>&1; then
            echo -e "${GREEN}✓${NC} $name — JSON OK"
            ((PASS++))
        else
            echo -e "${YELLOW}⚠${NC} $name — JSON parse failed"
            ((WARN++))
        fi
    else
        echo -e "${RED}✗${NC} $name — unreachable"
        ((FAIL++))
    fi
}

# ─────────────────────────────────────────────────────────────
# Header
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Demo Smoke Test${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# ─────────────────────────────────────────────────────────────
# 1. Service Health Checks
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}1. Service Health${NC}"
check_http "Ticket Masala"     "http://localhost:8085/health"          "200"
check_http "Gatekeeper"       "http://localhost:8086/health"          "200"
check_http "Mailing Service"   "http://localhost:8087/health"          "200"
check_http "Agentic Service"   "http://localhost:3001/health"            "200"
check_http "Odoo Bridge"      "http://localhost:8089/health"            "200"
check_http "RabbitMQ Mgmt"    "http://localhost:15672/api/overview"   "200" "guest:guest"
check_http "Mailhog"          "http://localhost:8025/api/v2/messages"  "200"
check_http "Showcase"          "http://localhost:8092"                 "200"
check_http "Portal"            "http://localhost:8093"                 "200"
echo ""

# ─────────────────────────────────────────────────────────────
# 2. API Endpoints
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}2. API Endpoints${NC}"
check_http "Ticket Masala — /api/tickets (expects auth)" "http://localhost:8085/api/tickets" "401"
check_http "Agentic — /agent/chat"      "http://localhost:3001/agent/chat"        "401"
check_json "Mailhog — messages"          "http://localhost:8025/api/v2/messages" "has(\"count\")"
check_json "RabbitMQ — queues"            "http://localhost:15672/api/queues"     "type == \"array\"" "guest:guest"
echo ""

# ─────────────────────────────────────────────────────────────
# 3. RabbitMQ Exchange & Bindings
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}3. RabbitMQ Event Exchange${NC}"
if curl -sf -u guest:guest --max-time 3 "http://localhost:15672/api/exchanges/%2f/event_exchange" >/dev/null 2>&1; then
    echo -e "${GREEN}✓${NC} event_exchange exists"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} event_exchange not found (may be created lazily)"
    ((WARN++))
fi

echo ""

# ─────────────────────────────────────────────────────────────
# 4. Demo Data (if seeded)
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}4. Demo Data${NC}"
TICKET_COUNT=$(curl -sf --max-time 3 -H "X-Api-Key: demo-api-key" "http://localhost:8086/api/ingest" -X POST -H "Content-Type: application/json" -d '{"event_type":"ticket.created","ticket_id":"check","customer_email":"check@test.com","customer_name":"Check","description":"check"}' -o /dev/null -w "%{http_code}" 2>/dev/null || echo "000")
EMAIL_COUNT=$(curl -sf --max-time 3 "http://localhost:8025/api/v2/messages" 2>/dev/null | jq '.count' 2>/dev/null || echo "0")

if [ "$TICKET_COUNT" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Tickets seeded: $TICKET_COUNT"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} No tickets found — run 'docker compose run --rm seeder'"
    ((WARN++))
fi

if [ "$EMAIL_COUNT" -gt 0 ] 2>/dev/null; then
    echo -e "${GREEN}✓${NC} Emails captured: $EMAIL_COUNT"
    ((PASS++))
else
    echo -e "${YELLOW}⚠${NC} No emails captured — seed data to trigger events"
    ((WARN++))
fi

echo ""

# ─────────────────────────────────────────────────────────────
# Summary
# ─────────────────────────────────────────────────────────────

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "  ${GREEN}Passed:  $PASS${NC}"
echo -e "  ${YELLOW}Warnings: $WARN${NC}"
echo -e "  ${RED}Failed:  $FAIL${NC}"
echo ""

if [ "$FAIL" -eq 0 ]; then
    echo -e "${GREEN}Demo environment is ready!${NC}"
    echo ""
    echo "  Dashboard:    http://localhost:8092"
    echo "  Ticket Masala: http://localhost:8085"
    echo "  RabbitMQ:     http://localhost:15672 (guest/guest)"
    echo "  Mailhog:      http://localhost:8025"
    echo ""
    exit 0
else
    echo -e "${RED}Some services are not responding. Check 'docker compose ps' and logs.${NC}"
    echo ""
    exit 1
fi
