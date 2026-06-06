import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export type FastStatus = "fasted" | "not-fasted" | "excused";

export interface FastRecord {
  [date: string]: FastStatus;
}

export interface FastTrackerData {
  records: FastRecord;
  today: string;
  todayStatus: FastStatus | null;
  currentStreak: number;
  longestStreak: number;
  totalFasted: number;
  ramadanDaysElapsed: number;
  setTodayStatus: (status: FastStatus) => void;
}

function getDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function calculateStreaks(
  records: FastRecord,
  ramadanStart: string,
): { currentStreak: number; longestStreak: number } {
  // Build a set of fasted dates from ramadanStart onwards
  const sortedDates = Object.entries(records)
    .filter(([date, status]) => date >= ramadanStart && status === "fasted")
    .map(([date]) => date)
    .sort();

  if (sortedDates.length === 0) return { currentStreak: 0, longestStreak: 0 };

  // Calculate longest streak
  let longestStreak = 1;
  let currentRun = 1;
  for (let i = 1; i < sortedDates.length; i++) {
    const prev = new Date(sortedDates[i - 1]);
    const curr = new Date(sortedDates[i]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / 86400000);
    if (diffDays === 1) {
      currentRun++;
      longestStreak = Math.max(longestStreak, currentRun);
    } else {
      currentRun = 1;
    }
  }
  longestStreak = Math.max(longestStreak, currentRun);

  // Calculate current streak (consecutive from today backwards)
  const today = getDateKey(new Date());
  const todayDate = new Date(today);
  let currentStreak = 0;
  for (
    let d = new Date(todayDate);
    d >= new Date(ramadanStart);
    d.setDate(d.getDate() - 1)
  ) {
    const key = getDateKey(d);
    if (records[key] === "fasted") {
      currentStreak++;
    } else if (
      records[key] !== undefined ||
      d.getTime() < todayDate.getTime()
    ) {
      // If the day has passed and it's not fasted, streak breaks
      // But if it's today and not yet decided, don't break
      if (d.getTime() < todayDate.getTime()) break;
    } else {
      break;
    }
  }

  return { currentStreak, longestStreak };
}

export function useFastTracker(ramadanStart: Date | null): FastTrackerData {
  const [records, setRecords] = useLocalStorage<FastRecord>("fastTracker", {});
  const today = getDateKey(new Date());

  const ramadanStartKey = ramadanStart ? getDateKey(ramadanStart) : "";

  const todayStatus =
    records[today] !== undefined ? (records[today] as FastStatus) : null;

  const setTodayStatus = useCallback(
    (status: FastStatus) => {
      setRecords((prev) => {
        const next = { ...prev, [today]: status };
        return next;
      });
    },
    [today, setRecords],
  );

  const { currentStreak, longestStreak } = useMemo(
    () => calculateStreaks(records, ramadanStartKey),
    [records, ramadanStartKey],
  );

  const totalFasted = useMemo(
    () =>
      Object.entries(records)
        .filter(([, status]) => status === "fasted")
        .filter(([date]) => !ramadanStartKey || date >= ramadanStartKey).length,
    [records, ramadanStartKey],
  );

  const ramadanDaysElapsed = useMemo(() => {
    if (!ramadanStart) return 0;
    const start = new Date(ramadanStart);
    start.setHours(0, 0, 0, 0);
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    return Math.max(
      0,
      Math.round((now.getTime() - start.getTime()) / 86400000) + 1,
    );
  }, [ramadanStart]);

  return {
    records,
    today,
    todayStatus,
    currentStreak,
    longestStreak,
    totalFasted,
    ramadanDaysElapsed,
    setTodayStatus,
  };
}
