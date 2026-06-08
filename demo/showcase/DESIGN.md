# Design System

## Overview

A dark-mode developer dashboard. Single-file HTML with inline CSS. The design language is functional, dense, and unadorned — every element serves a monitoring, navigation, or documentation purpose.

## Color Palette

### Core
- **Background**: `#0d1117` — deep near-black
- **Surface**: `#161b22` — card/section background
- **Surface hover**: `#1f242c` — elevated hover state
- **Border**: `#30363d` — structural dividers
- **Text**: `#c9d1d9` — primary body text
- **Text muted**: `#8b949e` — secondary, labels, captions

### Accents (semantic, not decorative)
- **Accent blue**: `#58a6ff` — links, active states, primary actions
- **Green**: `#3fb950` — healthy, success, live indicators
- **Red**: `#f85149` — unhealthy, error, down
- **Yellow**: `#d29922` — warning, starting, unknown
- **Purple**: `#bc8cff` — SaaS tenant tag
- **Indigo**: `#6366f1` — tech tenant tag, step highlights
- **Orange**: `#f97316` — infra tenant tag

### Usage Notes
- All colors are flat hex values. No gradients, no opacity-based backgrounds except for subtle status badges (`rgba(..., 0.1)` and `rgba(..., 0.15)`).
- The palette is intentionally close to GitHub's dark mode for familiarity.

## Typography

- **Family**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif` — system stack
- **Mono**: `'SF Mono', Monaco, monospace` — code, endpoints, curl blocks
- **Scale**: 11px (labels, badges), 12px (body, cards, descriptions), 13px (service names, links), 14px (card headings, tenant names), 20px (page title), 24px (metric values)
- **Weight**: 500 (medium) for UI elements, 600 (semibold) for headings, 700 (bold) for metric values
- **Uppercase usage**: Section subheadings (`text-transform: uppercase`, `letter-spacing: 0.5px`) and tenant tags. Restrained — not on every section.

## Spacing

- **Page padding**: 24px container, 20px–32px header
- **Card padding**: 20px
- **Card gap**: 20px
- **Internal gaps**: 6px–12px for lists, 8px–16px for card internals
- **Border radius**: 4px (small tags), 6px (buttons, tabs, endpoints), 8px (cards, blocks, steps), 10px (tenant cards), 12px (main cards), 50% (dots)

## Components

### Card
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Border-radius: 12px
- Padding: 20px
- No shadow. No gradient overlay.

### Service Row
- Flex row, space-between
- Background: `var(--surface-hover)`
- Border-radius: 8px
- Hover: background shifts to `var(--border)`
- Status dot: 8px circle, color-coded
- Status badge: small pill with semantic background tint

### Button / Tab
- Padding: 6px 14px (button), 6px 12px (tab)
- Border-radius: 8px (button), 6px (tab)
- Border: 1px solid `var(--border)`
- Active state: filled with accent color, white text

### Endpoint Block
- Background: `var(--surface-hover)`
- Border-radius: 6px
- HTTP method badge: tiny colored pill
- Monospace path

### Curl Block
- Background: `#0d1117` (same as page bg)
- Border: 1px solid `var(--border)`
- Border-radius: 8px
- Copy button: positioned absolute top-right

### Metric
- Centered, background: `var(--surface-hover)`
- Border-radius: 8px
- Large value (24px, bold, accent color) + small label

### Step / Timeline Item
- Flex row with numbered circle
- Background: `var(--surface-hover)`
- Border: 1px solid `var(--border)`
- Hover: border-color shifts to indigo
- Clickable: opens service in new tab

## Layout

- **Header**: fixed top, flex, space-between, border-bottom
- **Container**: max-width 1400px, centered
- **Grid**: `repeat(auto-fit, minmax(320px, 1fr))`, 20px gap
- **Full-width cards**: `grid-column: 1 / -1` for demo flow and topology
- **Two-column grids**: tenant cards, links, repos (inside cards)
- **Tab switcher**: two views (Demo Guide / Topology) toggled via JS

## Motion & Interaction

- **Transitions**: `all 0.2s` on hover for cards, buttons, service rows
- **Live badge pulse**: `animation: pulse 2s infinite` on the green dot
- **Reduced motion**: not yet implemented — should disable pulse and instant-transition hovers

## Notes & Gaps

- No external CSS file; all styles are inline in `<style>`.
- No design tokens extracted to CSS variables beyond the root `:root` block.
- No responsive breakpoints beyond the auto-fit grid.
- No dark/light toggle; dark is the only mode.
- No print styles.
