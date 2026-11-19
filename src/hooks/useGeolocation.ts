import { useEffect, useState } from "react";

export interface Coords {
  lat: number;
  lon: number;
}

interface GeolocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(
  enabled: boolean,
  requestVersion: number,
): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!enabled) return;
    let canceled = false;
    if (!requestVersion) {
      try {
        const cached = sessionStorage.getItem("coords");
        if (cached) {
          const parsed = JSON.parse(cached) as Coords;
          if (Number.isFinite(parsed?.lat) && Number.isFinite(parsed?.lon)) {
            setState({ coords: parsed, loading: false, error: null });
            return;
          }
        }
      } catch {
        // The browser may block storage; try geolocation anyway.
      }
    }

    if (!navigator.geolocation) {
      setState({
        coords: null,
        loading: false,
        error: "Geolocation not supported by this browser",
      });
      return;
    }

    const onSuccess = (pos: GeolocationPosition) => {
      if (canceled) return;
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      try {
        sessionStorage.setItem("coords", JSON.stringify(coords));
      } catch {
        // Location still works without caching.
      }
      setState({ coords, loading: false, error: null });
    };

    const onError = (err: GeolocationPositionError) => {
      if (canceled) return;
      setState({
        coords: null,
        loading: false,
        error: err.message || "Unable to retrieve location",
      });
    };

    const options: PositionOptions = {
      enableHighAccuracy: false,
      timeout: 5000,
      maximumAge: 1000 * 60 * 5,
    };

    setState({ coords: null, loading: true, error: null });
    // Defer so StrictMode's first effect can clean up before requesting GPS.
    queueMicrotask(() => {
      if (!canceled)
        navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
    });
    return () => {
      canceled = true;
    };
  }, [enabled, requestVersion]);

  return state;
}
