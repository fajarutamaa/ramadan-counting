import { useState, useCallback } from "react";

interface ActivityEntry {
  type: "mosque" | "qibla" | "prayer" | "tasbih" | "verse" | "calendar";
  label: string;
  meta?: string;
  timestamp: number;
}

const STORAGE_KEY = "nur_activity";
const MAX_ITEMS = 10;

function load(): ActivityEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: ActivityEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useActivity() {
  const [entries, setEntries] = useState<ActivityEntry[]>(load);

  const track = useCallback((entry: Omit<ActivityEntry, "timestamp">) => {
    const newEntry: ActivityEntry = { ...entry, timestamp: Date.now() };
    setEntries((prev) => {
      const filtered = prev.filter(
        (e) => e.type !== entry.type || e.label !== entry.label,
      );
      const next = [newEntry, ...filtered].slice(0, MAX_ITEMS);
      save(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    setEntries([]);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  return { entries, track, clear };
}
