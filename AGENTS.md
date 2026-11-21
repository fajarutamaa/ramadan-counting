# Nur (Ramadan Counting)

## Setup and checks

- Use Node 22.12+ and `npm ci`; `.npmrc` already enables legacy peer resolution. Node 18 in `README.md` and `netifly.toml` is below Vite 7's requirement.
- Run `npm run lint` and `npm run build` before committing. For typechecking alone, run `npx tsc -b` (checks both app and Vite config); plain `tsc --noEmit` at the root doesn't check the referenced projects.
- There is no configured test runner; `test-results/.last-run.json` is an artifact, not a runnable suite.
- Husky's pre-commit hook requires Bun even with an npm install: `bunx --bun lint-staged` runs ESLint with zero warnings on staged JS/TS, then Prettier rewrites staged files. Use Conventional Commits; no `commit-msg` hook is checked in.
- The static build goes to `dist`. The checked-in `netifly.toml` is misspelled and won't be auto-discovered as `netlify.toml`.

## App wiring

- `src/main.tsx` mounts `App` under `StrictMode`, `ErrorBoundary`, `ThemeProvider`, and `MotionConfig`. There's no router: when changing section IDs in `src/App.tsx`, check `AppNav`, `QuickAccess`, and `Footer` for matching targets.
- `App` prefers `localStorage.selectedCity` over GPS and passes the city's time zone to the shared prayer schedule. To test a fresh location prompt, clear both `localStorage.selectedCity` and `sessionStorage.coords`. Hijri/Ramadan caches also use `sessionStorage`; tracker data uses `localStorage`.
- `@/` maps to `src/` in Vite and TypeScript. shadcn/ui primitives live in `src/components/ui/`; Tailwind v4 tokens and the `.dark` variant live in `src/index.css`, not the `tailwind.config.ts` named in `components.json`. `ThemeProvider` sets `.dark` on `<html>`.

## Local API configuration

- Create `.env.local` directly; there is no tracked env template:
  - `VITE_API_BASE_URL=https://api.aladhan.com/v1` (Hijri calendar and Ramadan)
  - `VITE_API_WEATHER_URL=https://api.open-meteo.com/v1`
  - `VITE_API_LOCATION_URL=https://nominatim.openstreetmap.org` (reverse geocoding and submitted mosque searches; don't add Nominatim autocomplete)
- Nearby mosque data is fetched once for the dashboard and mosque list. `VITE_API_OVERPASS_URL` optionally overrides the full interpreter URL; the defaults are in `src/lib/mosqueApi.ts`.
- Prayer/fasting timing and manual city search use separate hardcoded endpoints. City search uses Open-Meteo geocoding, not Nominatim.
