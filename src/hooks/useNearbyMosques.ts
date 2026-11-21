import { useEffect, useState } from "react";
import type { Coords } from "@/hooks/useGeolocation";
import { fetchNearbyMosques, type Mosque } from "@/lib/mosqueApi";

export interface NearbyMosques {
  results: Mosque[] | null;
  loading: boolean;
  error: boolean;
  retry: () => void;
}

export function useNearbyMosques(coords: Coords | null): NearbyMosques {
  const [revision, setRevision] = useState(0);
  const [response, setResponse] = useState<{
    key: string;
    results: Mosque[] | null;
  }>();
  const key = coords ? `${coords.lat},${coords.lon},${revision}` : null;
  const { lat, lon } = coords ?? {};

  useEffect(() => {
    if (lat === undefined || lon === undefined || key === null) return;
    const controller = new AbortController();
    // Skip the throwaway request during StrictMode's first effect.
    queueMicrotask(async () => {
      if (controller.signal.aborted) return;
      try {
        const results = await fetchNearbyMosques(lat, lon, controller.signal);
        if (!controller.signal.aborted) setResponse({ key, results });
      } catch {
        if (!controller.signal.aborted) setResponse({ key, results: null });
      }
    });
    return () => controller.abort();
  }, [key, lat, lon]);

  const current = response?.key === key ? response : undefined;
  return {
    results: current?.results ?? null,
    loading: key !== null && !current,
    error: !!current && current.results === null,
    retry: () => setRevision((value) => value + 1),
  };
}
