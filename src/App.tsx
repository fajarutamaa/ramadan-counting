"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { CountdownCard } from "@/components/CountdownCard";
import { ProgressBar } from "@/components/ProgressBar";
import { IslamicPattern } from "@/components/IslamicPattern";
import { IslamicQuotes } from "@/components/IslamicQuotes";
import { PrayerTimes } from "@/components/PrayerTimes";
import { ShareButton } from "@/components/ShareButton";
import { RamadanArrived } from "@/components/RamadanArrived";
import { LoadingSkeleton } from "@/components/LoadingSkeleton";
import { WeatherCard } from "@/components/WeatherCard";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useRamadanDate } from "@/hooks/useRamadanDate";
import { useCountdown } from "@/hooks/useCountdown";
import { fadeInUp, staggerContainer } from "@/lib/animations";

export default function RamadanCountdown() {
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const weatherBaseUrl = import.meta.env.VITE_API_WEATHER_URL;
  const locationBaseUrl = import.meta.env.VITE_API_LOCATION_URL;

  const [ramadanHasArrived, setRamadanHasArrived] = useState(false);

  const coords = useGeolocation();
  const weather = useWeather(
    coords.coords,
    weatherBaseUrl,
    locationBaseUrl,
    90000,
  );
  const { ramadanDate, hijriYear } = useRamadanDate(coords.coords, baseUrl);
  const timeLeft = useCountdown(ramadanDate, () => {
    setRamadanHasArrived(true);
  });

  const isLoading = useMemo(
    () => !ramadanDate || coords.loading,
    [ramadanDate, coords.loading],
  );

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-sage-50 to-teal-50/70 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <IslamicPattern />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50/80 via-sage-50 to-teal-50/70 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <IslamicPattern />

      {/* Theme Toggle Button - Fixed with backdrop */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[100]">
        <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-md rounded-xl shadow-lg p-0.5 sm:p-1 border border-slate-200/50 dark:border-slate-700/50">
          <ThemeToggleDropdown />
        </div>
      </div>

      <motion.div
        className="w-full max-w-2xl relative z-10"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-6 sm:mb-8 px-4"
          variants={fadeInUp}
        >
          <div className="flex items-center justify-center mb-3 sm:mb-4">
            <h1
              className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 bg-clip-text text-transparent dark:from-emerald-400 dark:via-emerald-300 dark:to-teal-400 leading-tight"
              role="heading"
              aria-level={1}
            >
              Ramadan Mubarak {hijriYear} AH
            </h1>
          </div>
          {ramadanDate && (
            <p className="text-sm sm:text-base md:text-lg text-slate-600 dark:text-slate-300 mt-2 px-2">
              InshaAllah will begin on{" "}
              {ramadanDate.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="mt-3 sm:mt-4 flex justify-center">
            <ShareButton hijriYear={hijriYear} />
          </div>
        </motion.div>

        {/* Weather Card */}
        <WeatherCard
          temperature={weather.temperature}
          weatherCode={weather.weatherCode}
          windSpeed={weather.windSpeed}
          humidity={weather.humidity}
          visibility={weather.visibility}
          location={weather.location}
          loading={weather.loading}
          error={weather.error}
        />

        {/* Progress Bar */}
        <ProgressBar targetDate={ramadanDate} />

        {/* Main Card */}
        <Card className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-sm border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Countdown to Ramadan
            </CardTitle>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent className="pt-6">
            {ramadanHasArrived ? (
              <RamadanArrived />
            ) : (
              <>
                <div
                  className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
                  role="timer"
                  aria-live="polite"
                  aria-atomic="true"
                  aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} seconds until Ramadan`}
                >
                  <CountdownCard value={timeLeft.days} label="Days" index={0} />
                  <CountdownCard
                    value={timeLeft.hours}
                    label="Hours"
                    index={1}
                  />
                  <CountdownCard
                    value={timeLeft.minutes}
                    label="Minutes"
                    index={2}
                  />
                  <CountdownCard
                    value={timeLeft.seconds}
                    label="Seconds"
                    index={3}
                  />
                </div>

                {/* Islamic Quotes */}
                <IslamicQuotes />
              </>
            )}
          </CardContent>
        </Card>

        {/* Prayer Times */}
        <PrayerTimes coords={coords.coords} />
      </motion.div>
    </div>
  );
}
