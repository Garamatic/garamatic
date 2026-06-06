---
name: Guichet Citoyen — Ville de Desgoffe
description: Municipal citizen portal with a warm, tactile letterpress aesthetic — old-world craftsmanship meets digital clarity.
colors:
  canvas: "#FDF5E6"
  surface: "#FFFAF0"
  surface-hover: "#FFF8E7"
  primary: "#5D3A5D"
  primary-hover: "#4a2e4a"
  secondary: "#9A2A2A"
  accent: "#D4A574"
  accent-hover: "#C49360"
  accent-subtle: "#F5E6D3"
  border: "#D4C4A8"
  border-focus: "#5D3A5D"
  text-primary: "#3d3d3d"
  text-secondary: "#5a5a5a"
  text-muted: "#8a8a8a"
  error: "#9A2A2A"
  error-bg: "#FDF0F0"
  success: "#2D5A3D"
  success-bg: "#F0F5F0"
  warning: "#B8860B"
  warning-bg: "#FFFAEB"
typography:
  display:
    fontFamily: "'Roboto Slab', Georgia, serif"
    fontSize: "clamp(2.5rem, 5vw, 4rem)"
    fontWeight: 700
    lineHeight: 1.1
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  headline:
    fontFamily: "'Roboto Slab', Georgia, serif"
    fontSize: "1.5rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  title:
    fontFamily: "'Roboto Slab', Georgia, serif"
    fontSize: "1.2rem"
    fontWeight: 600
    lineHeight: 1.3
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  body:
    fontFamily: "Georgia, 'Times New Roman', serif"
    fontSize: "1rem"
    fontWeight: 400
    lineHeight: 1.6
    letterSpacing: "normal"
  label:
    fontFamily: "'Roboto Slab', Georgia, serif"
    fontSize: "0.875rem"
    fontWeight: 500
    lineHeight: 1.4
    letterSpacing: "0.05em"
    textTransform: "uppercase"
  mono:
    fontFamily: "'Courier Prime', 'Courier New', monospace"
    fontSize: "0.875rem"
    fontWeight: 400
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  sm: "4px"
  md: "8px"
  lg: "8px"
  full: "9999px"
spacing:
  xs: "0.25rem"
  sm: "0.5rem"
  md: "0.75rem"
  lg: "1rem"
  xl: "1.5rem"
  2xl: "2rem"
  3xl: "2.5rem"
  4xl: "3rem"
components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
    typography: "{typography.label}"
  button-primary-hover:
    backgroundColor: "{colors.primary-hover}"
    textColor: "#FFFFFF"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  button-secondary:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  button-ghost:
    backgroundColor: "transparent"
    textColor: "{colors.primary}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1.5rem"
  card:
    backgroundColor: "{colors.surface}"
    rounded: "{rounded.md}"
    padding: "1.5rem 2rem"
  input:
    backgroundColor: "{colors.surface}"
    textColor: "{colors.text-primary}"
    rounded: "{rounded.sm}"
    padding: "0.75rem 1rem"
  label:
    textColor: "{colors.text-primary}"
    typography: "{typography.label}"
---

# Design System: Guichet Citoyen

## 1. Overview

**Creative North Star: "The Town Hall Letterpress"**

This design system embodies the warmth of hand-set type and warm paper. The interface should feel like a well-printed municipal notice: authoritative, tactile, and human. Old-world craftsmanship meets digital clarity. The aesthetic is neither coldly institutional nor playfully casual. It is the digital equivalent of a town hall desk where every form, stamp, and letter carries the weight of the municipality's identity.

The system rejects the generic SaaS dashboard look and the rigid 1990s government website equally. It is distinctive to Desgoffe: warm, structured, and unmistakably municipal.

**Key Characteristics:**
- Warm paper-toned backgrounds with ink-dark text
- Uppercase, letter-spaced headings in a slab-serif display font
- Subtle purple-tinted shadows that echo the primary stamp-pad color
- Tactile hover states: elements press and lift like physical objects
- No decorative illustrations, no glassmorphism, no gradient text
- Every interactive element feels like a physical object: a stamp to press, a form to fill, a letter to file

## 2. Colors

The palette is built around the materials of a municipal office: paper, ink, stamps, and wax.

