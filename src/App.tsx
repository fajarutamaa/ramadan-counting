"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";
import { useGeolocation } from "@/hooks/useGeolocation";
import { useWeather } from "@/hooks/useWeather";
import { useRamadanDate } from "@/hooks/useRamadanDate";
import { useCountdown } from "@/hooks/useCountdown";

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
  const timeLeft = useCountdown(ramadanDate);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="fixed top-4 right-4 z-50">
        <ThemeToggleDropdown />
      </div>
      <div className="w-full max-w-2xl">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-teal-600 to-teal-700 bg-clip-text text-transparent">
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
        </div>
        <Card className="bg-white dark:bg-slate-800 border-0 shadow-2xl">
          <CardHeader className="text-center pb-4">
            <CardTitle className="text-2xl font-semibold text-slate-800 dark:text-slate-100">
              Countdown Ramadan
            </CardTitle>
            <h2 className="text-base font-reguler text-muted-foreground">
              Today's Weather in {weather.location} {weather.temperature} °C
            </h2>
            <Separator className="mt-4" />
          </CardHeader>
          <CardContent className="pt-6">
            {!ramadanDate ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto mb-4"></div>
                <p className="text-slate-600 dark:text-slate-300">
                  Mengambil tanggal Ramadan...
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-3 shadow-lg">
                      <div className="text-3xl md:text-4xl font-bold text-white">
                        {timeLeft.days.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium">
                      Days
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-3 shadow-lg">
                      <div className="text-3xl md:text-4xl font-bold text-white">
                        {timeLeft.hours.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium">
                      Hours
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-3 shadow-lg">
                      <div className="text-3xl md:text-4xl font-bold text-white">
                        {timeLeft.minutes.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium">
                      Minutes
                    </Badge>
                  </div>
                  <div className="text-center">
                    <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-6 mb-3 shadow-lg">
                      <div className="text-3xl md:text-4xl font-bold text-white">
                        {timeLeft.seconds.toString().padStart(2, "0")}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-sm font-medium">
                      Seconds
                    </Badge>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-slate-700 dark:to-slate-600 rounded-xl p-4">
                    <p className="text-slate-600 dark:text-slate-300 font-medium">
                      💫 May we all be blessed with good health and the
                      opportunity to observe Ramadan with devotion.
                    </p>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
