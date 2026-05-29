#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Local Integration Test Runner
# ═══════════════════════════════════════════════════════════════════════════
#
# Runs integration tests against locally running services
# Usage: ./scripts/test-local.sh [test-file]
#
# Environment variables:
#   TICKET_MASALA_URL   - Ticket Masala API URL (default: http://localhost:8085)
#   GATEKEEPER_URL      - Gatekeeper API URL (default: http://localhost:8086)
#   MAILHOG_URL         - Mailhog URL (default: http://localhost:8025)
# ═══════════════════════════════════════════════════════════════════════════

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Default URLs
export TICKET_MASALA_URL="${TICKET_MASALA_URL:-http://localhost:8085}"
export GATEKEEPER_URL="${GATEKEEPER_URL:-http://localhost:8086}"
export MAILING_SERVICE_URL="${MAILING_SERVICE_URL:-http://localhost:8087}"
export EVENT_PLANNER_URL="${EVENT_PLANNER_URL:-http://localhost:8088}"
export MAILHOG_URL="${MAILHOG_URL:-http://localhost:8025}"
export TEST_RECEIVER_URL="${TEST_RECEIVER_URL:-http://localhost:8089}"

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Integration Tests (Local)${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo "Service URLs:"
echo "  Ticket Masala: $TICKET_MASALA_URL"
echo "  Gatekeeper:    $GATEKEEPER_URL"
echo "  Mailhog:       $MAILHOG_URL"
echo ""

# Check if services are running
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
  echo -e "${YELLOW}Warning: Some services are not responding.${NC}"
  echo "Tests may fail or be skipped. Make sure services are running:"
  echo "  cd ticket-masala && docker compose up"
  echo ""
fi

# Determine which tests to run
if [ -n "$1" ]; then
  TEST_FILE="$1"
  if [ ! -f "$PROJECT_DIR/tests/$TEST_FILE" ]; then
    echo -e "${RED}Error: Test file not found: $TEST_FILE${NC}"
    exit 1
  fi
  echo -e "${YELLOW}Running single test: $TEST_FILE${NC}"
  node "$PROJECT_DIR/tests/$TEST_FILE"
else
  echo -e "${YELLOW}Running all integration tests...${NC}"
  echo ""
  
  cd "$PROJECT_DIR"
  
  # Run tests in sequence
  FAILED=0
  
  for test in tests/*.test.js; do
    if [ -f "$test" ]; then
      echo -e "${BLUE}Running: $(basename $test)${NC}"
      if node "$test"; then
        echo ""
      else
        FAILED=$((FAILED + 1))
      fi
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
fi
