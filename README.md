# Nur — Muslim Companion

A modern, offline-capable Islamic lifestyle application providing accurate prayer times, mosque discovery, Qibla direction, Islamic calendar with API-driven Hijri events, and daily spiritual tools — built for Muslims who want a clean, focused digital companion for their faith journey.

---

## Overview

Nur (نور, "light") is a single-page web application designed as a daily spiritual hub. It answers the core needs of a practicing Muslim: knowing prayer times, finding nearby mosques, determining Qibla direction, tracking Islamic dates, and maintaining worship routines.

The application is built around the user's geolocation — every feature derives from where you are. There is no account system, no server, and no data collection. All personal tracking (fasting records, Quran progress, dhikr counts) persists locally in the browser.

### Who it is for

- Muslims seeking a clean, ad-free alternative to feature-bloated Islamic apps
- Travelers needing Qibla direction and mosque finder on the go
- Those observing Ramadan who want fasting tracking, Juz progress, and accurate Iftar/Suhoor times

### Product vision

A privacy-first, open-source Islamic companion that does one thing well — helping you stay connected to your faith throughout the day, without distraction.

---

## Features

| Feature                   | Description                                                                                                     |
| ------------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Prayer Times**          | Accurate daily prayer schedule via AlAdhan API (ISNA method), with current/next prayer indicators and countdown |
| **Nearby Mosques**        | Discover mosques within 5 km using OpenStreetMap Overpass API, sorted by distance                               |
| **Mosque Search**         | Search mosques globally by name, city, or address via Nominatim                                                 |
| **Mosque Map**            | Interactive Leaflet map with directions to selected mosque                                                      |
| **Qibla Compass**         | Accurate Qibla bearing calculated from great-circle formula, with live device compass overlay                   |
| **Islamic Calendar**      | API-driven Hijri date display with correct Islamic event dates (not hardcoded Gregorian)                        |
| **Ramadan Countdown**     | Dynamic countdown to the next Ramadan, computed from the current Hijri date                                     |
| **Fasting Tracker**       | Daily fast logging (fasted/not-fasted/excused) with streak tracking, tied to Ramadan dates                      |
| **Fasting Window**        | Live countdown to Iftar and Suhoor end, fasting progress, and duration                                          |
| **Juz Tracker**           | Track Quran completion by Juz across Hijri years, with per-year progress and suggestion                         |
| **Tasbih Counter**        | Digital dhikr counter with preset adhkar, daily goal tracking, and tap/space-to-count                           |
| **Daily Verse**           | Curated Quran verses with navigation, revelation type, and surah reference                                      |
| **Weather**               | Local weather (temperature, conditions, wind, humidity, visibility) via Open-Meteo                              |
| **Smart Recommendations** | Contextual suggestions — nearby mosques when prayer approaches, Jumu'ah alerts on Fridays                       |
| **Theme Support**         | Light, dark, and system theme with persistent preference                                                        |
| **Location Detection**    | Browser geolocation with session caching; graceful fallback when unavailable                                    |

## Tech Stack

| Technology                           | Purpose                                                                   |
| ------------------------------------ | ------------------------------------------------------------------------- |
| **React 19**                         | UI framework                                                              |
| **TypeScript 5.8**                   | Type safety                                                               |
| **Vite 7**                           | Build tool and dev server                                                 |
| **Tailwind CSS 4**                   | Utility-first styling (CSS-first config via `@tailwindcss/vite`)          |
| **shadcn/ui**                        | Primitive UI components (button, card, badge, separator, alert, progress) |
| **Framer Motion**                    | Animations and transitions                                                |
| **Lucide React**                     | Icon library                                                              |
| **Leaflet + React-Leaflet**          | Interactive maps for mosque locations                                     |
| **ESLint + Prettier**                | Code quality and formatting                                               |
| **Husky + commitlint + lint-staged** | Git hooks enforcing conventional commits and pre-commit linting           |

---

## Project Structure

