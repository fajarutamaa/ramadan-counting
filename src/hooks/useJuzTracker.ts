import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface JuzTrackerData {
  currentYear: string;
  completedJuz: number[];
  totalCompleted: number;
  suggestedJuz: number;
  records: Record<string, number[]>;
  years: string[];
  toggleJuz: (juzNumber: number) => void;
  isComplete: boolean;
}

export function useJuzTracker(hijriYear: string | number): JuzTrackerData {
  const year = String(hijriYear);
  const [records, setRecords] = useLocalStorage<Record<string, number[]>>(
    "juzTracker",
    {},
  );

  const completedJuz = useMemo(() => records[year] ?? [], [records, year]);

  const totalCompleted = completedJuz.length;
  const isComplete = totalCompleted >= 30;

  const years = useMemo(() => Object.keys(records).sort(), [records]);

  const suggestedJuz = useMemo(() => {
    if (!year) return 1;
    for (let i = 1; i <= 30; i++) {
      if (!completedJuz.includes(i)) return i;
    }
    return 30;
  }, [completedJuz, year]);

  const toggleJuz = useCallback(
    (juzNumber: number) => {
      setRecords((prev) => {
        const current = prev[year] ?? [];
        const next = current.includes(juzNumber)
          ? current.filter((j) => j !== juzNumber)
          : [...current, juzNumber].sort((a, b) => a - b);
        return { ...prev, [year]: next };
      });
    },
    [year, setRecords],
  );

  return {
    currentYear: year,
    completedJuz,
    totalCompleted,
    suggestedJuz,
    records,
    years,
    toggleJuz,
    isComplete,
  };
}
