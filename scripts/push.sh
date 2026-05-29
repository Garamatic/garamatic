#!/usr/bin/env bash
# ═══════════════════════════════════════════════════════════════════════════
# Garamatic Meta-Repo — Push with submodule support
# ═══════════════════════════════════════════════════════════════════════════
# Pushes the root repo and any referenced submodule commits.
#
# Usage: ./scripts/push.sh
# ═══════════════════════════════════════════════════════════════════════════

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"

cd "${ROOT_DIR}"

echo "⬆️  Pushing root repo and submodule commits..."
git push --recurse-submodules=on-demand

echo "✅ Push complete."
