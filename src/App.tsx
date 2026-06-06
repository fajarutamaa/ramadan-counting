"use client";

import { memo } from "react";
import { AppNav } from "@/components/AppNav";
import { HomeDashboard } from "@/components/HomeDashboard";
import { QuickAccess } from "@/components/QuickAccess";
import { LandingAbout } from "@/components/LandingAbout";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingWhyChoose } from "@/components/LandingWhyChoose";
import { Footer } from "@/components/Footer";
import { PrayerTimes } from "@/components/PrayerTimes";
import { DailyVerse } from "@/components/DailyVerse";
import { JuzTracker } from "@/components/JuzTracker";
import { TasbihCounter } from "@/components/TasbihCounter";
import { MosqueSection } from "@/components/MosqueSection";
import { WeatherCard } from "@/components/WeatherCard";
import { QiblaCompass } from "@/components/QiblaCompass";
import { IslamicCalendar } from "@/components/IslamicCalendar";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useRamadanDate } from "@/hooks/useRamadanDate";

const MemoizedWeatherCard = memo(WeatherCard);
const MemoizedPrayerTimes = memo(PrayerTimes);

export default function App() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const weatherBaseUrl = import.meta.env.VITE_API_WEATHER_URL;
  const locationBaseUrl = import.meta.env.VITE_API_LOCATION_URL;

  const coords = useGeolocation();
  const weather = useWeather(
    coords.coords,
    weatherBaseUrl,
    locationBaseUrl,
    90000,
  );
  const { hijriYear } = useRamadanDate(coords.coords, baseUrl);

  return (
    <div className="min-h-screen bg-background relative">
      <div className="bg-grid" />
      <div className="bg-gradient-overlay" />
      <AppNav />

      {/* ── 1. Home Hero ── */}
      <section id="home" className="relative">
        <div
          className="bg-radial-accent w-[500px] h-[500px] -top-40 -right-40 opacity-40"
          style={{ background: "oklch(0.78 0.1 160 / 0.12)" }}
        />
        <div
          className="bg-radial-accent w-[400px] h-[400px] -bottom-20 -left-40 opacity-30"
          style={{ background: "oklch(0.78 0.1 160 / 0.08)" }}
        />
        <div className="max-w-2xl mx-auto px-4 sm:px-8 pt-20 sm:pt-24 pb-4">
          <HomeDashboard coords={coords.coords} location={weather.location} />
        </div>
        {/* ── 2. Quick Actions ── */}
        <QuickAccess />
      </section>

      {/* ── 3. Prayer Times ── */}
      <div className="max-w-2xl mx-auto px-4 sm:px-8 space-y-6 pb-16 md:pb-0">
        <section id="prayer-times">
          <MemoizedPrayerTimes coords={coords.coords} />
        </section>

        {/* ── 4. Nearby Mosques ── */}
        <section id="mosques">
          <MosqueSection coords={coords.coords} />
        </section>

        {/* ── 5. Qibla Compass ── */}
        <section id="qibla">
          <QiblaCompass coords={coords.coords} />
        </section>

        {/* ── 6. Islamic Calendar ── */}
        <section id="calendar">
          <IslamicCalendar coords={coords.coords} />
        </section>

        {/* ── 7. Quran Verse ── */}
        <section id="verse">
          <DailyVerse />
        </section>

        {/* ── 8. Weather ── */}
        <section id="weather">
          <MemoizedWeatherCard
            temperature={weather.temperature}
            weatherCode={weather.weatherCode}
            windSpeed={weather.windSpeed}
            humidity={weather.humidity}
            visibility={weather.visibility}
            location={weather.location}
            loading={weather.loading}
            error={weather.error}
          />
        </section>

        {/* Juz Tracker & Tasbih (reachable by scroll) */}
        <section id="quran">
          <JuzTracker hijriYear={hijriYear} />
        </section>

        <section id="tasbih">
          <TasbihCounter />
        </section>
      </div>

      {/* ── 9. Features ── */}
      <LandingFeatures />

      {/* Why Choose (not in primary nav) */}
      <LandingWhyChoose />

      {/* ── 10. About ── */}
      <LandingAbout />

      {/* ── 11. Footer ── */}
      <Footer />
    </div>
  );
}
