"use client";

import { useMemo, memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { CountdownSection } from "@/components/CountdownSection";
import { ProgressBar } from "@/components/ProgressBar";
import { ShareButton } from "@/components/ShareButton";
import { PrayerTimes } from "@/components/PrayerTimes";
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

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-start justify-center p-4 sm:p-8">
      <div className="fixed top-4 right-4 z-50">
        <div className="bg-card border border-border rounded-xl p-0.5 shadow-sm">
          <ThemeToggleDropdown />
        </div>
      </div>

      <motion.div
        className="w-full max-w-2xl mt-6 sm:mt-12 space-y-6"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: "easeOut" }}
      >
        <header className="text-center px-2">
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

        <MemoizedProgressBar targetDate={ramadanDate} />

        <Card>
          <CardHeader className="text-center pb-2 pt-6">
            <CardTitle className="text-lg sm:text-xl font-semibold text-foreground">
              Countdown to Ramadan
            </CardTitle>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent className="pt-4 pb-6">
            <CountdownSection ramadanDate={ramadanDate} />
          </CardContent>
        </Card>

        <MemoizedPrayerTimes coords={coords.coords} />
      </motion.div>
    </div>
  );
}
