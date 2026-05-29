#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Integration Test Runner Script
# ═══════════════════════════════════════════════════════════════════════════

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
RESULTS_DIR="/test-results"
LOGS_DIR="/test-logs"
mkdir -p "$RESULTS_DIR" "$LOGS_DIR"

# Test results accumulator
TOTAL_PASSED=0
TOTAL_FAILED=0

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Integration Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Function to run a test file
run_test() {
    local test_file=$1
    local test_name=$2
    
    echo -e "${YELLOW}▶ Running: $test_name${NC}"
    
    if node "$test_file" 2>&1 | tee "$LOGS_DIR/$(basename $test_file .js).log"; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        ((TOTAL_PASSED++)) || true
        return 0
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        ((TOTAL_FAILED++)) || true
        return 1
    fi
}

# Wait for services to be ready
echo -e "${YELLOW}⏳ Waiting for services to be ready...${NC}"
sleep 10

# Health check all services
echo -e "${YELLOW}▶ Checking service health...${NC}"
SERVICES=(
    "${TICKET_MASALA_URL:-http://ticket-masala:8080}/health"
    "${GATEKEEPER_URL:-http://gatekeeper-api:8080}/health"
    "${MAILHOG_URL:-http://mailhog:8025}"
)

for service in "${SERVICES[@]}"; do
    max_attempts=30
    attempt=1
    until curl -sf "$service" > /dev/null 2>&1 || [ $attempt -gt $max_attempts ]; do
        echo "  Waiting for $service (attempt $attempt/$max_attempts)..."
        sleep 2
        ((attempt++)) || true
    done
    
    if [ $attempt -gt $max_attempts ]; then
        echo -e "${RED}✗ Service $service failed to start${NC}"
        exit 1
    fi
    echo -e "  ${GREEN}✓ $service ready${NC}"
done

echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Starting Test Execution${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Run Contract Compliance Tests
run_test "tests/contract-compliance.test.js" "Contract Compliance"

# Run Service Health Tests
run_test "tests/service-health.test.js" "Service Health"

# Run Cross-Service Integration Tests
run_test "tests/cross-service.test.js" "Cross-Service Integration"

# Run End-to-End Workflow Tests
run_test "tests/e2e-workflows.test.js" "End-to-End Workflows"

# Generate summary report
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed:  $TOTAL_PASSED${NC}"
echo -e "${RED}Failed:  $TOTAL_FAILED${NC}"
echo ""

# Generate JSON report
cat > "$RESULTS_DIR/test-results.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "summary": {
    "passed": $TOTAL_PASSED,
    "failed": $TOTAL_FAILED,
    "total": $((TOTAL_PASSED + TOTAL_FAILED))
  },
  "services": {
    "ticket_masala": "${TICKET_MASALA_URL:-http://ticket-masala:8080}",
    "gatekeeper": "${GATEKEEPER_URL:-http://gatekeeper-api:8080}",
    "mailing": "${MAILING_SERVICE_URL:-http://mailing-service:8080}",
    "event_planner": "${EVENT_PLANNER_URL:-http://event-planner:80}"
  }
}
EOF

# Exit with failure count
exit $TOTAL_FAILED
