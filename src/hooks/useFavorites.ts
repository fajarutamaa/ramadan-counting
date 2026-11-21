import { useMemo } from "react";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import type { Mosque } from "@/lib/mosqueApi";

interface FavoriteItem {
  id: string;
  type: "mosque" | "tool" | "city";
  label: string;
  meta?: string;
  place?: Pick<Mosque, "lat" | "lon" | "address" | "kind">;
}

function snapshot({ id, name, lat, lon, address, kind }: Mosque): FavoriteItem {
  return {
    id,
    label: name,
    type: "mosque",
    place: { lat, lon, address, kind },
  };
}

export function useFavorites() {
  const [stored, setItems] = useLocalStorage<FavoriteItem[]>(
    "nur_favorites",
    [],
  );
  const items = useMemo(() => (Array.isArray(stored) ? stored : []), [stored]);
  const saved = useMemo(
    () =>
      items.filter(
        (item) =>
          item?.type === "mosque" &&
          typeof item.id === "string" &&
          typeof item.label === "string",
      ),
    [items],
  );

  return {
    saved,
    isSaved: (id: string) => saved.some((item) => item.id === id),
    toggleMosque(mosque: Mosque) {
      setItems(
        saved.some(({ id }) => id === mosque.id)
          ? items.filter(
              (item) => item?.type !== "mosque" || item.id !== mosque.id,
            )
          : [...items, snapshot(mosque)],
      );
    },
    removeMosque(id: string) {
      setItems(
        items.filter((item) => item?.type !== "mosque" || item.id !== id),
      );
    },
    rememberMosque(mosque: Mosque) {
      const index = items.findIndex(
        (item) =>
          item?.type === "mosque" && item.id === mosque.id && !item.place,
      );
      if (index !== -1)
        setItems(
          items.map((item, i) => (i === index ? snapshot(mosque) : item)),
        );
    },
  };
}
