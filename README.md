# Essens-Kalender (PWA)

Kleine Progressive Web App: Kalender, in dem du eintragen kannst, was du gegessen hast und wie es dir dabei ging. Daten werden nur lokal im Browser (iPhone/PC) gespeichert.

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
- App wie eine native App nutzen; Daten bleiben im Gerät (IndexedDB), auch offline nutzbar.

## Tech

- React 19 + TypeScript + Vite
- PWA (vite-plugin-pwa, Service Worker, Manifest)
- IndexedDB (idb) für lokale Speicherung
"# FoodCalender" 
