"use client";

import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { AppNav } from "@/components/AppNav";
import { LandingHero } from "@/components/LandingHero";
import { LandingAbout } from "@/components/LandingAbout";
import { LandingFeatures } from "@/components/LandingFeatures";
import { LandingWhyChoose } from "@/components/LandingWhyChoose";
import { Footer } from "@/components/Footer";
import { CountdownSection } from "@/components/CountdownSection";
import { ProgressBar } from "@/components/ProgressBar";
import { ShareButton } from "@/components/ShareButton";
import { PrayerTimes } from "@/components/PrayerTimes";
import { DailyVerse } from "@/components/DailyVerse";
import { JuzTracker } from "@/components/JuzTracker";
import { TasbihCounter } from "@/components/TasbihCounter";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { WeatherCard } from "@/components/WeatherCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useRamadanDate } from "@/hooks/useRamadanDate";

const MemoizedWeatherCard = memo(WeatherCard);
const MemoizedProgressBar = memo(ProgressBar);
const MemoizedPrayerTimes = memo(PrayerTimes);

export default function RamadanCountdown() {
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
  const { ramadanDate, hijriYear } = useRamadanDate(coords.coords, baseUrl);

  const isLoading = useMemo(
    () => !ramadanDate || coords.loading,
    [ramadanDate, coords.loading],
  );

  return (
    <div className="min-h-screen bg-background relative">
      <div className="bg-grid" />
      <div className="bg-gradient-overlay" />
      <AppNav />

      {/* Landing sections — always visible */}
      <section id="home" className="relative">
        <div
          className="bg-radial-accent w-[500px] h-[500px] -top-40 -right-40 opacity-40"
          style={{ background: "oklch(0.78 0.1 160 / 0.12)" }}
        />
        <div
          className="bg-radial-accent w-[400px] h-[400px] -bottom-20 -left-40 opacity-30"
          style={{ background: "oklch(0.78 0.1 160 / 0.08)" }}
        />
        <LandingHero />
        <LandingAbout />
        <LandingFeatures />
        <LandingWhyChoose />
      </section>

      {/* App features — only when data is ready */}
      <section className="relative z-10">
        <div className="max-w-2xl mx-auto px-4 sm:px-8 space-y-6">
          {isLoading ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <LoadingSkeleton />
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <header className="text-center px-2 pt-16 sm:pt-12">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-foreground leading-tight tracking-tight">
                  Ramadan Mubarak{" "}
                  <span className="text-emerald-600 dark:text-emerald-400">
                    {hijriYear} AH
                  </span>
                </h1>
                {ramadanDate && (
                  <p className="text-sm sm:text-base text-muted-foreground mt-3">
                    Begins{" "}
                    <span className="font-medium text-foreground">
                      {ramadanDate.toLocaleDateString("en-GB", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </span>
                  </p>
                )}
                <div className="mt-5">
                  <ShareButton hijriYear={hijriYear} />
                </div>
              </header>

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

              <section id="verse">
                <DailyVerse />
              </section>

              <section id="progress">
                <MemoizedProgressBar targetDate={ramadanDate} />
              </section>

              <section id="quran">
                <JuzTracker hijriYear={hijriYear} />
              </section>

              <section id="tasbih">
                <TasbihCounter />
              </section>

              <section id="countdown">
                <Card>
                  <CardHeader className="text-center pb-2 pt-6">
                    <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
                      Countdown to Ramadan
                    </CardTitle>
                    <Separator className="mt-4" />
                  </CardHeader>
                  <CardContent className="pt-4 pb-6">
                    <CountdownSection
                      ramadanDate={ramadanDate}
                      coords={coords.coords}
                    />
                  </CardContent>
                </Card>
              </section>

              <section id="prayer">
                <MemoizedPrayerTimes coords={coords.coords} />
              </section>
            </motion.div>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
}
