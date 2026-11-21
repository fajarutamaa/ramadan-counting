import { CalendarCheck, Moon, Sparkles } from "lucide-react";
import { useFastTracker, type FastStatus } from "@/hooks/useFastTracker";
import { formatPrayerDate } from "@/lib/prayerSchedule";
import { cn } from "@/lib/utils";

const checkIns = [
  { value: "fasted", label: "Fasted" },
  { value: "not-fasted", label: "Skipped" },
  { value: "excused", label: "Excused" },
] as const satisfies ReadonlyArray<{ value: FastStatus; label: string }>;

export function FastingTracker({
  date,
  ramadanDay,
}: {
  date: string;
  ramadanDay: number;
}) {
  const tracker = useFastTracker(date, ramadanDay);

  return (
    <div className="rounded-2xl border bg-card p-4 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-2">
        <div>
          <h3 className="flex items-center gap-2 text-sm font-semibold">
            <CalendarCheck aria-hidden="true" className="size-4 text-primary" />
            Fasting log
          </h3>
          <p className="mt-1 text-xs text-muted-foreground">
            Your check-ins are saved on this device.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Ramadan dates may differ from local moon sightings.
          </p>
        </div>
        <p className="inline-flex items-center gap-1.5 rounded-lg bg-secondary px-2.5 py-1 text-xs font-semibold text-primary">
          <Moon aria-hidden="true" className="size-3.5" /> Ramadan day{" "}
          {ramadanDay}
        </p>
      </div>
      <p className="mt-4 text-sm font-semibold">
        Today's check-in · <time dateTime={date}>{formatPrayerDate(date)}</time>
      </p>
      <div
        role="group"
        aria-label="Fast status"
        className="mt-2 grid grid-cols-3 gap-2"
      >
        {checkIns.map(({ value, label }) => (
          <button
            key={value}
            type="button"
            aria-pressed={tracker.todayStatus === value}
            onClick={() => tracker.setTodayStatus(value)}
            className={cn(
              "min-h-11 min-w-0 cursor-pointer rounded-lg border px-1 text-xs font-semibold transition-colors sm:text-sm",
              tracker.todayStatus === value
                ? "border-primary bg-primary text-primary-foreground"
                : "text-primary hover:bg-secondary",
            )}
          >
            {label}
          </button>
        ))}
      </div>
      {tracker.todayStatus && (
        <button
          type="button"
          onClick={() => tracker.setTodayStatus(null)}
          className="mt-2 min-h-8 cursor-pointer text-xs font-semibold text-muted-foreground hover:text-primary hover:underline"
        >
          Clear today's check-in
        </button>
      )}
      <dl className="mt-4 grid grid-cols-3 gap-2 border-t pt-4 text-center">
        {[
          { label: "Days fasted", value: tracker.totalFasted },
          { label: "Current streak", value: tracker.currentStreak },
          { label: "Best streak", value: tracker.bestStreak },
        ].map(({ label, value }) => (
          <div key={label} className="rounded-lg bg-secondary/55 px-1.5 py-2">
            <dt className="text-xs text-muted-foreground">{label}</dt>
            <dd className="mt-0.5 text-lg font-semibold tabular-nums">
              {value}
            </dd>
          </div>
        ))}
      </dl>
      {tracker.entries.length > 0 && (
        <details className="mt-3">
          <summary className="cursor-pointer py-2 text-sm font-semibold text-primary">
            View this Ramadan’s check-ins
          </summary>
          <ol className="divide-y rounded-lg border px-3">
            {tracker.entries.map((entry) => (
              <li
                key={entry.date}
                className="flex flex-wrap items-center justify-between gap-2 py-2.5 text-xs"
              >
                <span>
                  Day {entry.day} ·{" "}
                  <time dateTime={entry.date}>
                    {formatPrayerDate(entry.date)}
                  </time>
                </span>
                <span className="inline-flex items-center gap-1.5 font-semibold text-muted-foreground">
                  {entry.status === "fasted" && (
                    <Sparkles
                      aria-hidden="true"
                      className="size-3.5 shrink-0 text-primary"
                    />
                  )}
                  {checkIns.find(({ value }) => value === entry.status)?.label}
                </span>
              </li>
            ))}
          </ol>
        </details>
      )}
    </div>
  );
}
