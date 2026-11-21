import { createPrayerClock, prayerMoment } from "@/lib/prayerClock";
import {
  adjustPrayerTimes,
  formatPrayerDate,
  isTimings,
  prayerNames,
  prayerQuery,
  shiftPrayerDate,
  type PrayerName,
  type PrayerPlace,
  type PrayerSettings,
} from "@/lib/prayerSchedule";

interface CalendarDay {
  date: string;
  times: { name: PrayerName; time: string; dayOffset: number }[];
}

type Location = Omit<PrayerPlace, "label">;

export async function loadPrayerWeek(
  start: string,
  loaded: CalendarDay[],
  place: Location,
  settings: PrayerSettings,
  signal: AbortSignal,
) {
  const dates = Array.from({ length: 7 }, (_, offset) =>
    shiftPrayerDate(start, offset),
  );
  const days = new Map(
    loaded.filter((day) => day.times.length).map((day) => [day.date, day]),
  );
  const wanted = new Set(dates.filter((date) => !days.has(date)));
  const months = [...new Set([...wanted].map((date) => date.slice(0, 7)))];
  const requestSignal =
    typeof AbortSignal.any === "function"
      ? AbortSignal.any([signal, AbortSignal.timeout(12_000)])
      : signal;
  await Promise.all(
    months.map(async (monthKey) => {
      const [year, month] = monthKey.split("-");
      const response = await fetch(
        `https://api.aladhan.com/v1/calendar/${year}/${Number(month)}?${prayerQuery(place, settings.method)}`,
        { signal: requestSignal },
      );
      if (!response.ok)
        throw new Error(
          "The prayer calendar service didn’t respond. Try again or export the loaded days.",
        );
      const data = await response.json();
      if (data.code !== 200 || !Array.isArray(data.data)) return;
      for (const entry of data.data) {
        const rawDate: unknown = entry?.date?.gregorian?.date;
        if (typeof rawDate !== "string") continue;
        const date = rawDate.split("-").reverse().join("-");
        if (!wanted.has(date)) continue;
        const timings = Object.fromEntries(
          prayerNames.map((name) => {
            const value: unknown = entry?.timings?.[name];
            // The monthly endpoint appends an abbreviation, e.g. "04:05 (WIB)".
            return [
              name,
              typeof value === "string" ? value.trim().split(/\s+/)[0] : null,
            ];
          }),
        );
        if (isTimings(timings))
          days.set(date, {
            date,
            times: adjustPrayerTimes(timings, settings.offsets),
          });
      }
    }),
  );
  return dates.map((date) => {
    const day = days.get(date);
    if (!day)
      throw new Error(
        `No schedule returned for ${formatPrayerDate(date)}. Try exporting the loaded days instead.`,
      );
    return day;
  });
}

function calendarStamp(moment: number) {
  return new Date(moment).toISOString().replace(/[-:]|\.\d{3}/g, "");
}

export function buildPrayerCalendar(
  days: CalendarDay[],
  selected: readonly PrayerName[],
  timeZone: string,
  reminderMinutes: number | null,
  now: number,
) {
  const clock = createPrayerClock(timeZone);
  const events = new Map<string, string[]>();
  for (const day of days) {
    for (const { name, time, dayOffset } of day.times) {
      if (!selected.includes(name)) continue;
      const date = shiftPrayerDate(day.date, dayOffset);
      const moment = prayerMoment(date, time, clock);
      if (moment === null) {
        throw new Error(
          `The adjusted ${name} time on ${formatPrayerDate(date)} cannot be placed in this time zone. Check your offsets.`,
        );
      }
      if (moment <= now) continue;
      const start = calendarStamp(moment);
      const uid = `nur-${name}-${start}@nur-prayer-calendar`;
      const alarm =
        reminderMinutes === null
          ? []
          : [
              "BEGIN:VALARM",
              `TRIGGER:${reminderMinutes === 0 ? "PT0S" : `-PT${reminderMinutes}M`}`,
              "ACTION:DISPLAY",
              `DESCRIPTION:${name} prayer`,
              "END:VALARM",
            ];
      events.set(uid, [
        "BEGIN:VEVENT",
        `UID:${uid}`,
        `DTSTAMP:${calendarStamp(now)}`,
        `DTSTART:${start}`,
        `DTEND:${calendarStamp(moment + 300_000)}`,
        `SUMMARY:${name} prayer`,
        "TRANSP:TRANSPARENT",
        ...alarm,
        "END:VEVENT",
      ]);
    }
  }
  if (!events.size)
    throw new Error(
      "There are no upcoming times for the prayers you selected.",
    );
  return {
    count: events.size,
    content: [
      "BEGIN:VCALENDAR",
      "VERSION:2.0",
      "PRODID:-//Nur//Prayer Schedule//EN",
      "CALSCALE:GREGORIAN",
      "X-WR-CALNAME:Nur Prayer Times",
      ...[...events.values()].flat(),
      "END:VCALENDAR",
      "",
    ].join("\r\n"),
  };
}
