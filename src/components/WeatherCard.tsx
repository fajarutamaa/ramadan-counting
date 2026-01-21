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

// Weather code mapping to icons and descriptions
const getWeatherInfo = (code: number) => {
  if (code === 0)
    return {
      icon: Sun,
      desc: "Clear sky",
      gradient: "from-yellow-400/20 to-orange-400/20",
    };
  if (code <= 3)
    return {
      icon: Cloud,
      desc: "Partly cloudy",
      gradient: "from-blue-400/20 to-slate-400/20",
    };
  if (code <= 48)
    return {
      icon: CloudFog,
      desc: "Foggy",
      gradient: "from-slate-400/20 to-gray-400/20",
    };
  if (code <= 67)
    return {
      icon: CloudDrizzle,
      desc: "Drizzle",
      gradient: "from-blue-400/20 to-cyan-400/20",
    };
  if (code <= 77)
    return {
      icon: CloudRain,
      desc: "Rain",
      gradient: "from-blue-500/20 to-indigo-400/20",
    };
  if (code <= 82)
    return {
      icon: CloudRain,
      desc: "Heavy rain",
      gradient: "from-blue-600/20 to-indigo-500/20",
    };
  if (code <= 99)
    return {
      icon: CloudLightning,
      desc: "Thunderstorm",
      gradient: "from-purple-400/20 to-indigo-500/20",
    };
  return {
    icon: Cloud,
    desc: "Cloudy",
    gradient: "from-slate-400/20 to-gray-400/20",
  };
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
      <motion.div
        className="bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-5 shadow-md border border-slate-200/40 dark:border-slate-700/40"
        variants={fadeIn}
        initial="hidden"
        animate="visible"
      >
        <div className="flex items-center gap-4">
          <div className="relative w-16 h-16 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded-full overflow-hidden">
            <div className="absolute inset-0 animate-shimmer-skeleton" />
          </div>
          <div className="flex-1 space-y-2">
            <div className="relative h-6 w-32 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
            <div className="relative h-4 w-24 bg-gradient-to-r from-slate-200/50 via-slate-300/80 to-slate-200/50 dark:from-slate-700/50 dark:via-slate-600/80 dark:to-slate-700/50 rounded overflow-hidden">
              <div className="absolute inset-0 animate-shimmer-skeleton" />
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return null;
  }

  const weatherInfo = getWeatherInfo(weatherCode);
  const WeatherIcon = weatherInfo.icon;

  return (
    <motion.div
      className={`relative overflow-hidden bg-gradient-to-br ${weatherInfo.gradient} bg-white/60 dark:bg-slate-800/60 backdrop-blur-md rounded-xl p-5 shadow-md border border-slate-200/40 dark:border-slate-700/40`}
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* Location Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">
            Current Weather
          </h3>
          <p className="text-lg font-semibold text-slate-800 dark:text-slate-100">
            {location}
          </p>
        </div>
        <div className="p-3 bg-white/50 dark:bg-slate-700/50 rounded-full">
          <WeatherIcon className="w-8 h-8 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>

      {/* Temperature & Condition */}
      <div className="flex items-end gap-3 mb-4">
        <div className="text-5xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-400 dark:to-teal-400 bg-clip-text text-transparent">
          {temperature}°
        </div>
        <div className="text-lg text-slate-600 dark:text-slate-300 mb-2">
          {weatherInfo.desc}
        </div>
      </div>

      {/* Weather Details Grid */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white/40 dark:bg-slate-700/40 rounded-lg p-3 text-center">
          <Wind className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">
            Wind
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {windSpeed} km/h
          </div>
        </div>

        <div className="bg-white/40 dark:bg-slate-700/40 rounded-lg p-3 text-center">
          <Droplets className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">
            Humidity
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {humidity}%
          </div>
        </div>

        <div className="bg-white/40 dark:bg-slate-700/40 rounded-lg p-3 text-center">
          <Eye className="w-4 h-4 text-emerald-600 dark:text-emerald-400 mx-auto mb-1" />
          <div className="text-xs text-slate-600 dark:text-slate-400 mb-0.5">
            Visibility
          </div>
          <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
            {visibility} km
          </div>
        </div>
      </div>
    </motion.div>
  );
}
