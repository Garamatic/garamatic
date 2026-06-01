---
name: Ticket Masala
description: Malleable workflow automation and dispatch platform
colors:
  primary: "#6366F1"
  primary-light: "#818CF8"
  primary-dark: "#4F46E5"
  accent: "#F97316"
  secondary: "#64748B"
  success: "#10B981"
  warning: "#F59E0B"
  danger: "#EF4444"
  info: "#3B82F6"
  surface-card: "#FFFFFF"
  surface-page: "#F8FAFC"
  surface-subtle: "#F1F5F9"
  text-heading: "#0F172A"
  text-body: "#475569"
  text-muted: "#94A3B8"
  border-default: "#E2E8F0"
typography:
  display:
    fontFamily: "Rajdhani, system-ui, sans-serif"
    fontSize: "clamp(1.75rem, 4vw, 3rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "-0.02em"
  heading:
    fontFamily: "Rajdhani, system-ui, sans-serif"
    fontSize: "clamp(1.25rem, 2.5vw, 2.25rem)"
    fontWeight: 600
    lineHeight: 1.2
    letterSpacing: "-0.01em"
  title:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1.125rem"
    fontWeight: 600
    lineHeight: 1.3
  body:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.5
  label:
    fontFamily: "Inter, system-ui, -apple-system, sans-serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "6px"
  md: "8px"
  lg: "12px"
  xl: "16px"
  full: "9999px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
  xl: "32px"
  xxl: "48px"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-dark}"
    textColor: "#FFFFFF"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  button-outline:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
    borderColor: "{colors.primary}"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{text-body}"
    rounded: "{rounded.md}"
    padding: "10px 20px"
  card:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.lg}"
    padding: "{spacing.xl}"
  input:
    backgroundColor: "{colors.surface-card}"
    textColor: "{colors.text-heading}"
    rounded: "{rounded.md}"
    padding: "10px 14px"
    borderColor: "{colors.border-default}"
---

# Design System: Ticket Masala

## 1. Overview

**Creative North Star: "The Masala Kitchen"**

A workspace that feels like a well-organized kitchen — warm but precise, colorful but structured. Every tool has its place, every spice is labeled, and the cook moves with confidence because the mise en place is done. The interface should feel approachable without being casual, serious without being cold. Personality lives in the details — microcopy, transitions, and thoughtful spacing — while the structure follows proven SaaS patterns.

This system explicitly rejects the corporate SaaS cliché (generic blue navbars, cookie-cutter dashboards, Bootstrap defaults) and the AI hype aesthetic (purple gradients, brain illustrations, chatbot-first UIs). GERDA is a tool on the bench, not a personality.

**Key Characteristics:**
- Clean hierarchy with generous whitespace, not information density
- One accent color (Signal Indigo) used sparingly — its rarity is the point
- Personality in copy and details, restraint in layout and color
- Tonal layering over shadows for surface distinction

## 2. Colors

The palette is restrained: tinted neutrals with a single indigo anchor. Color carries meaning, not decoration.

