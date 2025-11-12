import { useEffect, useState, useRef } from "react";
import type { Coords } from "./useGeolocation";

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

export function useWeather(
  coords: Coords | null,
  weatherBaseUrl: string,
  locationBaseUrl: string,
  refreshInterval = 60000,
): WeatherData {
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

  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!coords) return;

    const fetchWeather = async () => {
      try {
        const response = await fetch(
          `${weatherBaseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility&timezone=auto`,
        );
        const data = await response.json();
        const current = data.current;

        try {
          const geoResponse = await fetch(
            `${locationBaseUrl}/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`,
          );
          const geoData = await geoResponse.json();
          const city =
            geoData.address?.city ||
            geoData.address?.town ||
            geoData.address?.village ||
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
            location: "Unknown location",
            loading: false,
          }));
        }
      } catch (err) {
        console.error("[useWeather] ❌ Failed to fetch weather:", err);
        setWeather((prev) => ({
          ...prev,
          loading: false,
          error: "Failed to fetch weather",
        }));
      }
    };

    fetchWeather();
    intervalRef.current = setInterval(fetchWeather, refreshInterval);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [coords, weatherBaseUrl, locationBaseUrl, refreshInterval]);

  return weather;
}
