# Product

## Register

product

## Users

- **Primary:** Teacher evaluating a school project (technical + design assessment)
- **Secondary:** Demo viewers learning how a client portal integrates with Ticket Masala
- **End-user (in-demo):** Belgian citizens submitting municipal requests (noise complaints, permits, general inquiries)

## Product Purpose

A showcase frontend portal demonstrating how a real-world client (Ville de Desgoffe — a Belgian municipality) would integrate with the Ticket Masala ticket-management backend. The portal must look like a believable, production-ready municipal service — not a toy demo or a generic template.

Success looks like: a teacher saying "this looks like something a real city could ship."

## Brand Personality

- **Trustworthy:** Citizens give personal data; the interface must feel secure and official.
- **Clear:** French-speaking public of varying digital literacy; no clever UI, no hidden flows.
- **Modern:** Contemporary Belgian public-sector design (think Brussels regional sites, not 2005-era .gov).
- **Warm:** Not cold bureaucracy. The color should feel approachable, not institutional-gray.

Three words: *trustworthy, clear, modern.*

## Anti-references

- **Generic Tailwind template look:** The current `glass-panel` + `glass-premium` + floating animation + all-caps tracking is a saturated AI-tell. Kill it.
- **Bootstrap government gray:** `#eee` backgrounds with `#333` text and blue links. Looks like a 2010 CMS default.
- **Dark-mode SaaS pretension:** Municipal services don't ship dark-mode-first. Light mode is correct here.
- **Over-animated:** No infinite float, no pulse, no shimmer. This is a form, not a landing page selling AI software.
- **Purple/blue gradients:** No AI-purple glows, no mesh gradients, no decorative blur blobs.

## Design Principles

1. **Form follows function.** Every visual choice must serve the citizen's task: "submit my request quickly and know what happens next."
2. **One accent, used deliberately.** The primary color carries the brand identity. Everything else is neutral.
3. **Typography is the hierarchy.** Weight and scale contrast, not colored boxes and borders, create the visual order.
4. **Mobile-first, but not mobile-only.** Many citizens will use this on a phone. The layout must work there first, then breathe on desktop.
5. **Show the full lifecycle.** A portal is more than a form. Citizens need to see: submitted → received → in progress → resolved. The demo must show this journey.

## Accessibility & Inclusion

- WCAG AA minimum (AAA where easy — this is a public-sector surface).
- French language, so form labels must be clear and unambiguous.
- `prefers-reduced-motion` respected — the current `animate-float` is actively hostile.
- Touch targets minimum 44×44px on mobile.
