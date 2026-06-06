import { useState, useCallback } from "react";

interface FavoriteItem {
  id: string;
  type: "mosque" | "tool" | "city";
  label: string;
  meta?: string;
}

const STORAGE_KEY = "nur_favorites";

function load(): FavoriteItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function save(items: FavoriteItem[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function useFavorites() {
  const [items, setItems] = useState<FavoriteItem[]>(load);

  const isFavorite = useCallback(
    (id: string) => items.some((f) => f.id === id),
    [items],
  );

  const toggle = useCallback((item: FavoriteItem) => {
    setItems((prev) => {
      const exists = prev.some((f) => f.id === item.id);
      const next = exists
        ? prev.filter((f) => f.id !== item.id)
        : [...prev, item];
      save(next);
      return next;
    });
  }, []);

  const remove = useCallback((id: string) => {
    setItems((prev) => {
      const next = prev.filter((f) => f.id !== id);
      save(next);
      return next;
    });
  }, []);

  const byType = useCallback(
    (type: FavoriteItem["type"]) => items.filter((f) => f.type === type),
    [items],
  );

  return { items, isFavorite, toggle, remove, byType };
}
