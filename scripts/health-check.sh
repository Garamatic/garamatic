#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Health Check — Quick port + HTTP verification
# ═══════════════════════════════════════════════════════════════════════════

set -uo pipefail

GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

CHECKS=(
  "8085:Ticket Masala"
  "8086:Gatekeeper"
  "8087:Mailing Service"
  "8090:Garamatic Web"
  "8091:Masala Web"
  "8092:Showcase"
  "8093:Portal"
  "3001:Agentic Service"
  "15672:RabbitMQ Management"
  "8025:Mailhog UI"
  "5672:RabbitMQ AMQP"
  "1025:Mailhog SMTP"
)

PASS=0
FAIL=0

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Garamatic Stack Health Check"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

for check in "${CHECKS[@]}"; do
  PORT="${check%%:*}"
  NAME="${check#*:}"
  
  # TCP port check
  if timeout 2 bash -c "exec 3<>/dev/tcp/localhost/${PORT}" 2>/dev/null; then
    echo -e "  ${GREEN}✓${NC} ${NAME}  (port ${PORT})"
    ((PASS++))
  else
    echo -e "  ${RED}✗${NC} ${NAME}  (port ${PORT} — closed/unreachable)"
    ((FAIL++))
  fi
done

echo ""
echo "═══════════════════════════════════════════════════════════════════════"
echo -e "  ${GREEN}Pass: ${PASS}${NC}   ${RED}Fail: ${FAIL}${NC}"
echo "═══════════════════════════════════════════════════════════════════════"

if [ "$FAIL" -gt 0 ]; then
  echo ""
  echo "  Troubleshooting:"
  echo "    docker compose ps          # Check container status"
  echo "    docker compose logs        # Check for startup errors"
  echo "    make up                    # Restart the stack"
  exit 1
fi

echo ""
echo "  All services are reachable! 🎉"
