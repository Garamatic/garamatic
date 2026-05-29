#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Status Dashboard
# ═══════════════════════════════════════════════════════════════════════════
# Shows a quick overview of all submodules: current commit, branch, and
# whether they are ahead/behind the remote.
#
# Usage: ./scripts/status.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "═══════════════════════════════════════════════════════════════════════"
echo "  Garamatic Ecosystem Status"
echo "═══════════════════════════════════════════════════════════════════════"
echo ""

FORMAT="%-24s %-10s %-14s %-10s %s\n"
printf "$FORMAT" "Submodule" "Branch" "Commit" "Status" "Message"

# ─── Root repo ───────────────────────────────────────────────────────────
ROOT_BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
ROOT_COMMIT=$(git rev-parse --short HEAD 2>/dev/null || echo "n/a")
printf "%-24s %-10s %-14s %-10s %s\n" \
    "📦 root (meta-repo)" \
    "$ROOT_BRANCH" \
    "$ROOT_COMMIT" \
    "" \
    ""

# ─── Submodules ──────────────────────────────────────────────────────────
git submodule foreach --quiet '
    BRANCH=$(git branch --show-current 2>/dev/null || echo "detached")
    COMMIT=$(git rev-parse --short HEAD)
    
    # Check divergence from remote
    git fetch origin --quiet 2>/dev/null || true
    AHEAD=$(git rev-list --count HEAD..@{upstream} 2>/dev/null || echo "0")
    BEHIND=$(git rev-list --count @{upstream}..HEAD 2>/dev/null || echo "0")
    
    if [ "$AHEAD" -gt 0 ] && [ "$BEHIND" -gt 0 ]; then
        STATUS="diverged"
    elif [ "$AHEAD" -gt 0 ]; then
        STATUS="behind ${AHEAD}"
    elif [ "$BEHIND" -gt 0 ]; then
        STATUS="ahead ${BEHIND}"
    else
        STATUS="sync"
    fi
    
    # Get last commit message
    MSG=$(git log -1 --pretty=%s 2>/dev/null || echo "")
    if [ ${#MSG} -gt 30 ]; then
        MSG="${MSG:0:27}..."
    fi
    
    printf "%-24s %-10s %-14s %-10s %s\n" \
        "   $name" "$BRANCH" "$COMMIT" "$STATUS" "$MSG"
'

echo ""
echo "Legend:"
echo "   sync      = up to date with remote"
echo "   behind N  = remote is N commits ahead (run 'make update')"
echo "   ahead N   = local is N commits ahead (needs push)"
echo "   diverged  = local and remote have diverged"
