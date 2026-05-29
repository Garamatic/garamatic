#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Bump Submodules
# ═══════════════════════════════════════════════════════════════════════════
# Updates all submodules to the latest remote commit and commits the root repo.
# This creates a reproducible snapshot of the entire ecosystem.
#
# Usage:
#   ./scripts/bump.sh              # Bump all submodules
#   ./scripts/bump.sh <name>       # Bump a specific submodule
#   ./scripts/bump.sh --dry-run    # Preview changes without committing
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

TARGET="${1:-all}"
DRY_RUN=false

if [ "$TARGET" = "--dry-run" ]; then
    DRY_RUN=true
    TARGET="all"
fi

cd "${ROOT_DIR}"

# ─── Update submodules ───────────────────────────────────────────────────
echo "⬆️  Updating submodules..."

if [ "$TARGET" = "all" ]; then
    if [ "$DRY_RUN" = true ]; then
        echo "   (dry-run mode — preview only)"
        git submodule foreach '
            echo "   📦 $name:"
            echo "      current: $(git rev-parse --short HEAD)"
            git fetch origin --quiet
            echo "      latest:  $(git rev-parse --short origin/$(git branch --show-current))"
        '
    else
        git submodule update --remote
        echo "   ✅ All submodules updated"
    fi
else
    if [ ! -d "$TARGET" ]; then
        echo "❌ Submodule not found: $TARGET"
        echo ""
        echo "Available submodules:"
        git submodule status | awk '{print "  " $2}'
        exit 1
    fi
    
    if [ "$DRY_RUN" = true ]; then
        echo "   (dry-run mode — preview only)"
        cd "$TARGET"
        echo "   📦 $TARGET:"
        echo "      current: $(git rev-parse --short HEAD)"
        git fetch origin --quiet
        echo "      latest:  $(git rev-parse --short origin/$(git branch --show-current))"
        cd "${ROOT_DIR}"
    else
        git submodule update --remote "$TARGET"
        echo "   ✅ $TARGET updated"
    fi
fi

# ─── Commit changes ──────────────────────────────────────────────────────
if [ "$DRY_RUN" = true ]; then
    echo ""
    echo "🚫 Dry run complete. No changes committed."
    exit 0
fi

if [ -n "$(git status --porcelain)" ]; then
    echo ""
    echo "📝 Committing submodule updates..."
    
    if [ "$TARGET" = "all" ]; then
        git add -A
        git commit -m "bump: update all submodules to latest

$(git submodule status | awk '{print "- " $2 ": " $1}')"
    else
        git add "$TARGET"
        git commit -m "bump: update $TARGET to latest

$(git submodule status | grep "$TARGET" | awk '{print "- " $2 ": " $1}')"
    fi
    
    echo ""
    echo "✅ Committed. Push with:"
    echo "   git push origin $(git branch --show-current)"
else
    echo ""
    echo "✅ All submodules are already up to date."
fi
