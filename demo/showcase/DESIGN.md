# Design System

## Overview

A dark-mode developer dashboard for the Garamatic multi-tenant platform. An always-visible **project overview hero** sits above a three-tab SPA (Architecture / Demo / Documentation), framing the project for first-time readers regardless of the active tab. Single-file HTML with comprehensive inline CSS design tokens. The design language is functional, dense, and unadorned — every element serves an explanatory, monitoring, navigation, or documentation purpose.

## Color Palette

The palette is the Slate/indigo "Ticket Masala" dark theme — it intentionally matches the Garamatic Web and Portal UIs, not GitHub's `#0d1117` family.

### Core
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0F172A` | Page background (slate-900) |
| `--bg-elevated` | `#1E293B` | Header background, elevated surfaces |
| `--surface` | `#1E293B` | Card background (slate-800) |
| `--surface-hover` | `#334155` | Row hover, secondary surfaces (slate-700) |
| `--surface-raised` | `#334155` | Active hover, elevated cards |
| `--border` | `#334155` | Card borders, structural dividers |
| `--border-subtle` | `#1E293B` | Inner borders, subtle separators |
| `--border-strong` | `#475569` | Hover borders, emphasized edges (slate-600) |
| `--text` | `#F1F5F9` | Primary body text (slate-100) |
| `--text-secondary` | `#CBD5E1` | Secondary text, descriptions (slate-300) |
| `--text-muted` | `#94A3B8` | Labels, captions, timestamps (slate-400) |
| `--text-faint` | `#64748B` | URLs, tertiary info (slate-500) |
| `--text-inverse` | `#FFFFFF` | Headings, active buttons |

### Semantic Accents
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#6366F1` | Links, active states, primary actions (indigo-500) |
| `--accent-light` | `#818CF8` | Active button hover (indigo-400) |
| `--accent-green` | `#10B981` | Healthy, success, live indicators (emerald-500) |
| `--accent-red` | `#EF4444` | Unhealthy, error, down |
| `--accent-yellow` | `#F59E0B` | Warning, starting, unknown (amber-500) |
| `--accent-purple` | `#A855F7` | Purple tag tint |
| `--accent-indigo` | `#6366F1` | Step highlights, remote badge |
| `--accent-orange` | `#F97316` | Orange tag tint |

> Note: `--accent` and `--accent-indigo` are the same indigo (`#6366F1`) — links and step highlights share one hue.

### Alpha Tints (Background badges)
- `--accent-a10`, `--accent-a15`, `--accent-a20` — Blue tints
- `--green-a10`, `--green-a15`, `--green-a20` — Green tints
- `--red-a10`, `--red-a15`, `--red-a20` — Red tints
- `--yellow-a10`, `--yellow-a15`, `--yellow-a20` — Yellow tints
- `--purple-a15` — Purple tint
- `--indigo-a15`, `--indigo-a25` — Indigo tints
- `--orange-a15` — Orange tint

## Typography

### Families
- **Heading** (`--font-heading`): `'Saira', system-ui, -apple-system, sans-serif` — page title, card titles, tenant/step titles
- **Sans** (`--font-sans`): `'Inter', system-ui, -apple-system, sans-serif` — body, descriptions
- **Mono** (`--font-mono`): `'JetBrains Mono', ui-monospace, 'SF Mono', 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace`

Inter and Saira are loaded from Google Fonts (`fonts.googleapis.com`) with `preconnect`. JetBrains Mono is named first in the stack but not loaded — it falls through to the platform monospace.

### Scale
| Token | Size | Usage |
|---|---|---|
| `--text-xs` | 11px | Labels, badges, status, timestamps |
| `--text-sm` | 12px | Body, cards, descriptions, curl blocks |
| `--text-base` | 13px | Service names, links, step titles |
| `--text-md` | 14px | Card headings, tenant names |
| `--text-lg` | 16px | Page title |
| `--text-xl` | 20px | — |
| `--text-2xl` | 24px | Metric values |
| `--text-3xl` | 28px | — |

