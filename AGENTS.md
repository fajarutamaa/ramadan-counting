# Ramadan Counting

## Stack

- React 19 + TypeScript 5.8 + Vite 7 + Tailwind CSS 4 + shadcn/ui
- Framer Motion for animations, lucide-react for icons

## Commands

- `npm run dev` — start Vite dev server
- `npm run build` — runs `tsc -b && vite build` (project references build, both tsconfig.app.json + tsconfig.node.json)
- `npm run lint` — ESLint with typescript-eslint, react-hooks, react-refresh
- `npm run preview` — Vite preview of production build
- No tests (no test framework in deps)

## Commit convention

- Husky pre-commit hook: `bunx --bun lint-staged` (requires bun installed)
- lint-staged runs `eslint --max-warnings=0` + `prettier --write` on JS/TS/JSX/TSX; `prettier -w` on HTML/JSON/CSS/MD
- commitlint enforces conventional commits: feat, fix, docs, chore, style, refactor, ci, test, revert, perf, vercel

## Key config

- `.npmrc`: `legacy-peer-deps=true` — always use `npm install` with that flag
- Path alias `@/` → `src/*` (Vite resolve + tsconfig paths)
- Tailwind v4 CSS-first: `@import "tailwindcss"` in `src/index.css`, no tailwind.config — uses `@tailwindcss/vite` plugin
- Dark mode: `.dark` class on `<html>`, managed by `<ThemeProvider>` (localStorage key: `theme`)

## External APIs (via env vars)

- `VITE_API_BASE_URL` — aladhan.com (Hijri calendar, prayer times)
- `VITE_API_WEATHER_URL` — open-meteo.com
- `VITE_API_LOCATION_URL` — nominatim.openstreetmap.org (reverse geocoding)
- App caches some data in `sessionStorage` (coords, ramadanDate, hijriYear)

## Architecture

- Entry: `src/main.tsx` → `StrictMode > ErrorBoundary > ThemeProvider > App`
- Single page, no routing. All state derived from browser geolocation.
- shadcn/ui components live in `src/components/ui/`, installed via `components.json`

## Deploy

- Netlify: `npm install && npm run build`, publish `dist`, Node 18
