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
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
        <IslamicPattern />
        <LoadingSkeleton />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <IslamicPattern />

      {/* Theme Toggle Button - Fixed with backdrop */}
      <div className="fixed top-3 right-3 sm:top-4 sm:right-4 z-[100]">
        <div className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-lg shadow-lg p-0.5 sm:p-1">
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
        <motion.div className="text-center mb-8" variants={fadeInUp}>
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1
              className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent"
              role="heading"
              aria-level={1}
            >
              Ramadan Mubarak {hijriYear} AH
            </h1>
          </div>
          {ramadanDate && (
            <p className="text-lg text-slate-600 dark:text-slate-300 mt-2">
              InshaAllah will begin on{" "}
              {ramadanDate.toLocaleDateString("en-GB", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          )}
          <div className="mt-4 flex justify-center">
            <ShareButton hijriYear={hijriYear} />
          </div>
        </motion.div>

        {/* Progress Bar */}
        <ProgressBar targetDate={ramadanDate} />

        {/* Main Card */}
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Countdown to Ramadan
            </CardTitle>
            <h2 className="text-base font-regular text-muted-foreground">
              Today's Weather in {weather.location} {weather.temperature} °C
            </h2>
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