### Weights
- `--weight-medium` (500) — UI elements, labels
- `--weight-semibold` (600) — Headings, section labels
- `--weight-bold` (700) — Metric values, step numbers

### Line Heights
- `--leading-none` (1) — Single-line elements, badges
- `--leading-tight` (1.25) — Headings, metric values
- `--leading-snug` (1.35) — Compact text
- `--leading-normal` (1.5) — Body text
- `--leading-relaxed` (1.65) — Descriptions, prose

## Spacing

4pt base scale:

| Token | Value |
|---|---|
| `--space-1` | 4px |
| `--space-2` | 8px |
| `--space-3` | 12px |
| `--space-4` | 16px |
| `--space-5` | 20px |
| `--space-6` | 24px |
| `--space-8` | 32px |
| `--space-10` | 40px |
| `--space-12` | 48px |
| `--space-16` | 64px |

## Radius

| Token | Value | Usage |
|---|---|---|
| `--radius-sm` | 4px | Tags, method badges, copy buttons |
| `--radius-md` | 6px | Buttons, tabs, endpoints, flow nodes |
| `--radius-lg` | 8px | Cards, blocks, steps, service rows |
| `--radius-xl` | 8px | Tenant cards, link buttons |
| `--radius-2xl` | 12px | Main cards |
| `--radius-full` | 9999px | Dots, badges, pills |

## Motion

| Token | Value | Usage |
|---|---|---|
| `--duration-fast` | 120ms | Micro-interactions |
| `--duration-base` | 200ms | Hover, border changes |
| `--duration-slow` | 300ms | Larger transitions |
| `--ease-out` | `cubic-bezier(0.16, 1, 0.3, 1)` | All transitions |

## Shadows

| Token | Value | Usage |
|---|---|---|
| `--shadow-sm` | `0 1px 2px 0 rgb(0 0 0 / 0.30)` | Subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgb(0 0 0 / 0.30), 0 2px 4px -2px rgb(0 0 0 / 0.30)` | Card/metric/tenant hover |

Plus accent "glow" tokens used for emphasis: `--accent-glow`, `--accent-glow-strong` (indigo text-shadow on metric values and step numbers) and `--green-glow` / `--red-glow` / `--yellow-glow` (status-dot halos).

## Components

### Card
- Background: `var(--surface)`
- Border: `1px solid var(--border)`
- Border-radius: `var(--radius-2xl)` (12px)
- Padding: `var(--space-5)` (20px)
- Hover: border-color shifts to `var(--border-strong)`
- No shadow. No gradient.

### Service Row
- Flex row, space-between, min-height 44px
- Background: `var(--surface-hover)`
- Border-radius: `var(--radius-lg)` (8px)
- Hover: background shifts to `var(--surface-raised)`
- Status dot: 8px circle, color-coded (with aria-label for accessibility)
- Status badge: small pill with semantic background tint

### Button / Tab
- Padding: `var(--space-2) var(--space-3)` (8px 12px)
- Border-radius: `var(--radius-lg)` (8px)
- Border: 1px solid `var(--border)`
- Active tab: filled with accent-a10, accent text
- Default btn: surface-hover bg, hover to surface-raised
- Active btn: filled with accent, white text
- All have focus-visible ring

### Endpoint Block
- Background: `var(--surface-hover)`
- Border-radius: `var(--radius-md)` (6px)
- Border: 1px solid `var(--border-subtle)`
- HTTP method badge: tiny colored pill (4px radius)
- Monospace path, sans-serif description

### Curl Block
- Background: `var(--bg)`
- Border: 1px solid `var(--border)`
- Border-radius: `var(--radius-lg)` (8px)
- Copy button: positioned absolute top-right, 28px min-height

### Metric
- Centered, background: `var(--surface-hover)`
- Border-radius: `var(--radius-lg)` (8px)
- Large value (24px, bold, accent, tabular-nums) + small label
- Used only in the Project Metrics card on the Architecture tab — not as a hero template.

### Status Summary (Architecture tab)
- A single compact row showing overall service health
- Green dot + "All N services up" when healthy
- Red dot + "All services down" when none up
- Yellow dot + "X of Y services up (Z%)" when partial
- Replaces the hero-metric template (big-number cards) with a utilitarian text summary

### Step / Timeline Item
- Flex row with numbered circle (28px, indigo bg)
- Background: `var(--surface-hover)`
- Border: 1px solid `var(--border)`
- Hover: border-color shifts to accent-indigo
- Keyboard accessible (tabindex, Enter/Space handlers)
- Action links inside use indigo tint

### Badge
- Inline-block, pill shape (full radius)
- Semantic colors: success (green), warn (yellow), info (blue), danger (red)

## Layout

- **Header**: sticky top, `--bg-elevated` background, z-index 100 (no backdrop blur)
- **Container**: max-width 1400px, centered, 24px padding
- **Grid**: `repeat(auto-fit, minmax(320px, 1fr))`, 20px gap
- **Full-width cards**: `span-full` class spans all columns
- **Responsive**: <720px collapses to single column, 16px padding
- **Flow diagrams**: horizontal scrollable on narrow viewports
- **Tables**: horizontal scroll wrapper with full-bleed negative margins

## Navigation — Tabs

An always-visible **overview hero** (`.overview`) renders above the grid on every tab — a two-column panel (lead prose + meta sidebar) with an accent left-border, collapsing to a single column under 720px. Below it, the dashboard is a single-page app with **three tabs**, selected from the header:

| Tab | Audience | Cards |
|---|---|---|
| **Architecture** (default) | Evaluators/teachers understanding how it's built | Key Patterns & Decisions, GERDA AI, Multi-Tenancy by Config, Event Flow, Project Metrics, Repositories, Live Service Topology, Health Summary |
| **Demo** | Presenters running the live walkthrough | Heartbeat pipeline, Demo Flow steps, Tenant, Demo Credentials, Pre-Demo Checklist |
| **Documentation** | Developers needing reference | Quick Links, API Explorer, Curl Quickies, Troubleshooting |

The default tab is **Architecture** — the broadest audience lands to understand the system, not to operate it.

All cards live in **one shared `#card-grid`**. The active tab is stored as `data-active-tab` on the grid; each card carries `data-tab="demo|architecture|docs"`, and CSS hides cards whose tab isn't active. `switchView()` just updates the grid attribute and the button states — no DOM reordering, no per-view containers. This keeps the grid reflow clean and avoids a flash of unstyled content on load (the default tab is set in markup).

