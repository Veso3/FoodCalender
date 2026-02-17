# Essens-Kalender (PWA)

Kleine Progressive Web App: Kalender, in dem du eintragen kannst, was du gegessen hast und wie es dir dabei ging. Einträge werden in einer Postgres-Datenbank (z.B. Neon) über Vercel-API gespeichert.

## Lokal starten

```bash
npm install
npm run dev
```

Im Browser `http://localhost:5173` öffnen.

## Build

```bash
npm run build
```

Die fertige App liegt in `dist/`.

## Kostenlos hosten (nur für dich)

1. **Vercel:** Repo bei [vercel.com](https://vercel.com) verbinden, Root Directory auf `essens-kalender-pwa` setzen (falls im Monorepo), Build Command: `npm run build`, Output: `dist`. Nach dem Deploy nur die URL kennen und auf dem iPhone in Safari öffnen → „Zum Home-Bildschirm hinzufügen“.

2. **Netlify:** Repo bei [netlify.com](https://netlify.com) verbinden, Build command: `npm run build`, Publish directory: `dist`. Danach die URL nur dir nutzen.

3. **GitHub Pages:** Z.B. mit `gh-pages`: `npx gh-pages -d dist` aus dem Projektordner (vorher ein leeres Repo anlegen und `dist` als Branch `gh-pages` pushen). Seite: `https://<username>.github.io/<repo>/`.

## Auf dem iPhone 16 nutzen

- In Safari die gehostete URL öffnen.
- Teilen → „Zum Home-Bildschirm hinzufügen“.
- App wie eine native App nutzen; Einträge liegen in der Cloud (Postgres).

## Datenbank (Vercel + Neon)

- Im Vercel-Projekt **Environment Variables** setzen: `POSTGRES_URL` (oder `DATABASE_URL`) mit der Neon-Connection-URL.
- Die Tabelle `entries` wird beim ersten API-Aufruf automatisch angelegt.
- Optional: Für lokales Testen der API `vercel dev` nutzen und in `.env.local` dieselbe Variable setzen. Frontend lokal mit `npm run dev`: dann `VITE_API_URL` auf deine Vercel-Deploy-URL setzen, damit die App die gehostete API anspricht.

## Tech

- React 19 + TypeScript + Vite
- PWA (vite-plugin-pwa, Service Worker, Manifest)
- Backend: Vercel Serverless Functions unter `/api`, Postgres (Neon) via `@neondatabase/serverless` 
