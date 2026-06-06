# Design

## Overview

A municipal citizen portal (Guichet Citoyen) for the fictional Belgian city of Desgoffe. Light-mode, warm-neutral base with a single deliberate indigo accent. Modern European public-sector design — clean, trustworthy, and function-first.

## Theme

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-canvas` | `#F6F5F2` | Page background — warm stone, not gray |
| `--bg-surface` | `#FFFFFF` | Cards, panels, form sections |
| `--bg-surface-hover` | `#FDFCFA` | Hover state for surface elements |
| `--border` | `#E8E6E1` | Structural dividers, input borders |
| `--border-focus` | `#4F46E5` | Focus rings, active states |
| `--text-primary` | `#1C1917` | Headings, body copy — near-black warm |
| `--text-secondary` | `#57534E` | Labels, hints, secondary info — warm gray |
| `--text-muted` | `#A8A29E` | Placeholders, disabled states |
| `--accent` | `#4F46E5` | Primary actions, links, active indicators — indigo |
| `--accent-hover` | `#4338CA` | Button hover, link hover |
| `--accent-subtle` | `#EEF2FF` | Tinted backgrounds for accent-related sections |
| `--error` | `#DC2626` | Validation errors, required asterisks |
| `--error-bg` | `#FEF2F2` | Error message backgrounds |
| `--success` | `#16A34A` | Success states, confirmation |
| `--success-bg` | `#F0FDF4` | Success message backgrounds |
| `--warning` | `#D97706` | Warnings, caution |

### Typography

| Role | Font | Weight | Size | Line-height |
|------|------|--------|------|-------------|
| Display | `Inter` | 700 | `clamp(2rem, 5vw, 3rem)` | 1.1 |
| Heading | `Inter` | 600 | `1.5rem` | 1.3 |
| Subheading | `Inter` | 500 | `1.125rem` | 1.4 |
| Body | `Inter` | 400 | `1rem` | 1.6 |
| Small | `Inter` | 400 | `0.875rem` | 1.5 |
| Label | `Inter` | 500 | `0.875rem` | 1.4 |
| Mono | `JetBrains Mono` | 400 | `0.875rem` | 1.5 |

- **One font family.** Inter carries everything. No decorative heading font — the hierarchy is built through weight and scale, not font switching.
- **Letter-spacing:** `tracking-tight` (-0.025em) on display only. Body is default.
- **Max body width:** 65ch for readability.

### Spacing

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | `0.25rem` | Tight gaps |
| `--space-2` | `0.5rem` | Related element gaps |
| `--space-3` | `0.75rem` | Input padding, icon gaps |
| `--space-4` | `1rem` | Default padding |
| `--space-6` | `1.5rem` | Section gaps |
| `--space-8` | `2rem` | Card padding |
| `--space-10` | `2.5rem` | Major section gaps |
| `--space-12` | `3rem` | Page section spacing |

### Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | `6px` | Inputs, small buttons |
| `--radius-md` | `10px` | Cards, panels |
| `--radius-lg` | `16px` | Large sections, modals |
| `--radius-full` | `9999px` | Pills, tags, avatars |

### Shadows

| Token | Value | Usage |
|-------|-------|-------|
| `--shadow-sm` | `0 1px 2px rgba(28, 25, 23, 0.05)` | Inputs, subtle elevation |
| `--shadow-md` | `0 4px 6px -1px rgba(28, 25, 23, 0.08), 0 2px 4px -2px rgba(28, 25, 23, 0.04)` | Cards, panels |
| `--shadow-lg` | `0 10px 15px -3px rgba(28, 25, 23, 0.08), 0 4px 6px -4px rgba(28, 25, 23, 0.04)` | Modals, dropdowns |

## Layout

### Container

- Max-width: `720px` for form pages (focused, readable).
- Max-width: `1200px` for dashboard pages (data-rich).
- Padding: `px-4` mobile, `px-6` tablet, `px-8` desktop.

### Page Structure

