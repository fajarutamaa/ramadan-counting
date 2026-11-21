import { useState } from "react";
import { CalendarDays, Clock, Compass, MapPin } from "lucide-react";
import { PrayerSettingsDialog } from "@/components/PrayerSettingsDialog";
import { PrayerCalendarDialog } from "@/components/PrayerCalendarDialog";
import type { PrayerTimesData } from "@/hooks/usePrayerTimes";
import {
  formatPrayerDate,
  getPrayerMethodName,
  type PrayerSettings,
} from "@/lib/prayerSchedule";
import { cn } from "@/lib/utils";

interface PrayerTimesProps {
  prayers: PrayerTimesData;
  settings: PrayerSettings;
  onSaveSettings: (settings: PrayerSettings) => void;
}

export function PrayerTimes({
  prayers,
  settings,
  onSaveSettings,
}: PrayerTimesProps) {
  const [view, setView] = useState<"today" | "tomorrow">("today");
  const {
    location,
    timeZone,
    online,
    canRefresh,
    usingLastDevice,
    nextPrayer,
    minutesUntilNext,
  } = prayers;
  const day = prayers[view];
  const adjusted = Object.values(settings.offsets).some(
    (minutes) => minutes !== 0,
  );

  return (
    <div className="rounded-2xl border bg-card">
      <div className="p-4 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <Clock aria-hidden="true" className="size-4 text-primary" />
              Prayer times
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">
              {getPrayerMethodName(settings.method)}
              {adjusted && " · manual adjustments"}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <PrayerCalendarDialog
              key={JSON.stringify([
                prayers.today.date,
                prayers.activePlace,
                prayers.timeZone,
                settings,
              ])}
              prayers={prayers}
              settings={settings}
            />
            <PrayerSettingsDialog settings={settings} onSave={onSaveSettings} />
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t pt-4">
          <div
            role="group"
            aria-label="Schedule day"
            className="flex gap-1 rounded-lg bg-secondary p-1"
          >
            {(["today", "tomorrow"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={option === view}
                onClick={() => setView(option)}
                className={cn(
                  "min-h-9 cursor-pointer rounded-md px-3 text-sm font-semibold capitalize",
                  view === option
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
          <div className="min-w-0 text-xs text-muted-foreground sm:text-right">
            <time dateTime={day.date} className="font-semibold text-foreground">
              {formatPrayerDate(day.date)}
            </time>
            {location && (
              <p className="mt-0.5 wrap-break-word">
                {usingLastDevice && "Last saved location: "}
                {location} · {timeZone}
              </p>
            )}
          </div>
        </div>

        {day.times.length > 0 ? (
          <>
            <ul
              aria-label={`${view} prayer timetable`}
              className="mt-4 grid grid-cols-3 gap-2 sm:grid-cols-5"
            >
              {day.times.map((prayer) => (
                <li
                  key={prayer.name}
                  className={cn(
                    "rounded-lg p-2.5 text-center sm:p-3",
                    prayer.isCurrent
                      ? "bg-primary text-primary-foreground"
                      : prayer.isNext
                        ? "bg-secondary text-primary ring-1 ring-primary/35"
                        : "bg-secondary/60 text-secondary-foreground",
                  )}
                >
                  <div className="mb-1 text-xs font-medium">{prayer.name}</div>
                  <div className="text-base leading-none font-bold tabular-nums">
                    {prayer.time}
                  </div>
                  {prayer.dayOffset !== 0 && (
                    <span className="mt-1 block text-[11px]">
                      {prayer.dayOffset < 0 ? "Previous day" : "Next day"}
                    </span>
                  )}
                  {prayer.isCurrent && (
                    <span className="mt-1 block text-[11px]">Current</span>
                  )}
                  {prayer.isNext && (
                    <span className="mt-1 block text-[11px]">Next</span>
                  )}
                </li>
              ))}
            </ul>
            {day.fromCache && (
              <p role="status" className="mt-3 text-xs text-muted-foreground">
                {online
                  ? "Showing the saved schedule."
                  : "Offline · showing the saved schedule."}
              </p>
            )}
          </>
        ) : (
          <div className="mt-4 rounded-lg border border-dashed p-4">
            <p role="status" className="text-sm text-muted-foreground">
              {day.loading
                ? "Loading prayer times…"
                : !online
                  ? "No saved schedule for this location, date, and method. Open it online first."
                  : !location
                    ? "Choose a city or allow device location to see your prayer schedule."
                    : usingLastDevice
                      ? "No schedule saved for this date and method. Set your location to load it."
                      : "The prayer service didn’t respond for this date."}
            </p>
            {!day.loading && canRefresh && (
              <button
                type="button"
                onClick={prayers.retry}
                className="mt-2 min-h-9 cursor-pointer text-sm font-semibold text-primary hover:underline"
              >
                Try again
              </button>
            )}
            {!day.loading && !canRefresh && online && (
              <a
                href="#location-control"
                className="mt-2 inline-block text-sm font-semibold text-primary hover:underline"
              >
                Set location
              </a>
            )}
          </div>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          Schedules that load successfully are kept on this device for offline
          use.
        </p>
      </div>

      {view === "today" && nextPrayer && (
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t px-4 py-2 sm:px-6">
          {minutesUntilNext !== null && minutesUntilNext < 60 && (
            <a
              href="#mosques"
              className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
            >
              <MapPin aria-hidden="true" className="size-3.5" />
              {nextPrayer.name} in {minutesUntilNext} min · Nearby mosques
            </a>
          )}
          <a
            href="#qibla"
            className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <Compass aria-hidden="true" className="size-3.5" />
            Qibla direction
          </a>
          <a
            href="#calendar"
            className="inline-flex min-h-9 items-center gap-1.5 text-xs font-medium text-primary hover:underline"
          >
            <CalendarDays aria-hidden="true" className="size-3.5" />
            Islamic calendar
          </a>
        </div>
      )}
    </div>
  );
}
