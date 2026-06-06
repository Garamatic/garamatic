# Guichet Citoyen — Ville de Desgoffe

Portail de demandes municipales démontrant l'intégration avec Ticket Masala.

## Stack

- **Vite** — Build tooling
- **React 19** — UI framework
- **TypeScript** — Type safety
- **Tailwind CSS v4** — Styling
- **React Router** — Navigation
- **Phosphor Icons** — Icons

## Pages

| Route | Page | Description |
|-------|------|-------------|
| `/` | Landing | Accueil avec services et processus |
| `/submit` | Submit | Formulaire de nouvelle demande |
| `/success/:id` | Success | Confirmation avec numéro de ticket |
| `/requests` | Dashboard | Tableau de bord avec statistiques et historique |

## Design System

- **Colors:** Warm stone canvas (`#F6F5F2`), indigo accent (`#4F46E5`), semantic colors
- **Typography:** Inter (Google Fonts), JetBrains Mono (mono)
- **Spacing:** 4-based scale with consistent rhythm
- **Radius:** 6px (inputs), 10px (cards), 16px (sections)
- **Shadows:** Warm-tinted, subtle elevation

## Development

```bash
npm install
npm run dev      # Dev server
npm run build    # Production build
npm run preview  # Preview build
```

## API Integration

Configure `VITE_API_BASE` in `.env` to point to your Ticket Masala instance:

```
VITE_API_BASE=http://localhost:8085
```

The portal submits to `/api/portal/submit` as `multipart/form-data`.
