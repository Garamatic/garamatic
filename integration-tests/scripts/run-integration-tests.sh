#!/bin/bash
# Integration Test Runner Script (Docker environment)

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# Configuration
RESULTS_DIR="/test-results"
LOGS_DIR="/test-logs"
mkdir -p "$RESULTS_DIR" "$LOGS_DIR"

# Test results accumulator
TOTAL_PASSED=0
TOTAL_FAILED=0
TOTAL_SKIPPED=0
TOTAL_MISSING=0

echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Garamatic Integration Test Suite${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""

# Run a single test file, tee output to log, accumulate results
run_test() {
    local test_file=$1
    local test_name=$2
    local log_file="$LOGS_DIR/$(basename "$test_file" .js).log"

    echo -e "${YELLOW}▶ Running: $test_name${NC}"

    if [ ! -f "$test_file" ]; then
        echo -e "${YELLOW}⊘ $test_name missing (file not found)${NC}"
        ((TOTAL_MISSING++)) || true
        return 0
    fi

    node "$test_file" 2>&1 | tee "$log_file"
    local node_exit=${PIPESTATUS[0]}

    if [ "$node_exit" -eq 0 ]; then
        echo -e "${GREEN}✓ $test_name passed${NC}"
        ((TOTAL_PASSED++)) || true
    else
        echo -e "${RED}✗ $test_name failed${NC}"
        ((TOTAL_FAILED++)) || true
    fi
}

# Install integration-contracts dependencies
if [ -f "/integration-contracts/package.json" ]; then
    echo -e "${YELLOW}📦 Installing integration-contracts dependencies...${NC}"
    cd /integration-contracts && npm install 2>&1 | tail -5
    cd /runner
fi

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
# NOTE: RabbitMQ is omitted — its docker-compose healthcheck already guarantees
# readiness before any dependent service (mailing-service, gatekeeper-api, etc.)
# starts. The management API requires auth, so a simple curl check would fail.

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

# Run Contract Drift Detection
run_test "tests/contract-drift.test.js" "Contract Drift"

# Run Service Health Tests
run_test "tests/service-health.test.js" "Service Health"

# Run Cross-Service Integration Tests
run_test "tests/cross-service.test.js" "Cross-Service Integration"

# Run End-to-End Workflow Tests
run_test "tests/e2e-workflows.test.js" "End-to-End Workflows"

# Run RabbitMQ Connectivity Tests
run_test "tests/rabbitmq-connectivity.test.js" "RabbitMQ Connectivity"

# Run Webhook Receiver Tests
run_test "tests/webhook-receiver.test.js" "Webhook Receiver"

# Run Odoo Integration Tests
run_test "tests/odoo-integration.test.js" "Odoo Integration"

# Run Agentic Service Deep Tests
run_test "tests/agentic-service-deep.test.js" "Agentic Service Deep"

# Run Event Planner Deep Tests
run_test "tests/event-planner-deep.test.js" "Event Planner Deep"

# Run Event Handler Contract Tests
run_test "tests/event-handler-contract.test.js" "Event Handler Contract"

# Generate summary report
echo ""
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo -e "${BLUE}  Test Summary${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════════════════${NC}"
echo ""
echo -e "${GREEN}Passed:  $TOTAL_PASSED${NC}"
echo -e "${RED}Failed:  $TOTAL_FAILED${NC}"
echo -e "${YELLOW}Skipped: $TOTAL_SKIPPED${NC}"
echo -e "${RED}Missing: $TOTAL_MISSING${NC}"
echo ""

# Determine overall status
overall="passed"
if [ $TOTAL_FAILED -gt 0 ] || [ $TOTAL_MISSING -gt 0 ]; then
    overall="failed"
fi

# Generate JSON report
cat > "$RESULTS_DIR/test-results.json" <<EOF
{
  "timestamp": "$(date -u +"%Y-%m-%dT%H:%M:%SZ")",
  "overall": "$overall",
  "summary": {
    "passed": $TOTAL_PASSED,
    "failed": $TOTAL_FAILED,
    "skipped": $TOTAL_SKIPPED,
    "missing": $TOTAL_MISSING,
    "total": $((TOTAL_PASSED + TOTAL_FAILED + TOTAL_SKIPPED + TOTAL_MISSING))
  },
  "services": {
    "ticket_masala": "${TICKET_MASALA_URL:-http://ticket-masala:8080}",
    "gatekeeper": "${GATEKEEPER_URL:-http://gatekeeper-api:8080}",
    "mailing": "${MAILING_SERVICE_URL:-http://mailing-service:8080}",
    "event_planner": "${EVENT_PLANNER_URL:-http://event-planner:80}",
    "agentic": "${AGENTIC_SERVICE_URL:-http://agentic-service:3001}",
    "odoo_integration": "${ODOO_INTEGRATION_URL:-http://odoo-integration:8080}",
    "rabbitmq": "${RABBITMQ_URL:-http://rabbitmq:15672}",
    "mailhog": "${MAILHOG_URL:-http://mailhog:8025}"
  }
}
EOF

# Exit with failure count
exit $((TOTAL_FAILED + TOTAL_MISSING))