### Two health surfaces, deliberately separate
- **Demo tab → Heartbeat Pipeline**: server-authoritative. Each service publishes to the RabbitMQ `heartbeat` fanout exchange; the monitor (`scripts/heartbeat-monitor.py`) reports liveness with `age_seconds`. Polled every 1s from `heartbeat.garamatic.tech`. Proves the **event bus**.
- **Architecture tab → Live Service Topology**: client-side. The browser probes each service URL (no-cors fetch, then image fallback) every 5s. Proves **browser reachability**. These measure different layers and are intentionally not merged.

## Accessibility

- **Focus-visible**: 2px accent outline, 2px offset on all interactive elements
- **Reduced motion**: `prefers-reduced-motion: reduce` disables all animations and transitions
- **Live badge**: `aria-label` on the pulse container, pulse dot animation disabled under reduced motion
- **Service rows**: `role="list"` / `role="listitem"`, status dots have `aria-label` with service name + status
- **Steps**: `role="button"`, `tabindex="0"`, `keydown` handlers for Enter/Space
- **Copy buttons**: `aria-label` updates to "Copied to clipboard" on success
- **Tab buttons**: `aria-pressed` reflects active state
- **Color is not the only indicator**: Status text ("up"/"down"/"checking") always visible alongside colored dots

## Notes

- Single-file HTML with all CSS inline in `<style>` and all JS inline at the bottom.
- All colors and spacing use CSS custom properties (tokens) for consistency.
- One external dependency: Google Fonts (Inter + Saira). No JavaScript framework, no build step.
- Dark mode is the only mode. No light mode toggle.
- No print styles.
- All touch targets are ≥ 44px.
- No `!important` used (except in reduced-motion reset, which is standard practice).
