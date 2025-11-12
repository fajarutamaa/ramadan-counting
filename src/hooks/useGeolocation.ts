import { useEffect, useState, useRef } from "react";

export interface Coords {
  lat: number;
  lon: number;
}

interface GeolocationState {
  coords: Coords | null;
  loading: boolean;
  error: string | null;
}

export function useGeolocation(): GeolocationState {
  const [state, setState] = useState<GeolocationState>({
    coords: null,
    loading: true,
    error: null,
  });

  const fetchedRef = useRef(false);

  useEffect(() => {
    if (fetchedRef.current) return;
    fetchedRef.current = true;

    const cached = sessionStorage.getItem("coords");
    if (cached) {
      const parsed = JSON.parse(cached) as Coords;
      setState({ coords: parsed, loading: false, error: null });
      return;
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
      const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
      sessionStorage.setItem("coords", JSON.stringify(coords));
      setState({ coords, loading: false, error: null });
    };

    const onError = (err: GeolocationPositionError) => {
      console.warn("Geolocation failed:", err.message);
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

    navigator.geolocation.getCurrentPosition(onSuccess, onError, options);
  }, []);

  return state;
}
