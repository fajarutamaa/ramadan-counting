import { useEffect, useRef, useState, type FormEvent } from "react";
import { LocateFixed, MapPin, Search, X } from "lucide-react";
import { searchCities, type CityLocation } from "@/lib/citySearch";

export interface LocationPickerProps {
  city: CityLocation | null;
  onSelectCity: (city: CityLocation) => void;
  onUseDeviceLocation: () => void;
}

export function LocationPicker({
  city,
  onSelectCity,
  onUseDeviceLocation,
  hasLocation,
}: LocationPickerProps & { hasLocation: boolean }) {
  const dialog = useRef<HTMLDialogElement>(null);
  const searchInput = useRef<HTMLInputElement>(null);
  const request = useRef<AbortController | null>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<CityLocation[]>([]);
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => () => request.current?.abort(), []);

  function resetSearch() {
    request.current?.abort();
    request.current = null;
    setQuery("");
    setResults([]);
    setStatus("");
    setLoading(false);
  }

  async function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmed = query.trim();
    if (trimmed.length < 2) return;

    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    setResults([]);
    setLoading(true);
    setStatus("Searching…");

    try {
      const cities = await searchCities(trimmed, controller.signal);
      if (controller.signal.aborted) return;
      setResults(cities);
      setStatus(
        cities.length
          ? `${cities.length} cities found.`
          : "No cities found. Try another spelling.",
      );
    } catch {
      if (!controller.signal.aborted)
        setStatus("City search is unavailable. Try again in a moment.");
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }

  return (
    <>
      <button
        id="location-control"
        type="button"
        aria-haspopup="dialog"
        onClick={() => {
          dialog.current?.showModal();
          searchInput.current?.focus();
        }}
        className="inline-flex min-h-9 cursor-pointer items-center gap-2 rounded-lg border border-white/25 bg-white/10 px-3 text-sm font-semibold text-white transition-colors hover:bg-white/20"
      >
        <MapPin aria-hidden="true" className="size-4" />
        {hasLocation ? "Change location" : "Choose a city"}
      </button>
      <dialog
        ref={dialog}
        aria-labelledby="location-picker-heading"
        onClose={resetSearch}
        className="fixed inset-0 m-auto max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl border bg-card p-5 text-foreground shadow-xl backdrop:bg-black/50 sm:p-6"
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 id="location-picker-heading" className="font-display text-2xl">
              Choose a location
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Use a city for local prayer times, weather, and nearby mosques.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close location picker"
            onClick={() => dialog.current?.close()}
            className="grid size-9 shrink-0 cursor-pointer place-items-center rounded-lg hover:bg-secondary"
          >
            <X aria-hidden="true" className="size-4" />
          </button>
        </div>
        {city && (
          <p className="mt-3 text-sm text-muted-foreground">
            Selected: <strong>{city.name}</strong>
          </p>
        )}
        <form onSubmit={handleSearch} className="mt-4">
          <label htmlFor="city-search" className="text-sm font-semibold">
            City name
          </label>
          <div className="mt-1.5 flex gap-2">
            <input
              id="city-search"
              ref={searchInput}
              type="search"
              value={query}
              onChange={(event) => {
                resetSearch();
                setQuery(event.target.value);
              }}
              placeholder="e.g. Jakarta"
              autoComplete="off"
              maxLength={100}
              className="min-h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm"
            />
            <button
              type="submit"
              disabled={loading || query.trim().length < 2}
              className="inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground enabled:cursor-pointer disabled:opacity-55"
            >
              <Search aria-hidden="true" className="size-4" />
              Search
            </button>
          </div>
        </form>
        <p role="status" className="mt-2 text-sm text-muted-foreground">
          {status}
        </p>
        {results.length > 0 && (
          <ul className="mt-2 divide-y rounded-lg border">
            {results.map((result) => (
              <li key={result.id}>
                <button
                  type="button"
                  onClick={() => {
                    onSelectCity(result);
                    dialog.current?.close();
                  }}
                  className="flex w-full cursor-pointer items-center gap-3 p-3 text-left hover:bg-secondary focus-visible:-outline-offset-2"
                >
                  <MapPin
                    aria-hidden="true"
                    className="size-4 shrink-0 text-primary"
                  />
                  <span className="min-w-0 text-sm font-semibold">
                    {result.name}
                    {result.region && (
                      <span className="block text-xs font-normal text-muted-foreground">
                        {result.region}
                      </span>
                    )}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          onClick={() => {
            onUseDeviceLocation();
            dialog.current?.close();
          }}
          className="mt-4 inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-lg border px-3 text-sm font-semibold text-primary hover:bg-secondary"
        >
          <LocateFixed aria-hidden="true" className="size-4" />
          Use device location
        </button>
        <p className="mt-3 text-xs text-muted-foreground">
          City data:{" "}
          <a href="https://www.geonames.org/" className="underline">
            GeoNames
          </a>{" "}
          via{" "}
          <a href="https://open-meteo.com/" className="underline">
            Open-Meteo
          </a>
          .
        </p>
      </dialog>
    </>
  );
}
