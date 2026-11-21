export function createPrayerClock(timeZone: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
}

// Resolve AlAdhan's local wall time in the selected city's zone, not the
// viewer's device zone. Don't guess a timestamp in a skipped DST hour.
export function prayerMoment(
  date: string,
  time: string,
  clock: Intl.DateTimeFormat,
): number | null {
  const wallTime = Date.parse(`${date}T${time}:00Z`);
  if (!Number.isFinite(wallTime)) return null;
  let candidate = wallTime;
  for (let attempt = 0; attempt < 4; attempt++) {
    const parts = Object.fromEntries(
      clock.formatToParts(candidate).map(({ type, value }) => [type, value]),
    );
    const rendered = Date.parse(
      `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}:00Z`,
    );
    if (rendered === wallTime) return candidate;
    candidate += wallTime - rendered;
  }
  return null;
}