```
[Header]
  Logo + City name + Portal title

[Navigation]
  Submit | My Requests | Help
  (Minimal — 3 items max, mobile: hamburger)

[Main Content]
  Context-dependent:
  - Form page: Single column, grouped sections
  - Dashboard: Stats cards + list + detail panel
  - Success: Centered confirmation + next steps

[Footer]
  Contact info + Legal links
```

### Grid

- Form pages: Single column, max-width constrained.
- Dashboard: CSS Grid, `grid-cols-1 md:grid-cols-3` for stats, `grid-cols-1 lg:grid-cols-3` for main layout (sidebar + content).

## Components

### Header

- Height: `64px`.
- Background: `transparent` over canvas, or `bg-surface` with `shadow-sm` when scrolled.
- Content: Logo (left) + Portal title (center, hidden on mobile) + Nav (right).
- Mobile: Logo + hamburger. Nav becomes a full-screen overlay.

### Navigation

- Horizontal on desktop, vertical overlay on mobile.
- Active state: `text-accent` + `border-bottom: 2px solid var(--accent)`.
- Hover: `text-accent-hover`.
- Items: "Nouvelle Demande", "Mes Demandes", "Aide".

### Cards

- Background: `bg-surface`.
- Border: `1px solid var(--border)`.
- Border-radius: `var(--radius-md)`.
- Shadow: `var(--shadow-md)`.
- Padding: `var(--space-6)` to `var(--space-8)`.
- **No glassmorphism.** No blur, no transparency, no frosted effect.

### Form Inputs

- Background: `bg-surface`.
- Border: `1px solid var(--border)`.
- Border-radius: `var(--radius-sm)`.
- Padding: `var(--space-3)` `var(--space-4)`.
- Focus: `border-color: var(--border-focus)` + `box-shadow: 0 0 0 3px var(--accent-subtle)`.
- Error: `border-color: var(--error)` + `box-shadow: 0 0 0 3px var(--error-bg)`.
- Placeholder: `var(--text-muted)`.
- Label: Above input, `var(--text-primary)`, `font-weight: 500`, `margin-bottom: var(--space-2)`.
- Helper text: Below input, `var(--text-secondary)`, `font-size: 0.875rem`.

### Buttons

- **Primary:** `bg-accent` + `text-white` + `var(--radius-sm)` + `font-weight: 500` + `padding: var(--space-3) var(--space-6)`.
  - Hover: `bg-accent-hover` + `translateY(-1px)` + `shadow-md`.
  - Active: `translateY(0)`.
- **Secondary:** `bg-surface` + `border: 1px solid var(--border)` + `text-primary`.
  - Hover: `bg-surface-hover` + `border-color: var(--text-secondary)`.
- **Ghost:** `bg-transparent` + `text-accent`.
  - Hover: `bg-accent-subtle`.
- **Full-width on mobile**, auto-width on desktop.

### Status Badges

| Status | Background | Text | Icon |
|--------|------------|------|------|
| Submitted | `bg-gray-100` | `text-gray-700` | Dot |
| Received | `bg-blue-50` | `text-blue-700` | Inbox |
| In Progress | `bg-amber-50` | `text-amber-700` | Clock |
| Resolved | `bg-green-50` | `text-green-700` | Check |
| Rejected | `bg-red-50` | `text-red-700` | X |

- Border-radius: `var(--radius-full)`.
- Padding: `var(--space-1) var(--space-3)`.
- Font-size: `0.75rem`.
- Font-weight: `500`.

### Select (Dropdown)

- Same styling as inputs.
- Custom chevron icon (not browser default) using a background SVG or pseudo-element.
- **No custom select dropdown library** unless multi-select is needed. Native `<select>` is more accessible.

### File Upload

- Drag-and-drop zone: dashed border `var(--border)`, dashed border turns `var(--accent)` on drag.
- Icon + label centered.
- Selected file: list with name + size + remove button.
- Accepted types: PDF only (for Desgoffe).

### Loading States

- **Form submission:** Inline button spinner (replace text with spinning icon) + disabled state. No full-screen overlay.
- **Page load:** Skeleton screens matching the final layout shape.
- **Data fetching:** Inline spinner in the content area, or skeleton list.

