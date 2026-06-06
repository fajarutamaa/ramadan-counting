import { useCallback, useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";

export interface DhikrDef {
  id: string;
  label: string;
  target: number;
  transliteration: string;
}

export const DEFAULT_DHIKR_LIST: DhikrDef[] = [
  {
    id: "subhanallah",
    label: "SubhanAllah",
    target: 33,
    transliteration: "sub-ḥān-allāh",
  },
  {
    id: "alhamdulillah",
    label: "Alhamdulillah",
    target: 33,
    transliteration: "al-ḥam-du-lil-lāh",
  },
  {
    id: "allahuakbar",
    label: "Allahu Akbar",
    target: 34,
    transliteration: "al-lā-hu-ak-bar",
  },
  {
    id: "la-ilaha-illallah",
    label: "La ilaha illallah",
    target: 100,
    transliteration: "lā i-lā-ha il-lal-lāh",
  },
  {
    id: "astaghfirullah",
    label: "Astaghfirullah",
    target: 100,
    transliteration: "as-tagh-fi-rul-lāh",
  },
];

type DailyCounts = Record<string, number>; // dhikr id → count for today

export interface TasbihData {
  counts: DailyCounts;
  todayTotal: number;
  currentDhikr: DhikrDef;
  currentCount: number;
  goal: number;
  dhikrList: DhikrDef[];
  setActiveDhikr: (id: string) => void;
  increment: () => void;
  resetCurrent: () => void;
  setGoal: (goal: number) => void;
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

export function useTasbih(): TasbihData {
  const [activeDhikrId, setActiveDhikrId] = useLocalStorage<string>(
    "tasbihActiveDhikr",
    "subhanallah",
  );

  // { "2026-03-10": { "subhanallah": 15, "alhamdulillah": 33, ... } }
  const [history, setHistory] = useLocalStorage<Record<string, DailyCounts>>(
    "tasbihHistory",
    {},
  );

  const [goal, setGoal] = useLocalStorage<number>("tasbihGoal", 100);

  const today = useMemo(todayKey, []);

  const todayCounts = useMemo<DailyCounts>(
    () => history[today] ?? {},
    [history, today],
  );

  const todayTotal = useMemo(
    () => Object.values(todayCounts).reduce((sum, c) => sum + c, 0),
    [todayCounts],
  );

  const currentDhikr = useMemo(
    () =>
      DEFAULT_DHIKR_LIST.find((d) => d.id === activeDhikrId) ??
      DEFAULT_DHIKR_LIST[0],
    [activeDhikrId],
  );

  const currentCount = todayCounts[currentDhikr.id] ?? 0;

  const saveCounts = useCallback(
    (counts: DailyCounts) => {
      setHistory((prev) => ({ ...prev, [today]: counts }));
    },
    [today, setHistory],
  );

  const setActiveDhikr = useCallback(
    (id: string) => {
      setActiveDhikrId(id);
    },
    [setActiveDhikrId],
  );

  const increment = useCallback(() => {
    setHistory((prev) => {
      const dayCounts: DailyCounts = prev[today] ?? {};
      const current = dayCounts[currentDhikr.id] ?? 0;
      const next = current + 1;
      return {
        ...prev,
        [today]: { ...dayCounts, [currentDhikr.id]: next },
      };
    });
  }, [today, currentDhikr.id, setHistory]);

  const resetCurrent = useCallback(() => {
    saveCounts({ ...todayCounts, [currentDhikr.id]: 0 });
  }, [saveCounts, todayCounts, currentDhikr.id]);

  return {
    counts: todayCounts,
    todayTotal,
    currentDhikr,
    currentCount,
    goal,
    dhikrList: DEFAULT_DHIKR_LIST,
    setActiveDhikr,
    increment,
    resetCurrent,
    setGoal,
  };
}
