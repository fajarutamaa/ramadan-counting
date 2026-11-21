import { useEffect, useRef, useState, type FormEvent } from "react";
import { CalendarPlus, Download, X } from "lucide-react";
import type { PrayerTimesData } from "@/hooks/usePrayerTimes";
import { buildPrayerCalendar, loadPrayerWeek } from "@/lib/prayerCalendar";
import {
  prayerNames,
  type PrayerName,
  type PrayerSettings,
} from "@/lib/prayerSchedule";

const secondary =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border px-3 text-sm font-semibold text-primary hover:bg-secondary";
const primary =
  "inline-flex min-h-10 items-center justify-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground enabled:cursor-pointer disabled:opacity-55";
const selectClass =
  "min-h-11 w-full rounded-lg border bg-background px-2 text-sm";
type ExportRange = "week" | "loaded";
interface CalendarFile {
  url: string;
  filename: string;
  count: number;
}

export function PrayerCalendarDialog({
  prayers,
  settings,
}: {
  prayers: PrayerTimesData;
  settings: PrayerSettings;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const rangeInput = useRef<HTMLSelectElement>(null);
  const request = useRef<AbortController | null>(null);
  const downloadUrl = useRef("");
  const [range, setRange] = useState<ExportRange>("loaded");
  const [selected, setSelected] = useState<readonly PrayerName[]>(prayerNames);
  const [reminder, setReminder] = useState("10");
  const [file, setFile] = useState<CalendarFile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const canLoadWeek = prayers.online && prayers.activePlace !== null;
  const isReady =
    range === "week"
      ? canLoadWeek
      : !!(prayers.today.times.length || prayers.tomorrow.times.length);

  useEffect(
    () => () => {
      request.current?.abort();
      if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    },
    [],
  );

  function clearFile() {
    if (downloadUrl.current) URL.revokeObjectURL(downloadUrl.current);
    downloadUrl.current = "";
    setFile(null);
    setError("");
  }

  async function prepare(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!isReady || loading || !selected.length) return;
    clearFile();
    const controller = new AbortController();
    request.current?.abort();
    request.current = controller;
    setLoading(true);
    try {
      const loaded = [prayers.today, prayers.tomorrow];
      const days =
        range === "week" && prayers.activePlace
          ? await loadPrayerWeek(
              prayers.today.date,
              loaded,
              prayers.activePlace,
              settings,
              controller.signal,
            )
          : loaded;
      if (controller.signal.aborted) return;
      const { content, count } = buildPrayerCalendar(
        days,
        selected,
        prayers.timeZone,
        reminder === "none" ? null : Number(reminder),
        Date.now(),
      );
      downloadUrl.current = URL.createObjectURL(
        new Blob([content], { type: "text/calendar;charset=utf-8" }),
      );
      setFile({
        url: downloadUrl.current,
        filename: `nur-prayers-${prayers.today.date}.ics`,
        count,
      });
    } catch (failure) {
      if (!controller.signal.aborted) {
        controller.abort();
        setError(
          failure instanceof Error
            ? failure.message
            : "Could not prepare the calendar file.",
        );
        setLoading(false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <>
      <button
        type="button"
        className={secondary}
        aria-haspopup="dialog"
        onClick={() => {
          setRange(canLoadWeek ? "week" : "loaded");
          dialog.current?.showModal();
          rangeInput.current?.focus();
        }}
      >
        <CalendarPlus aria-hidden="true" className="size-4" /> Export calendar
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="prayer-calendar-heading"
        onClose={() => {
          request.current?.abort();
          clearFile();
          setLoading(false);
        }}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 id="prayer-calendar-heading" className="font-display text-2xl">
              Prayer calendar
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Download upcoming prayers for Google Calendar, Apple Calendar, or
              another calendar app.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close prayer calendar"
            onClick={() => dialog.current?.close()}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        <form onSubmit={prepare} className="mt-4 space-y-4">
          <fieldset disabled={loading} className="space-y-4">
            <div className="grid grid-cols-2 gap-2">
              <label className="min-w-0 text-sm font-semibold">
                Date range
                <select
                  ref={rangeInput}
                  value={range}
                  className={`${selectClass} mt-1`}
                  onChange={(e) => {
                    setRange(e.target.value as ExportRange);
                    clearFile();
                  }}
                >
                  <option value="week" disabled={!canLoadWeek}>
                    Next 7 days
                  </option>
                  <option value="loaded">Loaded days (up to 2)</option>
                </select>
              </label>
              <label className="min-w-0 text-sm font-semibold">
                Reminder
                <select
                  value={reminder}
                  className={`${selectClass} mt-1`}
                  onChange={(e) => {
                    setReminder(e.target.value);
                    clearFile();
                  }}
                >
                  <option value="none">None</option>
                  <option value="0">At prayer time</option>
                  {[5, 10, 15, 30].map((value) => (
                    <option key={value} value={value}>
                      {value} min before
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <fieldset>
              <legend className="text-sm font-semibold">
                Prayers to include
              </legend>
              <div className="mt-1 grid grid-cols-2 gap-x-3">
                {prayerNames.map((name) => (
                  <label
                    key={name}
                    className="inline-flex min-h-8 cursor-pointer items-center gap-2 text-sm"
                  >
                    <input
                      type="checkbox"
                      checked={selected.includes(name)}
                      className="size-4 accent-primary"
                      onChange={(e) => {
                        const checked = e.currentTarget.checked;
                        setSelected((previous) =>
                          checked
                            ? [...previous, name]
                            : previous.filter((item) => item !== name),
                        );
                        clearFile();
                      }}
                    />{" "}
                    {name}
                  </label>
                ))}
              </div>
            </fieldset>
          </fieldset>
          <p className="text-xs leading-relaxed text-muted-foreground">
            {prayers.location && (
              <>
                Schedule: {prayers.location} · {prayers.timeZone}.{" "}
              </>
            )}
            Imported events won’t update when you change location or settings.
            Check reminders after importing; some calendar apps replace them.
          </p>
          <div className="flex flex-wrap items-center justify-end gap-2 border-t pt-4">
            {file ? (
              <a
                href={file.url}
                download={file.filename}
                className={`${primary} cursor-pointer`}
              >
                <Download aria-hidden="true" className="size-4" /> Download .ics
              </a>
            ) : (
              <button
                type="submit"
                disabled={!isReady || !selected.length || loading}
                className={primary}
              >
                {loading ? "Preparing…" : "Prepare file"}
              </button>
            )}
          </div>
          <p role="status" className="text-xs text-muted-foreground">
            {error ||
              (file
                ? `${file.count} upcoming ${file.count === 1 ? "prayer" : "prayers"} ready to download.`
                : range === "week" && !canLoadWeek
                  ? "The 7-day export needs an active location and an internet connection. You can try the loaded days instead."
                  : !isReady
                    ? "Choose a location and load a prayer timetable online first."
                    : !selected.length
                      ? "Select at least one prayer."
                      : "")}
          </p>
        </form>
      </dialog>
    </>
  );
}