### Empty States

- Icon (from Phosphor or Lucide) + short message + CTA.
- Example: "Vous n'avez pas encore de demandes." + "Faire une demande" button.
- Background: `bg-surface` + subtle border.

## Pages

### 1. Submit Form (`/submit`)

- **Layout:** Single column, max-width 720px, centered.
- **Header:** "Nouvelle Demande" + breadcrumb or back link.
- **Sections:**
  1. Citizen info (name, email, phone)
  2. Request details (type, quartier, priority, description)
  3. Attachments (PDF upload)
  4. Declaration checkbox + submit
- **Validation:** Real-time inline validation. Error messages below each field. No `alert()`.
- **Success:** Redirect to `/success` with ticket ID.

### 2. Success Confirmation (`/success/:ticketId`)

- **Layout:** Centered, max-width 480px.
- **Content:**
  - Success icon (large, green).
  - "Demande enregistrée" heading.
  - Ticket ID (mono, copyable).
  - Estimated processing time (static or from API).
  - CTA: "Voir mes demandes" or "Faire une autre demande".
- **No confetti, no excessive animation.** A simple checkmark + calm confirmation.

### 3. Dashboard — My Requests (`/requests`)

- **Layout:** Two-column on desktop (sidebar 25% + main 75%), stacked on mobile.
- **Stats row (top):**
  - Total requests, pending, resolved, average resolution time.
  - 4 cards in a row, `grid-cols-2 md:grid-cols-4`.
- **Request list:**
  - Table on desktop (`lg:`), card list on mobile.
  - Columns: ID, Type, Date, Status, Priority, Actions.
  - Sortable by date, filterable by status.
  - Click row → detail panel (slide-in on mobile, sidebar on desktop).
- **Detail panel:**
  - Full request info.
  - Status timeline (visual stepper).
  - Comments/updates from city staff.
  - Attachment download link.

### 4. Landing Page (`/`)

- **Layout:** Hero section + service cards + how it works + footer.
- **Hero:**
  - City logo + "Guichet Citoyen" heading.
  - Short value prop: "Soumettez vos demandes municipales en ligne."
  - Primary CTA: "Faire une demande".
  - Secondary CTA: "Suivre mes demandes".
- **Service cards:** 3 cards showing request types (Noise, Permit, General) with icons.
- **How it works:** 3-step visual (Submit → Process → Result).
- **Footer:** Contact info, legal links, city branding.

## Responsive

### Mobile (< 768px)

- Single column everywhere.
- Form inputs: full-width, touch-friendly.
- Dashboard: card list instead of table, detail panel as bottom sheet or full-screen.
- Navigation: hamburger → full-screen overlay.
- Stats: 2×2 grid.

### Tablet (768px – 1024px)

- Form: same as desktop but narrower padding.
- Dashboard: sidebar collapses to top tabs or icon-only.

### Desktop (> 1024px)

- Full layout as described.
- Dashboard: persistent sidebar for detail view.
- Form: comfortable reading width, not stretched.

## Animation & Motion

- **Motion intensity:** Low (2-3/10). This is a public-sector form.
- **Allowed:**
  - Subtle hover transitions on buttons (`0.15s ease`).
  - Fade-in on page load (0.3s, ease-out).
  - Skeleton loading shimmer (subtle, not distracting).
  - Slide-in for detail panel (0.2s ease-out).
- **Forbidden:**
  - Infinite loops (float, pulse, spin).
  - Parallax.
  - Page-transition animations that delay interaction.
  - `prefers-reduced-motion` must disable all non-essential motion.

## Assets

- **Logo:** Use existing `desgoffe.png` (city logo). If needed, generate a cleaner SVG version.
- **Icons:** `@phosphor-icons/react` (clean, modern, consistent stroke weight).
- **No decorative illustrations.** No hand-drawn SVGs, no gradient blobs. The design is clean geometry and typography.
- **Favicon:** Existing favicon set.
