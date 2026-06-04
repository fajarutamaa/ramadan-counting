import { motion } from "framer-motion";
import {
  Cloud,
  CloudRain,
  CloudDrizzle,
  Sun,
  CloudFog,
  Wind,
  Droplets,
  Eye,
  CloudLightning,
} from "lucide-react";
import { fadeIn } from "@/lib/animations";

interface WeatherCardProps {
  temperature: number;
  weatherCode: number;
  windSpeed: number;
  humidity: number;
  visibility: number;
  location: string;
  loading: boolean;
  error: string | null;
}

const getWeatherInfo = (code: number) => {
  if (code === 0) return { icon: Sun, desc: "Clear sky" };
  if (code <= 3) return { icon: Cloud, desc: "Partly cloudy" };
  if (code <= 48) return { icon: CloudFog, desc: "Foggy" };
  if (code <= 67) return { icon: CloudDrizzle, desc: "Drizzle" };
  if (code <= 77) return { icon: CloudRain, desc: "Rain" };
  if (code <= 82) return { icon: CloudRain, desc: "Heavy rain" };
  if (code <= 99) return { icon: CloudLightning, desc: "Thunderstorm" };
  return { icon: Cloud, desc: "Cloudy" };
};

export function WeatherCard({
  temperature,
  weatherCode,
  windSpeed,
  humidity,
  visibility,
  location,
  loading,
  error,
}: WeatherCardProps) {
  if (loading) {
    return (
      <div className="bg-card border border-border rounded-xl p-5">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-muted animate-shimmer" />
          <div className="flex-1 space-y-2">
            <div className="h-4 w-32 rounded bg-muted animate-shimmer" />
            <div className="h-3 w-24 rounded bg-muted animate-shimmer" />
          </div>
        </div>
      </div>
    );
  }

  if (error) return null;

  const weatherInfo = getWeatherInfo(weatherCode);
  const WeatherIcon = weatherInfo.icon;

  return (
    <motion.div
      className="bg-card border border-border rounded-xl p-5 sm:p-6"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-muted-foreground font-medium">
            Current Weather
          </p>
          <p className="text-base font-semibold text-foreground mt-0.5">
            {location}
          </p>
        </div>
        <WeatherIcon className="w-6 h-6 text-emerald-600 dark:text-emerald-400 mt-1" />
      </div>

      <div className="flex items-end gap-2 mb-5">
        <span className="text-4xl sm:text-5xl font-bold text-emerald-600 dark:text-emerald-400 leading-none tabular-nums">
          {temperature}°
        </span>
        <span className="text-sm text-muted-foreground mb-1">
          {weatherInfo.desc}
        </span>
      </div>

      <div className="grid grid-cols-3 gap-3">
        {[
          { icon: Wind, label: "Wind", value: `${windSpeed} km/h` },
          { icon: Droplets, label: "Humidity", value: `${humidity}%` },
          { icon: Eye, label: "Visibility", value: `${visibility} km` },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="text-center">
            <Icon className="w-4 h-4 text-muted-foreground mx-auto mb-1.5" />
            <div className="text-[11px] text-muted-foreground font-medium">
              {label}
            </div>
            <div className="text-sm font-semibold text-foreground">{value}</div>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
