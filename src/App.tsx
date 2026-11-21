"use client";

import { useMemo, useState } from "react";
import { AppNav } from "@/components/AppNav";
import { HomeDashboard } from "@/components/HomeDashboard";
import { LandingAbout } from "@/components/LandingAbout";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingWhyChoose } from "@/components/LandingWhyChoose";
import { Footer } from "@/components/Footer";
import { PrayerTimes } from "@/components/PrayerTimes";
import { DailyVerse } from "@/components/DailyVerse";
import { JuzTracker } from "@/components/JuzTracker";
import { TasbihCounter } from "@/components/TasbihCounter";
import { MosqueSection } from "@/components/MosqueSection";
import { QiblaCompass } from "@/components/QiblaCompass";
import { IslamicCalendar } from "@/components/IslamicCalendar";
import { FastingTracker } from "@/components/FastingTracker";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useHijriDates } from "@/hooks/useHijriDates";
import { useIslamicEvents } from "@/hooks/useIslamicEvents";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useNearbyMosques } from "@/hooks/useNearbyMosques";
import type { CityLocation } from "@/lib/citySearch";
import {
  normalizePrayerSettings,
  type PrayerSettings,
} from "@/lib/prayerSchedule";

export default function App() {
  const baseUrl =
    import.meta.env.VITE_API_BASE_URL || "https://api.aladhan.com/v1";
  const weatherBaseUrl = import.meta.env.VITE_API_WEATHER_URL;
  const locationBaseUrl = import.meta.env.VITE_API_LOCATION_URL;

  const [city, setCity] = useLocalStorage<CityLocation | null>(
    "selectedCity",
    null,
  );
  const [deviceRequest, setDeviceRequest] = useState(0);
  const [storedSettings, setPrayerSettings] =
    useLocalStorage<PrayerSettings | null>("nur.prayerSettings", null);
  const settings = useMemo(
    () => normalizePrayerSettings(storedSettings),
    [storedSettings],
  );
  const deviceLocation = useGeolocation(!city, deviceRequest);
  const coords = city ?? deviceLocation.coords;
  const nearby = useNearbyMosques(coords);
  const weather = useWeather(
    coords,
    weatherBaseUrl,
    locationBaseUrl,
    city?.name,
  );
  const prayers = usePrayerTimes(coords, {
    settings,
    cityName: city?.name,
    cityTimeZone: city?.timeZone,
    deviceLabel: weather.location,
  });
  const hijri = useHijriDates(
    baseUrl,
    prayers.today.date,
    prayers.tomorrow.date,
    prayers.online,
  );
  const islamicEvents = useIslamicEvents(
    baseUrl,
    hijri.current,
    prayers.online,
  );
  // Keep existing Juz records grouped by the next Ramadan year.
  const juzYear = hijri.current
    ? String(hijri.current.year + (hijri.current.month >= 9 ? 1 : 0))
    : "";
  const ramadan =
    hijri.current?.month === 9
      ? {
          day: hijri.current.day,
          tomorrowIsRamadan: hijri.next
            ? hijri.next.month === 9 && hijri.next.year === hijri.current.year
            : hijri.current.day < 29
              ? true
              : hijri.current.day === 30
                ? false
                : null,
        }
      : null;

  function handleUseDeviceLocation() {
    setDeviceRequest((request) => request + 1);
    setCity(null);
  }

  return (
    <div className="min-h-screen bg-background pb-[calc(4rem+env(safe-area-inset-bottom))] md:pb-0">
      <AppNav />
      <main>
        <section id="home" className="page-shell pt-10 pb-14 sm:pt-16 sm:pb-20">
          <HomeDashboard
            coords={coords}
            location={city?.name ?? weather.location}
            locating={!city && deviceLocation.loading}
            locationPicker={{
              city,
              onSelectCity: setCity,
              onUseDeviceLocation: handleUseDeviceLocation,
            }}
            prayers={prayers}
            hijriInfo={hijri.current}
            islamicEvents={islamicEvents.events}
            ramadan={ramadan}
            nearbyMosques={nearby.results}
            temperature={weather.temperature}
            weatherCode={weather.weatherCode}
            windSpeed={weather.windSpeed}
            humidity={weather.humidity}
            visibility={weather.visibility}
            weatherLoading={weather.loading}
            weatherError={weather.error}
          />
        </section>

        <section
          id="tools"
          aria-labelledby="tools-heading"
          className="page-shell pb-12 sm:pb-20"
        >
          <div className="border-t pt-8 sm:pt-12">
            <p className="section-label">Daily essentials</p>
            <h2
              id="tools-heading"
              className="font-display mt-2 mb-6 text-3xl tracking-tight sm:text-4xl"
            >
              Tools for your day
            </h2>
          </div>
          <div className="grid items-start gap-4 sm:gap-6 lg:grid-cols-2 [&>section]:min-w-0">
            <section id="prayer-times" className="lg:col-span-2">
              <PrayerTimes
                prayers={prayers}
                settings={settings}
                onSaveSettings={setPrayerSettings}
              />
            </section>
            {ramadan && (
              <section id="fasting-log" className="lg:col-span-2">
                <FastingTracker
                  date={prayers.today.date}
                  ramadanDay={ramadan.day}
                />
              </section>
            )}
            <section id="mosques" className="lg:col-span-2">
              <MosqueSection
                key={coords ? `${coords.lat},${coords.lon}` : "no-location"}
                coords={coords}
                cityName={city?.name}
                nearby={nearby}
              />
            </section>
            <section id="qibla">
              <QiblaCompass coords={coords} cityName={city?.name} />
            </section>
            <section id="calendar">
              <IslamicCalendar
                currentHijri={hijri.current}
                events={islamicEvents.events}
                loading={hijri.loading || islamicEvents.loading}
                dateUnavailable={hijri.error}
                civilDate={prayers.today.date}
              />
            </section>
            <section id="verse" className="lg:col-span-2">
              <DailyVerse />
            </section>
            <section id="quran">
              <JuzTracker hijriYear={juzYear} />
            </section>
            <section id="tasbih">
              <TasbihCounter />
            </section>
          </div>
        </section>

        <LandingFeatures />
        <LandingWhyChoose />
        <LandingAbout />
      </main>
      <Footer />
    </div>
  );
}