```
src/
├── components/        # React components organized by feature
│   ├── ui/            # shadcn/ui primitives (button, card, badge, etc.)
│   ├── HomeDashboard  # Main dashboard with greeting, prayer card, quick info
│   ├── PrayerTimes    # Prayer time display with current/next indicators
│   ├── MosqueSection  # Mosque finder: nearby list, search, detail view, map
│   ├── QiblaCompass   # Qibla direction with live compass
│   ├── IslamicCalendar# Hijri calendar with API-driven events
│   ├── FastingTracker # Ramadan fasting log and streak display
│   ├── JuzTracker     # Quran Juz completion tracker
│   ├── TasbihCounter  # Digital dhikr counter
│   ├── DailyVerse     # Quran verse of the day
│   └── ...            # Landing sections, nav, footer, theme, etc.
├── hooks/             # Custom React hooks for stateful logic
│   ├── useGeolocation      # Browser geolocation with session caching
│   ├── usePrayerTimes      # Prayer times fetching and current/next logic
│   ├── useRamadanDate      # Ramadan date calculation from Hijri API
│   ├── useIslamicEvents    # Computes all Islamic event Gregorian dates from Hijri
│   ├── useFastingWindow    # Live Iftar/Suhoor countdown
│   ├── useFastTracker      # Fasting record persistence (localStorage)
│   ├── useWeather          # Weather polling with tab-visibility awareness
│   ├── useJuzTracker       # Juz completion tracking (localStorage)
│   ├── useTasbih           # Dhikr counting and history (localStorage)
│   ├── useFavorites        # Favorite mosques/tools (localStorage)
│   ├── useActivity         # User activity log (localStorage)
│   ├── useLocalStorage     # Generic localStorage persistence with cross-tab sync
│   └── ...
├── lib/               # Utilities and data
│   ├── utils.ts            # cn() helper (clsx + tailwind-merge)
│   ├── qibla.ts            # Qibla bearing calculation (shared)
│   ├── mosqueApi.ts        # Overpass + Nominatim API clients
│   ├── islamicEvents.ts    # Islamic event definitions with Hijri dates
│   ├── quranVerses.ts      # Curated Quran verse collection
│   ├── islamicQuotes.ts    # Inspirational quote collection
│   └── animations.ts       # Framer Motion animation variants
├── context/           # React contexts
│   └── theme-context.ts    # Theme provider (light/dark/system)
├── assets/            # Static assets
├── main.tsx           # Application entry point
├── App.tsx            # Root component with section layout
└── index.css          # Tailwind CSS entry + global styles
```

---

## Installation

```bash
git clone https://github.com/fajarutamaa/nur-muslim-companion.git
cd nur-muslim-companion
npm install
npm run dev
```

The development server starts at `http://localhost:5173`.

### Build for production

```bash
npm run build
npm run preview
```

### Deploy to Netlify

Configure your Netlify site with:

- **Build command:** `npm install && npm run build`
- **Publish directory:** `dist`
- **Node version:** 18+

---

## Environment Variables

Copy `.env` to `.env.local` and configure:

```env
VITE_API_BASE_URL=https://api.aladhan.com/v1
VITE_API_WEATHER_URL=https://api.open-meteo.com/v1
VITE_API_LOCATION_URL=https://nominatim.openstreetmap.org
```

| Variable                | Required | Default                               | Description                                       |
| ----------------------- | -------- | ------------------------------------- | ------------------------------------------------- |
| `VITE_API_BASE_URL`     | Yes      | `https://api.aladhan.com/v1`          | AlAdhan API for prayer times and Hijri calendar   |
| `VITE_API_WEATHER_URL`  | Yes      | `https://api.open-meteo.com/v1`       | Open-Meteo API for weather data                   |
| `VITE_API_LOCATION_URL` | Yes      | `https://nominatim.openstreetmap.org` | Nominatim for reverse geocoding and mosque search |

These defaults point to free, publicly available APIs that require no API key.

---

## Configuration

### Prayer Calculation

Prayer times use the **ISNA** calculation method (`method=2` in the AlAdhan API), which is commonly used in North America. The app passes the user's latitude and longitude to the API for accurate local times.

### Location Services

- **Geolocation:** Uses the browser's `navigator.geolocation` API. Coordinates are cached in `sessionStorage` for the duration of the browser session.
- **Fallback:** When location is denied or unavailable, features gracefully degrade — showing location prompt states instead of breaking.

### Islamic Calendar

- The Hijri date is fetched live from AlAdhan's Gregorian-to-Hijri conversion endpoint.
- Islamic event dates (Ramadan, Eid, etc.) are **not hardcoded** — they are computed from their fixed Hijri month/day via the Hijri-to-Gregorian API, ensuring accuracy across years.
- Results are cached in `sessionStorage` per Hijri year to minimize API calls.

### Data Persistence

| Storage          | Purpose                                                                                                     |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `sessionStorage` | Coordinates, Ramadan date, Hijri date, Islamic events                                                       |
| `localStorage`   | Fasting records, Juz progress, Tasbih history, favorites, activity log, theme preference, daily verse index |

---

## Data Sources

### AlAdhan API (`api.aladhan.com`)

- **Prayer times:** Fetched daily by lat/lon with ISNA calculation method
- **Hijri date conversion:** Gregorian-to-Hijri (`gToH`) and Hijri-to-Gregorian (`hToG`)
- **Usage:** Prayer times, Ramadan date calculation, Islamic event date computation

### Open-Meteo API (`api.open-meteo.com`)

- **Weather data:** Temperature, weather code, wind speed, humidity, visibility
- **Usage:** Weather summary displayed in the prayer card

### OpenStreetMap / Nominatim (`nominatim.openstreetmap.org`)