### Primary
- **Signal Indigo** (#6366F1): The operational accent. Used for primary actions, links, active navigation indicators, and the GERDA AI badge. Applied to ≤15% of any given screen.

### Secondary
- **Steel** (#64748B): Secondary actions, muted buttons, de-emphasized UI. Never used for primary calls to action.

### Accent
- **Ember** (#F97316): High-priority signals, warnings with human attention needed, dispatching badges. Used more sparingly than Signal Indigo.

### Status
- **Mint** (#10B981): Success states, completed workflows, validation confirmations.
- **Honey** (#F59E0B): Pending states, attention-required indicators, medium-priority signals.
- **Rose** (#EF4444): Error states, failures, critical priority badges, destructive actions.
- **Sky** (#3B82F6): In-progress indicators, info cues, assigned states.

### Neutral
- **White** (#FFFFFF): Card surfaces, modals, elevated containers.
- **Cloud** (#F8FAFC): Page backgrounds, the canvas everything sits on.
- **Mist** (#F1F5F9): Subtle backgrounds, table header rows, skeleton loading.
- **Ink** (#0F172A): Headings and primary text. Maximum contrast against all surfaces.
- **Stone** (#475569): Body text, labels, secondary information. 6.2:1 against Cloud, 8.3:1 against White.
- **Cement** (#94A3B8): Placeholder text, disabled labels, muted metadata. Meets 4.5:1 against White for WCAG AA compliance on placeholders.
- **Frost** (#E2E8F0): Default borders, dividers, table row separators.

### Named Rules
**The Rarity Rule.** Signal Indigo covers ≤15% of any screen. The accent is expensive; spending it everywhere devalues it. If a screen looks "indigo-heavy", too many elements are competing for the same signal.

## 3. Typography

**Display Font:** Rajdhani
**Body Font:** Inter (with system-ui fallback)
**Mono Font:** JetBrains Mono (for code, ticket IDs, technical data)

**Character:** A practical pairing. Rajdhani brings a condensed, technical presence to headings — assertive without wasting space. Inter is relentlessly readable at body sizes, with generous x-height and clear letterforms. Together they say: serious tool, no fuss.

### Hierarchy
- **Display** (700, clamp(1.75rem, 4vw, 3rem), 1.1): Dashboard titles, page headers, landing hero text. `text-wrap: balance` to avoid ragged orphans.
- **Headline** (600, clamp(1.25rem, 2.5vw, 2.25rem), 1.2): Section headings, modal titles, feature card titles.
- **Title** (600, 1.125rem, 1.3): Card titles, sidebar headings, list item titles.
- **Body** (400, 1rem, 1.5): Paragraphs, descriptions, table cells. Max line length 70ch.
- **Label** (500, 0.875rem, 1.4): Form labels, button text, badge text, table headers. May be uppercase with 0.5px letter-spacing in navigation and table heads.
- **Small** (400, 0.75rem, 1.4): Metadata, timestamps, status indicators, helper text.

## 4. Elevation

The system uses tonal layering, not shadows, to distinguish surfaces. A white card on a Cloud (#F8FAFC) page background provides enough separation without a drop shadow. Shadows appear only as an interactive response: hover states on buttons and cards get a subtle lift (translateY(-2px) + shadow-sm). Flat is the resting state.

### Shadow Vocabulary
- **shadow-xs** (`0 1px 2px 0 rgb(0 0 0 / 0.05)`): The faintest separation — used only when tonal layering isn't enough.
- **shadow-sm** (`0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)`): Card hover states, elevated interactions.
- **shadow-md** (`0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)`): Dropdowns, popovers, floating action elements.
- **shadow-lg** (`0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)`): Modals, toasts, high-priority floating content.

### Named Rules
**The Layering Rule.** Never put a shadow on an element that already has a background color distinct from its container. Tonal shifts and shadows are alternatives, not complements. A white card on Cloud needs no shadow; a card on White needs shadow-sm.

## 5. Components

### Buttons
- **Shape:** Gently rounded corners (8px radius). No pill shapes except for badges.
- **Primary:** Signal Indigo (#6366F1) background, white text, 10px 20px padding. Hover shifts to Primary Dark (#4F46E5) with a 1px translateY lift. Focus ring uses 3px rgba(99, 102, 241, 0.4) outline.
- **Outline:** Transparent background, Signal Indigo border and text. Hover fills with Signal Indigo.
- **Ghost:** Transparent with Stone (#475569) text. Hover shows a subtle Mist (#F1F5F9) background.
- **Disabled:** Opacity 0.6, cursor not-allowed. No hover effects.

### Cards
- **Corner Style:** Moderately rounded (12px radius).
- **Background:** White (#FFFFFF).
- **Shadow Strategy:** Flat at rest on Cloud surfaces. shadow-sm on hover with translateY(-2px).
- **Border:** 1px solid Frost (#E2E8F0) for definition.
- **Internal Padding:** 24px (spacing-lg). On mobile: 16px.

### Inputs / Fields
- **Style:** 1px solid Frost (#E2E8F0) stroke, White background, 8px radius. 10px 14px inner padding.
- **Focus:** Stroke shifts to Signal Indigo with a 3px rgba(99, 102, 241, 0.1) glow ring.
- **Placeholder:** Cement (#94A3B8) at 4.5:1 contrast against White.
- **Error / Disabled:** Error shifts to Rose stroke + background tint. Disabled reduces opacity with a Mist background fill.

### Navigation (Sidebar)
- **Style:** Fixed sidebar, 260px width. White background, right border in Frost.
- **Typography:** Inter at 0.875rem, 500 weight, Stone color.
- **Active state:** Signal Indigo text with a 3px Signal Indigo left border strip and rgba(99, 102, 241, 0.05) background tint.
- **Hover state:** Cloud (#F8FAFC) background, text shifts toward Ink.
- **Mobile:** Off-canvas with overlay backdrop.

### Badges / Status Pills
- **Shape:** Pill (9999px radius). 4px 12px padding.
- **Typography:** 0.75rem, 500 weight, uppercase with 0.5px letter-spacing.
- **Colors follow status roles:** Mint for completed, Honey for pending, Rose for failed, Sky for in-progress.
- **GERDA AI Badge:** Signal Indigo to Purple gradient background with glow shadow — the one exception to the no-gradient rule, reserved exclusively for AI-related indicators.

### Skeleton Loading
- **Style:** Gradient shimmer on Mist background. 1.5s infinite sweep at 200% width.
- **Shapes:** Text lines at 1rem height full-width, titles at 2rem height 60% width, cards at 200px height.

## 6. Do's and Don'ts

### Do:
- **Do** use tonal layering for hierarchy: white card on Cloud page, elevated on Mist. Let background color do the work.
- **Do** use Signal Indigo sparingly — one primary action per view, one active nav item per section.
- **Do** keep body text at Stone (#475569) or darker. Never use Cement (#94A3B8) for readable content.
- **Do** use the Masala Kitchen voice in microcopy: specific, warm, mildly unexpected. Labels like "Invoerbron (Naam)" and "Payload (Bericht)" are on-brand.
- **Do** use skeleton loading for all async content. Every empty state before data arrives should show a skeleton.
- **Do** support dark mode as a first-class experience via `[data-theme="dark"]`.

### Don't:
- **Don't** use gradient backgrounds for decorative purposes. The only allowed gradient is the GERDA AI badge.
- **Don't** apply box-shadow to an element that already has a tonal background layer. Pick one.
- **Don't** use Pill shapes (9999px radius) on cards, buttons, or containers. Pill is reserved for badges and tags only.
- **Don't** use `border-left` greater than 1px as a colored stripe accent on cards, list items, or callouts. Use full borders, background tints, or nothing.
- **Don't** use gradient text (`background-clip: text`). Emphasis is weight or size, never a color sweep.
- **Don't** ship a generic SaaS cliché: no blue navbars, no stock photography, no Bootstrap default look.
- **Don't** ship AI hype aesthetic: no purple brain illustrations, no chatbot-first UIs, no "Powered by AI" badges on every feature. GERDA gets one badge.
- **Don't** use all-caps for body text. Uppercase is for labels (≤4 words), section headers, and badges only.
