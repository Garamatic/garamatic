#!/bin/bash
# Local Integration Test Runner — runs tests against locally running services
# Usage: ./scripts/test-local.sh [test-file]

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

RED='\033[0;31m'; GREEN='\033[0;32m'; YELLOW='\033[1;33m'; BLUE='\033[0;34m'; NC='\033[0m'

export TICKET_MASALA_URL="${TICKET_MASALA_URL:-http://localhost:8085}"
export GATEKEEPER_URL="${GATEKEEPER_URL:-http://localhost:8086}"
export MAILING_SERVICE_URL="${MAILING_SERVICE_URL:-http://localhost:8087}"
export EVENT_PLANNER_URL="${EVENT_PLANNER_URL:-http://localhost:8088}"
export AGENTIC_SERVICE_URL="${AGENTIC_SERVICE_URL:-http://localhost:3001}"
export ODOO_INTEGRATION_URL="${ODOO_INTEGRATION_URL:-http://localhost:8089}"
export RABBITMQ_URL="${RABBITMQ_URL:-http://localhost:15672}"
export MAILHOG_URL="${MAILHOG_URL:-http://localhost:8025}"
# Test receiver is an nginx container only available in Docker compose — no local default

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Integration Tests (Local)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Ticket Masala:   $TICKET_MASALA_URL"
echo "Gatekeeper:      $GATEKEEPER_URL"
echo "Mailing:         $MAILING_SERVICE_URL"
echo "Event Planner:   $EVENT_PLANNER_URL"
echo "Agentic:         $AGENTIC_SERVICE_URL"
echo "Odoo Integ:      $ODOO_INTEGRATION_URL"
echo "RabbitMQ:        $RABBITMQ_URL"
echo "Mailhog:         $MAILHOG_URL"
echo ""

# Check if core services are running
echo -e "${YELLOW}Checking service availability...${NC}"
SERVICES_OK=true
for service in "$TICKET_MASALA_URL" "$GATEKEEPER_URL"; do
  if curl -sf "${service}/health" > /dev/null 2>&1 || curl -sf "$service" > /dev/null 2>&1; then
    echo -e "  ${GREEN}✓${NC} $service"
  else
    echo -e "  ${RED}✗${NC} $service (unreachable)"
    SERVICES_OK=false
  fi
done

if [ "$SERVICES_OK" = false ]; then
  echo ""
  echo -e "${YELLOW}Warning: Some services are not responding. Tests may fail or be skipped.${NC}"
fi

cd "$PROJECT_DIR"

if [ -n "$1" ]; then
  if [ ! -f "tests/$1" ]; then
    echo -e "${RED}Error: Test file not found: $1${NC}"
    exit 1
  fi
  echo -e "${YELLOW}Running single test: $1${NC}"
  node "tests/$1"
  exit
fi

echo -e "${YELLOW}Running all integration tests...${NC}\n"

if [ -z "$(ls tests/*.test.js 2>/dev/null)" ]; then
  echo -e "${RED}No test files found in tests/${NC}"
  exit 1
fi

FAILED=0
for test in tests/*.test.js; do
  if [ -f "$test" ]; then
    echo -e "${BLUE}Running: $(basename "$test")${NC}"
    node "$test" || FAILED=$((FAILED + 1))
  fi
done

echo ""
if [ $FAILED -eq 0 ]; then
  echo -e "${GREEN}All tests passed!${NC}"
  exit 0
else
  echo -e "${RED}$FAILED test suite(s) failed${NC}"
  exit 1
fi