- **Reverse geocoding:** Converts coordinates to city name for display
- **Mosque search:** `search?q=...&format=json` for text-based mosque lookup

### Overpass API (`overpass-api.de`)

- **Nearby mosques:** Queries nodes and ways with `amenity=place_of_worship` and `religion=muslim`, returning results sorted by distance with deduplication

---

## Architecture

### State Management

The application does not use a global state library. Each feature manages its own state through custom React hooks:

- **Server state** (prayer times, weather, Hijri dates) is fetched on mount and cached in `sessionStorage`
- **User data** (fasting records, Juz progress, Tasbih counts) persists in `localStorage`
- **UI state** (selected mosque, view mode, active dhikr) is local component state

### Data Fetching Strategy

- API calls are triggered by location availability, not route changes (single page, no router)
- `fetch` is used directly (no React Query/SWR abstraction)
- Weather uses polling with tab-visibility awareness (stops when hidden, resumes on focus)
- Prayer times and Hijri data are fetched once per day (cached by date string)
- Islamic events are cached per Hijri year to avoid redundant API calls

### Component Architecture

- Root `App.tsx` composes sections vertically. Each section is an `<section id="...">` that scroll-navigation targets via `scrollIntoView`.
- `HomeDashboard` orchestrates the hero section, prayer card, quick info grid, verse, and smart recommendations — delegating rendering to focused sub-components.
- Feature components (`PrayerTimes`, `MosqueSection`, `QiblaCompass`, etc.) are independent and receive only the props they need.

### Routing

There is no routing library. The application is a single-page vertical scroll with smooth-scroll anchor navigation (`#prayer-times`, `#mosques`, `#qibla`, `#calendar`, `#verse`, `#quran`, `#tasbih`).

---

## Performance

- **Session caching:** API responses for coordinates, Ramadan date, Hijri date, and Islamic events are cached in `sessionStorage`, avoiding redundant network calls within a session.
- **Local persistence:** User-generated data (fasts, Juz, Tasbih) is stored in `localStorage` — no database calls.
- **Polling optimization:** Weather polls every 60–90 seconds but stops when the browser tab is hidden, resuming on visibility change.
- **Once-daily fetches:** Prayer times are fetched only once per day (guarded by a `useRef` + date string comparison).
- **Animation optimization:** Framer Motion variants are defined as constants (`@/lib/animations`) to avoid re-creation on every render.

---

## Accessibility

- **Semantic HTML:** Uses `<section>`, `<nav>`, `<button>`, `<h1>`–`<h4>` elements appropriately.
- **Keyboard navigation:** Tasbih counter supports Space/Enter to count. Mosque cards are focusable and interactive via keyboard.
- **ARIA labels:** Interactive elements include `aria-label` attributes for screen readers.
- **Responsive design:** Mobile-first layout using Tailwind breakpoints (`sm:`, `md:`, `lg:`).
- **Dark mode:** Full support with `.dark` class on `<html>`, toggled via `ThemeProvider` (light/dark/system).
- **Reduced motion:** Framer Motion respects `prefers-reduced-motion` via its built-in support.

---

## Roadmap

### In progress

- **Fasting Tracker enhancements:** Multi-year fasting history, export
- **Mosque favorites:** Persistent saved mosque list with quick access

### Planned

- **Prayer notifications:** Browser notifications for prayer times
- **Offline support:** Service worker caching for prayer times and Hijri data
- **PWA support:** Installable as a standalone app with manifest
- **Multiple calculation methods:** Configurable Islamic prayer calculation methods
- **Widget system:** Customizable dashboard widgets
- **Localization:** Multi-language support (Arabic, Indonesian, Urdu, etc.)

---

## Contributing

Contributions are welcome. Please follow the existing code conventions:

1. Fork the repository
2. Create a feature branch (`git checkout -b feat/my-feature`)
3. Make your changes
4. Ensure commits follow [conventional commits](https://www.conventionalcommits.org/) (`feat:`, `fix:`, `chore:`, `refactor:`, etc.)
5. Run `npm run lint` and `npm run build` before committing
6. Open a pull request

The project uses Husky pre-commit hooks that run `lint-staged` (ESLint + Prettier on staged files). If you don't have Bun installed, you can skip hooks with `git commit --no-verify`.

---

## License

MIT License — see [LICENSE](LICENSE).

Copyright (c) 2025 Fajar Dwi Utomo.

---

## Author

### Fajar Dwi Utomo

Full-stack developer passionate about building meaningful applications for the Muslim community.

- GitHub: [https://github.com/fajarutamaa](https://github.com/fajarutamaa) _(placeholder — update with actual URL)_
- LinkedIn: [https://www.linkedin.com/in/fajardwiutomo](https://www.linkedin.com/in/fajardwiutomo)
- Medium: [https://medium.com/@fajardwiutomo](https://medium.com/@fajardwiutomo)
