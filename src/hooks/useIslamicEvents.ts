import { useEffect, useMemo, useState } from "react";
import { ISLAMIC_EVENTS } from "@/lib/islamicEvents";
import type { HijriDateInfo } from "@/hooks/useHijriDates";

export interface IslamicEvent {
  id: string;
  name: string;
  date: Date;
  type: "event" | "holiday";
  emoji: string;
}

function readEvents(key: string): IslamicEvent[] | null {
  try {
    const data: IslamicEvent[] | null = JSON.parse(
      sessionStorage.getItem(key) ?? "null",
    );
    return Array.isArray(data)
      ? data
          .map((event) => ({ ...event, date: new Date(event.date) }))
          .filter((event) => Number.isFinite(event.date.getTime()))
      : null;
  } catch {
    return null;
  }
}

export function useIslamicEvents(
  baseUrl: string,
  hijri: HijriDateInfo | null,
  online: boolean,
) {
  const [response, setResponse] = useState<{
    key: string;
    events: IslamicEvent[];
  }>();
  const plan = useMemo(
    () =>
      hijri
        ? ISLAMIC_EVENTS.map((event) => ({
            event,
            year:
              event.hijriMonth < hijri.month ||
              (event.hijriMonth === hijri.month && event.hijriDay < hijri.day)
                ? hijri.year + 1
                : hijri.year,
          }))
        : null,
    [hijri],
  );
  const key = plan
    ? `nur.islamicEvents.v2:${plan.map(({ year }) => year).join("-")}`
    : "";

  useEffect(() => {
    if (!plan) return;
    const cached = readEvents(key);
    if (cached) {
      setResponse({ key, events: cached });
      return;
    }
    if (!online) return;

    const controller = new AbortController();
    const { signal } = controller;
    const requestSignal =
      typeof AbortSignal.any === "function"
        ? AbortSignal.any([signal, AbortSignal.timeout(12_000)])
        : signal;
    const schedule = plan;
    async function load() {
      const resolved = await Promise.allSettled(
        schedule.map(async ({ event, year }) => {
          const res = await fetch(
            `${baseUrl}/hToG/${event.hijriMonth}/${event.hijriDay}/${year}`,
            { signal: requestSignal },
          );
          const data = await res.json();
          const value: unknown = data.data?.gregorian?.date;
          if (
            !res.ok ||
            data.code !== 200 ||
            typeof value !== "string" ||
            !/^\d{2}-\d{2}-\d{4}$/.test(value)
          ) {
            throw new Error("Invalid Islamic event date");
          }
          const [day, month, eventYear] = value.split("-").map(Number);
          return {
            id: event.id,
            name: event.name,
            date: new Date(eventYear, month - 1, day),
            type: event.type,
            emoji: event.emoji,
          };
        }),
      );
      if (signal.aborted) return;
      const events = resolved
        .flatMap((result) =>
          result.status === "fulfilled" ? [result.value] : [],
        )
        .sort((a, b) => a.date.getTime() - b.date.getTime());
      setResponse({ key, events });
      if (events.length === schedule.length) {
        try {
          sessionStorage.setItem(key, JSON.stringify(events));
        } catch {
          // Events are still usable in this tab.
        }
      }
    }
    queueMicrotask(() => {
      if (!signal.aborted) void load();
    });
    return () => controller.abort();
  }, [baseUrl, key, online, plan]);

  const current = response?.key === key ? response : undefined;
  return {
    events: current?.events ?? [],
    loading: !!plan && online && !current,
  };
}
