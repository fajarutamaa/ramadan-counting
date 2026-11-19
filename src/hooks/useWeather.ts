import { useEffect, useState } from "react";
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

const initialWeather: WeatherData = {
  temperature: 0,
  weatherCode: 0,
  windSpeed: 0,
  humidity: 0,
  visibility: 0,
  location: "",
  loading: true,
  error: null,
};

export function useWeather(
  coords: Coords | null,
  weatherBaseUrl: string,
  locationBaseUrl: string,
  manualCityName?: string,
  refreshInterval = 90000,
): WeatherData {
  const [weather, setWeather] = useState<
    (WeatherData & { coords: Coords }) | null
  >(null);

  useEffect(() => {
    if (!coords) return;
    let interval: ReturnType<typeof setInterval> | undefined;
    let city = manualCityName;
    let activeRequest: AbortController | undefined;

    const fetchWeather = async () => {
      activeRequest?.abort();
      const controller = new AbortController();
      activeRequest = controller;
      try {
        const response = await fetch(
          `${weatherBaseUrl}/forecast?latitude=${coords.lat}&longitude=${coords.lon}&current=temperature_2m,weather_code,wind_speed_10m,relative_humidity_2m,visibility&timezone=auto`,
          { signal: controller.signal },
        );
        const data = await response.json();
        const current = data.current;
        if (!response.ok || !current) throw new Error("Weather unavailable");

        if (!city) {
          try {
            const geoResponse = await fetch(
              `${locationBaseUrl}/reverse?format=json&lat=${coords.lat}&lon=${coords.lon}`,
              { signal: controller.signal },
            );
            if (geoResponse.ok) {
              const { address } = await geoResponse.json();
              city = address?.city || address?.town || address?.village;
            }
          } catch {
            // Weather can still be shown if reverse geocoding fails.
          }
        }
        if (!controller.signal.aborted) {
          setWeather({
            coords,
            temperature: Math.round(current.temperature_2m),
            weatherCode: current.weather_code,
            windSpeed: Math.round(current.wind_speed_10m),
            humidity: current.relative_humidity_2m,
            visibility: Math.round(current.visibility / 1000),
            location: city ?? "",
            loading: false,
            error: null,
          });
        }
      } catch {
        if (!controller.signal.aborted) {
          setWeather({
            ...initialWeather,
            coords,
            location: city ?? "",
            loading: false,
            error: "Failed to fetch weather",
          });
        }
      }
    };

    const startPolling = () => {
      clearInterval(interval);
      interval = setInterval(fetchWeather, refreshInterval);
    };

    fetchWeather();
    if (!document.hidden) startPolling();

    const onVisibilityChange = () => {
      if (document.hidden) {
        clearInterval(interval);
      } else {
        fetchWeather();
        startPolling();
      }
    };

    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearInterval(interval);
      activeRequest?.abort();
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, [
    coords,
    weatherBaseUrl,
    locationBaseUrl,
    manualCityName,
    refreshInterval,
  ]);

  return weather?.coords === coords ? weather : initialWeather;
}
