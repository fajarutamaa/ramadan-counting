"use client";

import { useState } from "react";
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
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useRamadanDate } from "@/hooks/useRamadanDate";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { usePrayerTimes } from "@/hooks/usePrayerTimes";
import { useNearbyMosques } from "@/hooks/useNearbyMosques";
import type { CityLocation } from "@/lib/citySearch";

export default function App() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const weatherBaseUrl = import.meta.env.VITE_API_WEATHER_URL;
  const locationBaseUrl = import.meta.env.VITE_API_LOCATION_URL;

  const [city, setCity] = useLocalStorage<CityLocation | null>(
    "selectedCity",
    null,
  );
  const [deviceRequest, setDeviceRequest] = useState(0);
  const deviceLocation = useGeolocation(!city, deviceRequest);
  const coords = city ?? deviceLocation.coords;
  const prayers = usePrayerTimes(coords, city?.timeZone);
  const nearby = useNearbyMosques(coords);
  const weather = useWeather(
    coords,
    weatherBaseUrl,
    locationBaseUrl,
    city?.name,
  );
  const { hijriYear } = useRamadanDate(coords, baseUrl);

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
              <PrayerTimes hasLocation={!!coords} prayers={prayers} />
            </section>
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
              <IslamicCalendar coords={coords} />
            </section>
            <section id="verse" className="lg:col-span-2">
              <DailyVerse />
            </section>
            <section id="quran">
              <JuzTracker hijriYear={hijriYear} />
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
