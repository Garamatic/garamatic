# Product

## Users

- **Demo presenters**: Technical sales engineers or team leads showing the Garamatic platform to stakeholders. They need a clear, linear demo flow with quick access to every service.
- **Developers & ops**: Engineers running the stack locally who need to verify service health, find endpoints, and copy credentials without digging through docs.
- **Evaluators**: Prospects, teachers, or technical reviewers who land here to understand the architecture at a glance — often without ever running the stack. The overview hero and Architecture tab are written for them; the page must teach the system even with every live widget offline.

Their context: usually on a laptop, often in a meeting or demo setting, needing to move fast between services without losing their place.

## Product Purpose

The Architecture Dashboard & Demo Guide is the single source of truth for the Garamatic multi-tenant platform's local/demo environment. An always-visible **project overview hero** sits above the tabs and frames the project for any first-time reader (what Garamatic is, the core patterns, the team, the stack) — so the page makes sense even to an evaluator who never runs the stack. Below it is a three-tab SPA, and each tab answers one question instantly:

1. **Architecture** (default) — *What is it and how is it built?* Key patterns & decisions (with rationale), the GERDA AI engine, config-driven multi-tenancy with a live YAML excerpt, event-flow diagrams, live service topology with health polling, project metrics, and repositories.
2. **Demo** — *How do I demo it?* A 9-minute scripted walkthrough with direct links to each step, the live heartbeat pipeline, tenant context, disposable demo credentials, and a pre-demo checklist.
3. **Documentation** — *How do I access things?* Quick links, API endpoints, curl snippets, and troubleshooting.

The default tab is **Architecture** because the broadest audience (evaluators, teachers, new engineers) lands here to understand the system; presenters switch to Demo when running the walkthrough.

Success looks like: an evaluator understands the architecture without running anything, a presenter never loses flow during a demo, and a developer never has to open a README to find a port or password.

## Brand Personality

Clean, technical, confident. Three words: **precise, capable, uncluttered**.

The interface should feel like a well-maintained control panel — not a marketing page, not a toy. Every element earns its place. The visual tone says "we know what we're doing" without shouting. Think GitHub's dark mode, Vercel's dashboard, or Linear's UI: dark, information-dense, and quietly premium.

## Anti-references

- **SaaS landing page tropes**: gradient hero backgrounds, floating abstract illustrations, "supercharge your workflow" copy. This is a tool, not a pitch deck.
- **Over-styled dashboards**: glassmorphism, excessive borders, rounded everything, drop shadows on every card. Decoration that competes with information.
- **Terminal-native aesthetic**: green-on-black hacker chic. The stack is .NET/HTMX, not Rust/CLI — the UI should feel like a modern web app, not a retro terminal.
- **Cream/sand/warm-neutral backgrounds**: the default AI palette for 2026. This is a dark-mode developer tool; warmth reads as uncommitted.

## Design Principles

1. **Information density is a feature, not a bug.** Developers and presenters want to see everything at once. Avoid excessive whitespace that forces scrolling for basic facts.
2. **The topology is the hero.** The live service health panel is the most important surface. It should be readable from 2 meters away during a demo.
3. **Zero friction between reading and doing.** Every link, credential, and curl snippet should be one click or copy away. No intermediate steps.
4. **Dark mode is the only mode.** This runs in demo environments, on projectors, and in terminal-adjacent contexts. Light mode is not a priority.
5. **Consistency with the platform.** The dashboard should feel like it belongs to the same family as the Garamatic Web and Portal UIs, not a one-off design.

## Accessibility & Inclusion

- WCAG 2.1 AA compliance for contrast and focus states.
- Service status indicators (green/red/yellow) must be distinguishable by shape or label, not color alone.
- Reduced motion support: disable the live-badge pulse and any entrance animations when `prefers-reduced-motion: reduce` is active.
- All interactive elements must have visible focus indicators.
