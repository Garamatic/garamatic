#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Pull with submodule recovery
# ═══════════════════════════════════════════════════════════════════════════
# Pulls the root repo and updates submodules. If a submodule's recorded commit
# is missing from the remote, it automatically checks out the latest remote
# branch instead of failing.
#
# Usage: ./scripts/pull.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "⬇️  Pulling root repo..."
git pull --no-recurse-submodules --autostash

echo "⬇️  Syncing submodules..."

# Read submodule paths from git status
submodules=$(git submodule status | awk '{print $2}')

for path in ${submodules}; do
    echo "   📦 ${path}"

    # Initialize if missing
    if [ ! -f "${path}/.git" ] && [ ! -d "${path}/.git" ]; then
        if ! git submodule update --init "${path}" 2>/dev/null; then
            echo "   ⚠️  ${path}: could not initialize, skipping"
            continue
        fi
    fi

    cd "${path}"

    # Fetch latest
    git fetch origin --quiet 2>/dev/null || true

    # Determine branch
    branch=$(git config -f "${ROOT_DIR}/.gitmodules" "submodule.${path}.branch" 2>/dev/null || echo "")
    if [ -z "${branch}" ]; then
        branch=$(git rev-parse --abbrev-ref origin/HEAD 2>/dev/null | sed 's|^origin/||' || echo "main")
    fi

    # Check if remote branch exists
    if ! git rev-parse --verify "origin/${branch}" >/dev/null 2>&1; then
        echo "   ⚠️  ${path}: origin/${branch} not found, skipping"
        cd "${ROOT_DIR}"
        continue
    fi

    # Check if current HEAD is an ancestor of origin/branch
    if ! git merge-base --is-ancestor HEAD "origin/${branch}" 2>/dev/null; then
        echo "   ⚠️  ${path}: current commit not on origin/${branch}, resetting to latest"
        if ! git diff --quiet 2>/dev/null; then
            echo "   ⚠️  ${path}: dirty, stashing before checkout"
            git stash push -m "make pull auto-stash" 2>/dev/null || true
        fi
        git checkout -B "${branch}" "origin/${branch}" 2>/dev/null || true
    fi

    cd "${ROOT_DIR}"
done

echo ""
echo "✅ Pull complete."