### Primary
- **Stamp Pad** (#5D3A5D): The faded purple that carries the official identity. Used for headers, primary buttons, navigation bar, and focus states. It is the municipality's signature color.
- **Stamp Pad Deep** (#4a2e4a): Hover and active state for primary elements. Darker, denser, like ink that has pressed deeper into the paper.

### Secondary
- **Cancellation Red** (#9A2A2A): The stamp red used for errors, urgent badges, and the demo mode banner. Evokes the urgency of an official cancellation stamp.

### Accent
- **Filing Tab** (#D4A574): Warm gold used for subtle highlights, hover backgrounds, and secondary accents. The color of a well-worn folder tab.
- **Filing Tab Deep** (#C49360): Hover state for accent elements.
- **Filing Tab Subtle** (#F5E6D3): Tinted background for accent-related sections, like ghost highlighting on paper.

### Neutral
- **Form Paper** (#FDF5E6): The warm cream body background. Not gray, not white — the color of a clean sheet of municipal stationery.
- **Clean Sheet** (#FFFAF0): Card and panel backgrounds. Slightly lighter than the canvas, creating a subtle tonal lift.
- **Warm Sheet** (#FFF8E7): Hover state for surface elements.
- **Ink** (#3d3d3d): Primary text — near-black with warmth. All body copy and headings.
- **Faded Ink** (#5a5a5a): Secondary text, labels, hints. Like ink that has slightly dried.
- **Ghost Ink** (#8a8a8a): Placeholders, disabled states, meta text. Barely visible, like a faint watermark.
- **Ruled Line** (#D4C4A8): Borders, dividers, input strokes. The color of a faint pencil ruling on a form.

### Functional
- **Approved** (#2D5A3D): Success states, confirmation. A deep green ink.
- **Approved Stamp** (#F0F5F0): Success message backgrounds.
- **Pending** (#B8860B): Warnings, caution. A mustard-yellow ink.
- **Pending Stamp** (#FFFAEB): Warning message backgrounds.

### Named Rules
**The One Stamp Rule.** The primary Stamp Pad color is used on the header, primary buttons, and focus states. Its presence should feel like a municipal seal — deliberate, not scattered. Never use it for decorative borders or large surface fills.

## 3. Typography

**Display & Heading Font:** Roboto Slab (with Georgia fallback)
**Body Font:** Georgia (with Times New Roman fallback)
**Mono Font:** Courier Prime (with Courier New fallback)

**Character:** The pairing is warm and official. Roboto Slab carries the authority of a municipal heading with its geometric slab serifs, while Georgia provides the familiar readability of body copy. Courier Prime adds the typewriter authenticity of official correspondence. The three fonts serve distinct roles and never compete.

### Hierarchy
- **Display** (700, clamp(2.5rem, 5vw, 4rem), line-height 1.1, uppercase, letter-spacing 0.05em): Hero headings only — "Guichet Citoyen", "Mes Demandes". The slab-serif weight makes it feel carved.
- **Headline** (600, 1.5rem, line-height 1.3, uppercase, letter-spacing 0.05em): Page titles, section headings. "Nouvelle Demande", "Connexion".
- **Title** (600, 1.2rem, line-height 1.3, uppercase, letter-spacing 0.05em): Form section titles, card headers. "Informations du Citoyen", "Détails de la Demande".
- **Body** (400, 1rem, line-height 1.6): All body copy, descriptions, form helper text. Max line length: 65ch.
- **Label** (500, 0.875rem, line-height 1.4, uppercase, letter-spacing 0.05em): Input labels, button text, badge text. Always uppercase with breathing room.
- **Mono** (400, 0.875rem, line-height 1.5): Ticket IDs, timestamps, technical metadata. The typewriter voice of official correspondence.

### Named Rules
**The Uppercase Label Rule.** All labels, buttons, and section titles are uppercase with letter-spacing 0.05em. This is the municipal voice: formal, measured, never shouting. Body copy remains sentence case — the contrast between the two is the point.

**The One Serif Rule.** The system uses three fonts, but each has a locked role. Never use Georgia for headings or Roboto Slab for body copy. The roles are: slab-serif for authority, serif for readability, mono for metadata.

## 4. Elevation

The system uses **Paper & Layering**: surfaces are sheets of paper. Depth is conveyed by border color shifts and slight shadow, never by dramatic lift. The system is flat by default, layered when needed.

Shadows are the memory of a stamp pressed into paper. They are always tinted with the primary purple (rgba(93, 58, 93, …)) so they feel warm and part of the palette, never cold gray.

### Shadow Vocabulary
- **Ambient Low** (`0 1px 2px rgba(93, 58, 93, 0.05)`): Inputs, subtle elevation. Barely perceptible — a faint impression.
- **Ambient Medium** (`0 4px 12px rgba(93, 58, 93, 0.1)`): Cards, panels, buttons on hover. The card lifts slightly off the desk.
- **Ambient High** (`0 10px 20px rgba(93, 58, 93, 0.12)`): Modals, dropdowns, toast notifications. The heaviest impression, still warm.

### Named Rules
**The Flat-By-Default Rule.** Surfaces are flat at rest. Shadows appear only as a response to state (hover, elevation, focus). A card without hover should sit flat on the canvas; the border is its primary edge.

## 5. Components

### Buttons
- **Shape:** Slightly rounded corners (4px radius), like a die-cut stamp or a clean paper edge.
- **Primary:** Stamp Pad background (#5D3A5D), white text, uppercase label typography, padding 0.75rem 1.5rem. Hover: Stamp Pad Deep background, translateY(-1px), Ambient Medium shadow with a deeper purple tint (rgba(93, 58, 93, 0.3)). Active: translateY(0) — the stamp presses back down.
- **Secondary:** Clean Sheet background, Ruled Line border, Ink text. Hover: Warm Sheet background, Faded Ink border.
- **Ghost:** Transparent background, Stamp Pad text. Hover: Filing Tab Subtle background.
- **Full-width on mobile**, auto-width on desktop. Always inline-flex with centered gap.

### Cards / Containers
- **Corner Style:** 8px radius — a gentle rounding, not a pill.
- **Background:** Clean Sheet (#FFFAF0).
- **Border:** 1px solid Ruled Line (#D4C4A8).
- **Shadow Strategy:** Ambient Medium at rest. On hover (with `.card-lift`): translateY(-2px), Ambient Medium deepened (rgba(93, 58, 93, 0.15)).
- **Internal Padding:** 1.5rem to 2rem (space-xl to 2xl).
- **No nested cards.** Cards are standalone sheets of paper.

### Inputs / Fields
- **Style:** Clean Sheet background, 1px Ruled Line border, 4px radius, padding 0.75rem 1rem. Georgia font family.
- **Focus:** Border color shifts to Stamp Pad (#5D3A5D), with a 3px shadow ring (rgba(93, 58, 93, 0.1)). Like a stamp pressing into the field.
- **Error:** Border color shifts to Cancellation Red (#9A2A2A), with a 3px shadow ring in Error Background (#FDF0F0).
- **Placeholder:** Ghost Ink (#8a8a8a). Must meet 4.5:1 contrast against Clean Sheet.
- **Label:** Above the input, Ink color, Label typography (uppercase, Roboto Slab, 0.05em letter-spacing), margin-bottom 0.5rem.
- **Helper text:** Below the input, Faded Ink, italic, 0.875rem.

### Navigation / Header
- **Style:** Sticky top bar, Stamp Pad background (#5D3A5D), border-bottom in Stamp Pad Deep (#4a2e4a), Ambient Medium shadow.
- **Logo:** City logo (desgoffe.png) in a small rounded container with white/30 border.
- **Nav items:** Uppercase, white/80 default, white on hover with white/10 background. Active state: white text on white/90 background, rounded-md.
- **Mobile:** Hamburger menu → full-screen overlay with vertical nav list. Logo + title hidden on mobile.
- **Demo banner:** Cancellation Red background, white text, centered, small — a thin strip above the header.

### Footer
- **Style:** Stamp Pad background, white text, border-top in Stamp Pad Deep.
- **Grid:** 3 columns on desktop (Brand, Contact, Links), stacked on mobile.
- **Section titles:** Label typography (uppercase, Roboto Slab, white), tracking-wider.
- **Contact items:** flex row with icon + text, white/80.
- **Bottom bar:** border-top white/20, bold uppercase tracking-widest text, centered.

### Status Badges
- **Shape:** Pill (rounded-full), padding 0.25rem 0.75rem (sm) or 0.5rem 0.75rem (md), font-weight 500, 0.75rem or 0.875rem.
- **Submitted:** Gray-100 background, gray-700 text, Dot icon.
- **Received:** Blue-50 background, blue-700 text, Tray icon.
- **In Progress:** Amber-50 background, amber-700 text, Clock icon.
- **Resolved:** Green-50 background, green-700 text, CheckCircle icon.
- **Rejected:** Red-50 background, red-700 text, XCircle icon.
- **Note:** Status badges currently use Tailwind utility color classes (gray-100, blue-50, etc.) rather than the custom palette tokens. This is a known inconsistency — the badge colors should eventually map to the neutral scale (Ghost Ink, Faded Ink, etc.) or a dedicated status ramp.

### Toast / Notifications
- **Position:** Fixed bottom-right, z-50, max-width 24rem, flex column with gap.
- **Shape:** Rounded-lg, border, shadow-lg, toast-enter animation (slideInRight 0.3s ease-out).
- **Success:** Approved Stamp background, Approved/30 border, CheckCircle icon.
- **Error:** Error Background, Error/30 border, Warning icon.
- **Info:** Clean Sheet background, Ruled Line border, Stamp Pad icon.
- **Close button:** X icon, hover bg-black/5, text-muted hover text-primary.

### Loading / Skeleton
- **Skeleton bars:** Rounded, bg-border, with shimmer animation (1.5s ease-in-out infinite, linear-gradient sweep).
- **Card skeletons:** Card wrapper with multiple border-colored bars inside.
- **Reduced motion:** All animations respect `prefers-reduced-motion: reduce` — instant transitions.

### Empty States
- **Shape:** Card container (Clean Sheet, Ruled Line border, Ambient Medium shadow), centered content.
- **Content:** Icon (Phosphor, 48px, muted), short message in Faded Ink, CTA button (Primary or Ghost).
- **Example:** "Vous n'avez pas encore de demandes." + "Faire une demande" button.

## 6. Do's and Don'ts

### Do:
- **Do** use the full uppercase + letter-spacing heading style for all section titles, buttons, and labels. The municipal voice is consistent.
- **Do** use the purple-tinted shadow family (rgba(93, 58, 93, …)) for all elevation. The shadow color is part of the identity.
- **Do** keep body copy in sentence case with Georgia. The contrast between uppercase labels and sentence body is the typographic rhythm.
- **Do** use the stamp-pad focus ring (3px rgba(93, 58, 93, 0.1)) for all focusable elements. It should feel like an ink press.
- **Do** respect `prefers-reduced-motion: reduce` for all animations. The municipal office does not move unless it must.
- **Do** keep cards as standalone sheets — no nested cards, no card-within-card patterns.
- **Do** use the mono font for ticket IDs, timestamps, and any technical metadata. It is the typewriter voice of official correspondence.

### Don't:
- **Don't** use border-left or border-right greater than 1px as a colored accent on cards, lists, or callouts. The side-stripe is a SaaS cliché. Use full borders or background tints instead.
- **Don't** use gradient text (`background-clip: text`). Decorative, never meaningful. Use a single solid color.
- **Don't** use glassmorphism (blur, transparency, frosted effects). The system is paper and ink, not glass.
- **Don't** use the hero-metric template (big number + small label + gradient accent). This is a municipal portal, not a SaaS dashboard.
- **Don't** use identical card grids (icon + heading + text, repeated endlessly). Vary the layout and density.
- **Don't** use tiny uppercase tracked eyebrows above every section. One deliberate section marker is voice; an eyebrow on every section is AI grammar.
- **Don't** use numbered section markers (01 / 02 / 03) as default scaffolding. Numbers earn their place only when the section is actually a sequence.
- **Don't** use border-radius greater than 16px on cards or sections. The system is gently rounded (4px–8px), not pill-shaped. Pill radius is reserved for tags and badges only.
- **Don't** use hand-drawn or sketchy SVG illustrations. If you cannot render a scene with real assets, ship no illustration.
- **Don't** use `repeating-linear-gradient(...)` stripe backgrounds. Pure decoration, never part of this system.
- **Don't** use marketing buzzwords. The system speaks in specific verbs and nouns: "Soumettre une demande", "Consulter le statut", not "Streamline your workflow" or "Empower citizens".
- **Don't** pair `border: 1px solid` with `box-shadow` blur ≥ 16px on the same element. Pick one: a single solid border at the brand color, or a defined shadow at no more than 8px blur. Never both as decoration.
- **Don't** use all-caps for body copy. Uppercase is reserved for labels, buttons, and short section titles (≤ 4 words).
- **Don't** use cream/sand/beige as a default "warm" background without intention. Form Paper (#FDF5E6) is chosen deliberately as the color of municipal stationery, not as a generic warm tint.
