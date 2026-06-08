# Design System

## Overview

A dark-mode developer dashboard for the Garamatic multi-tenant platform. Single-file HTML with comprehensive inline CSS design tokens. The design language is functional, dense, and unadorned — every element serves a monitoring, navigation, or documentation purpose.

## Color Palette

### Core
| Token | Value | Usage |
|---|---|---|
| `--bg` | `#0d1117` | Page background |
| `--bg-elevated` | `#111820` | Header background, elevated surfaces |
| `--surface` | `#161b22` | Card background |
| `--surface-hover` | `#1f242c` | Row hover, secondary surfaces |
| `--surface-raised` | `#252a33` | Active hover, elevated cards |
| `--border` | `#30363d` | Card borders, structural dividers |
| `--border-subtle` | `#21262d` | Inner borders, subtle separators |
| `--border-strong` | `#484f58` | Hover borders, emphasized edges |
| `--text` | `#c9d1d9` | Primary body text |
| `--text-secondary` | `#b0b8c4` | Secondary text, descriptions |
| `--text-muted` | `#8b949e` | Labels, captions, timestamps |
| `--text-faint` | `#758da0` | URLs, tertiary info |
| `--text-inverse` | `#ffffff` | Headings, active buttons |

### Semantic Accents
| Token | Value | Usage |
|---|---|---|
| `--accent` | `#58a6ff` | Links, active states, primary actions |
| `--accent-green` | `#3fb950` | Healthy, success, live indicators |
| `--accent-red` | `#f85149` | Unhealthy, error, down |
| `--accent-yellow` | `#d29922` | Warning, starting, unknown |
| `--accent-purple` | `#bc8cff` | SaaS tenant tag |
| `--accent-indigo` | `#6366f1` | Tech tenant tag, step highlights |
| `--accent-orange` | `#f97316` | Infra tenant tag |

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
- **Sans**: `-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif`
- **Mono**: `'SF Mono', ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, monospace`

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
| `--radius-xl` | 10px | Tenant cards |
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
| `--shadow-sm` | `0 1px 2px rgba(0,0,0,0.25)` | Subtle elevation |
| `--shadow-md` | `0 4px 8px rgba(0,0,0,0.30)` | Cards, dropdowns |

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
- Used only in the Project Metrics card on the Demo Guide view — not as a hero template in the topology view.

### Status Summary (Topology View)
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

- **Header**: sticky top, elevated bg with backdrop blur, z-index 100
- **Container**: max-width 1400px, centered, 24px padding
- **Grid**: `repeat(auto-fit, minmax(320px, 1fr))`, 20px gap
- **Full-width cards**: `span-full` class spans all columns
- **Responsive**: <720px collapses to single column, 16px padding
- **Flow diagrams**: horizontal scrollable on narrow viewports
- **Tables**: horizontal scroll wrapper with full-bleed negative margins

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

- Single-file HTML with all CSS inline in `<style>`.
- All colors and spacing use CSS custom properties (tokens) for consistency.
- No external dependencies. No JavaScript framework.
- Dark mode is the only mode. No light mode toggle.
- No print styles.
- All touch targets are ≥ 44px.
- No `!important` used (except in reduced-motion reset, which is standard practice).
