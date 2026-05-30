#!/bin/bash
# ═══════════════════════════════════════════════════════════════════════════
# Seed Event Planner via Contact API
# ═══════════════════════════════════════════════════════════════════════════

set -e

BASE_URL="${EVENT_PLANNER_URL:-http://event-planner:80}"
API_ENDPOINT="${BASE_URL}/api/contact"

contacts=(
  '{"firstname":"Marie","lastname":"Dubois","email":"marie@festival.brussels","message":"Interested in hosting a summer music festival in the Grand Place. Need permits and logistics support.","event_type":"music_festival"}'
  '{"firstname":"Jan","lastname":"Jansen","email":"jan@corporate-events.nl","message":"Looking for a venue for our annual corporate retreat in September. Approximately 200 attendees.","event_type":"corporate_retreat"}'
  '{"firstname":"Sophie","lastname":"Martin","email":"sophie@charity.org","message":"Organizing a charity gala dinner for 500 guests. Need catering and audio-visual setup.","event_type":"charity_gala"}'
  '{"firstname":"Pieter","lastname":"Peeters","email":"pieter@tech-conference.be","message":"Hosting a 2-day tech conference on AI and sustainability. Need venue for 300 people.","event_type":"tech_conference"}'
  '{"firstname":"Claire","lastname":"Valmont","email":"claire@art-exhibition.fr","message":"Planning a contemporary art exhibition for October. Need gallery space and security.","event_type":"art_exhibition"}'
  '{"firstname":"Hans","lastname":"Mueller","email":"hans@wedding-planner.de","message":"Destination wedding for 80 guests next spring. Need venue, catering, and accommodation recommendations.","event_type":"wedding"}'
  '{"firstname":"Elena","lastname":"Rossi","email":"elena@food-festival.it","message":"Street food festival proposal for the city center. 40 vendors, expected 10,000 visitors.","event_type":"food_festival"}'
  '{"firstname":"Thomas","lastname":"Smith","email":"thomas@sports-events.uk","message":"Marathon event planning for 5,000 runners. Need route approval and medical support.","event_type":"sports_event"}'
  '{"firstname":"Yuki","lastname":"Tanaka","email":"yuki@cultural-exchange.jp","message":"Cultural exchange event between Brussels and Tokyo. Traditional performances and workshops.","event_type":"cultural_exchange"}'
  '{"firstname":"Ana","lastname":"Silva","email":"ana@film-festival.pt","message":"Independent film festival submission. Need screening venues and Q&A spaces.","event_type":"film_festival"}'
  '{"firstname":"Robert","lastname":"Johnson","email":"robert@community-events.us","message":"Neighborhood block party for 500 residents. Need street closure permits and portable facilities.","event_type":"community_event"}'
  '{"firstname":"Fatima","lastname":"Al-Rashid","email":"fatima@literary-salon.ae","message":"Literary salon series - monthly book discussions. Need intimate venue for 50 people.","event_type":"literary_salon"}'
)

passed=0
failed=0

for contact in "${contacts[@]}"; do
  if curl -sf -X POST -H "Content-Type: application/json" -d "$contact" "$API_ENDPOINT" > /dev/null 2>&1; then
    echo "  ✓ Contact submitted"
    ((passed++)) || true
  else
    echo "  ✗ Contact failed"
    ((failed++)) || true
  fi
done

echo ""
echo "  Passed: ${passed}"
echo "  Failed: ${failed}"
