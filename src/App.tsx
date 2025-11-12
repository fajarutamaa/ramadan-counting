"use client";
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ThemeToggleDropdown } from "@/components/ThemeToggle";

interface HijriData {
  hijri: {
    month: {
      number: number;
    };
    day: string;
    year: string;
  };
  gregorian: {
    date: string;
  };
}

interface WeatherData {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  location: string;
  loading: boolean;
  error: string | null;
}

interface ApiResponse {
  data: HijriData[];
}

export default function RamadanCountdown() {
  const [ramadanDate, setRamadanDate] = useState<Date | null>(null);
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });
  const [hijriYear, setHijriYear] = useState<string>("");
  const [coords, setCoords] = useState<{ lat: number; lon: number } | null>(
    null,
  );
  const baseUrl = import.meta.env.VITE_API_BASE_URL;
  const weatherBaseUrl = import.meta.env.VITE_API_WEATHER_URL;
  const locationBaseUrl = import.meta.env.VITE_API_LOCATION_URL;

  const [weather, setWeather] = useState<WeatherData>({
    temperature: 0,
    weatherCode: 0,
    windSpeed: 0,
    humidity: 0,
    visibility: 0,
    location: "",
    loading: true,
    error: null,
  });

  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
        });
      },
      () => {
        console.error("Failed fetch location");
        setCoords({ lat: -6.2088, lon: 106.8456 });
      },
    );
  }, []);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            async (position) => {
              const { latitude, longitude } = position.coords;

              const response = await fetch(
                `${weatherBaseUrl}/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility&timezone=auto`,
              );
              const data = await response.json();
              const current = data.current;

              try {
                const geoResponse = await fetch(
                  `${locationBaseUrl}/reverse?format=json&lat=${latitude}&lon=${longitude}`,
                );
                const geoData = await geoResponse.json();
                const city =
                  geoData.address?.city ||
                  geoData.address?.town ||
                  "Your location";

                setWeather({
                  temperature: Math.round(current.temperature_2m),
                  weatherCode: current.weather_code,
                  windSpeed: Math.round(current.wind_speed_10m),
                  humidity: current.relative_humidity_2m,
                  visibility: Math.round(current.visibility / 1000),
                  location: city,
                  loading: false,
                  error: null,
                });
              } catch {
                setWeather((prev) => ({
                  ...prev,
                  location: "Your location",
                  loading: false,
                }));
              }
            },
            () => {
              setWeather((prev) => ({
                ...prev,
                location: "Jakarta",
                error: "Using default location",
                loading: false,
              }));
            },
          );
        }
      } catch {
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: "Failed fetch data weather",
        }));
      }
    };

    fetchWeather();
  }, [weatherBaseUrl, locationBaseUrl]);

  const getRamadanDate = useCallback(async () => {
    if (!coords) return;

    let found: Date | null = null;
    const nextYear = new Date().getFullYear() + 1;

    try {
      for (let month = 1; month <= 12; month++) {
        const res = await fetch(
          `${baseUrl}/gToHCalendar/${month}/${nextYear}?latitude=${coords.lat}&longitude=${coords.lon}&method=2`,
        );
        const data: ApiResponse = await res.json();

        const ramadanStart = data.data.find(
          (d: HijriData) => d.hijri.month.number === 9 && d.hijri.day === "1",
        );

        if (ramadanStart) {
          const [day, mon, year] = ramadanStart.gregorian.date.split("-");
          found = new Date(`${year}-${mon}-${day}T00:00:00+07:00`);
          setHijriYear(ramadanStart.hijri.year);
          break;
        }
      }
    } catch (e) {
      console.error("Failed fetch Ramadan:", e);
    }

    if (!found) {
      found = new Date(`${nextYear}-03-01T00:00:00+07:00`);
    }

    setRamadanDate(found);
  }, [coords, baseUrl]);

  useEffect(() => {
    if (coords) {
      getRamadanDate();
    }
  }, [coords, getRamadanDate]);

  useEffect(() => {
    if (!ramadanDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const distance = ramadanDate.getTime() - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor(
            (distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60),
          ),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000),
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [ramadanDate]);

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
