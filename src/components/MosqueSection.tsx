import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import {
  Check,
  Copy,
  Heart,
  LocateFixed,
  MapPin,
  Navigation,
  Search,
  X,
} from "lucide-react";
import type { LatLngTuple } from "leaflet";
import { MosqueCard } from "@/components/MosqueCard";
import { MosqueMap } from "@/components/MosqueMap";
import { useActivity } from "@/hooks/useActivity";
import { useFavorites } from "@/hooks/useFavorites";
import type { Coords } from "@/hooks/useGeolocation";
import type { NearbyMosques } from "@/hooks/useNearbyMosques";
import {
  mosqueDirections,
  nearbyRadiusKm,
  searchMosques,
  type Mosque,
} from "@/lib/mosqueApi";
import { cn } from "@/lib/utils";

interface MosqueSectionProps {
  coords: Coords | null;
  cityName?: string;
  nearby: NearbyMosques;
}

type Mode = "nearby" | "search" | "saved";
type SearchState =
  | { status: "idle" }
  | { status: "loading" | "error"; query: string }
  | { status: "success"; query: string; results: Mosque[] };

const pageSize = 12;
const noResults: Mosque[] = [];
const secondaryButton =
  "inline-flex min-h-10 cursor-pointer items-center justify-center gap-2 rounded-lg border bg-card px-3 text-xs font-semibold text-primary transition-colors hover:bg-secondary";

function MosqueDetails({
  mosque,
  favorite,
  onToggleFavorite,
  onClose,
}: {
  mosque: Mosque;
  favorite: boolean;
  onToggleFavorite: () => void;
  onClose: () => void;
}) {
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "failed">(
    "idle",
  );
  const directions = mosqueDirections(mosque);

  async function copyAddress() {
    if (!mosque.address) return;
    try {
      await navigator.clipboard.writeText(mosque.address);
      setCopyStatus("copied");
    } catch {
      setCopyStatus("failed");
    }
  }

  return (
    <div
      className="rounded-xl border bg-secondary/45 p-3.5"
      aria-label="Selected place"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="text-sm font-semibold wrap-break-word">
            {mosque.name}
          </h4>
          <p className="mt-1 text-xs text-muted-foreground">
            {mosque.address ??
              "Street address not mapped. Directions use the map pin."}
          </p>
        </div>
        <div className="flex shrink-0 gap-1">
          <button
            type="button"
            onClick={onToggleFavorite}
            aria-label={favorite ? "Remove from saved places" : "Save place"}
            aria-pressed={favorite}
            className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-card"
          >
            <Heart
              aria-hidden="true"
              className={cn("size-4 text-primary", favorite && "fill-current")}
            />
          </button>
          <button
            type="button"
            aria-label="Close details"
            onClick={onClose}
            className="grid size-9 cursor-pointer place-items-center rounded-lg hover:bg-card"
          >
            <X aria-hidden="true" className="size-4 text-muted-foreground" />
          </button>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <a
          href={directions}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex min-h-10 items-center gap-2 rounded-lg bg-primary px-3 text-xs font-semibold text-primary-foreground hover:opacity-90"
        >
          <Navigation aria-hidden="true" className="size-3.5" />
          Directions
        </a>
        {mosque.address && (
          <button
            type="button"
            onClick={copyAddress}
            className={secondaryButton}
          >
            {copyStatus === "copied" ? (
              <Check aria-hidden="true" className="size-3.5" />
            ) : (
              <Copy aria-hidden="true" className="size-3.5" />
            )}
            {copyStatus === "copied" ? "Copied" : "Copy address"}
          </button>
        )}
      </div>
      <span role="status" className="sr-only">
        {copyStatus === "copied"
          ? "Address copied."
          : copyStatus === "failed"
            ? "Could not copy the address."
            : ""}
      </span>
    </div>
  );
}

export function MosqueSection({
  coords,
  cityName,
  nearby,
}: MosqueSectionProps) {
  const [mode, setMode] = useState<Mode>("nearby");
  const [query, setQuery] = useState("");
  const [search, setSearch] = useState<SearchState>({ status: "idle" });
  const [mosquesOnly, setMosquesOnly] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [visibleCount, setVisibleCount] = useState(pageSize);
  const searchRequest = useRef<AbortController>(null);
  const list = useRef<HTMLOListElement>(null);
  const { track } = useActivity();
  const favorites = useFavorites();
  const saved = favorites.saved;
  const originLabel = cityName ? `Center of ${cityName}` : "Device location";

  useEffect(() => () => searchRequest.current?.abort(), []);

  function changeMode(next: Mode) {
    if (mode === next) return;
    searchRequest.current?.abort();
    if (search.status === "loading") setSearch({ status: "idle" });
    setMode(next);
    setVisibleCount(pageSize);
    setSelectedId(null);
  }

  async function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const term = query.trim();
    if (term.length < 2 || search.status === "loading") return;
    searchRequest.current?.abort();
    const controller = new AbortController();
    searchRequest.current = controller;
    setSearch({ status: "loading", query: term });
    setVisibleCount(pageSize);
    setSelectedId(null);
    try {
      const results = await searchMosques(term, controller.signal);
      if (!controller.signal.aborted)
        setSearch({ status: "success", query: term, results });
    } catch {
      if (!controller.signal.aborted)
        setSearch({ status: "error", query: term });
    }
  }

  function selectMosque(mosque: Mosque) {
    if (selectedId === mosque.id) return;
    setSelectedId(mosque.id);
    favorites.rememberMosque(mosque);
    track({ type: "mosque", label: mosque.name, meta: mosque.id });
  }

  const knownSearch = search.status === "success" ? search.results : noResults;
  const { savedPlaces, oldSaves } = useMemo(() => {
    const savedPlaces: Mosque[] = [];
    const oldSaves: typeof saved = [];
    const known = new Map(
      [...(nearby.results ?? noResults), ...knownSearch].map((mosque) => [
        mosque.id,
        mosque,
      ]),
    );
    for (const { id, label, place } of saved) {
      const current = known.get(id);
      if (current) savedPlaces.push({ ...current, distance: undefined });
      else if (
        place &&
        Number.isFinite(place.lat) &&
        Number.isFinite(place.lon) &&
        Math.abs(place.lat) <= 90 &&
        Math.abs(place.lon) <= 180
      ) {
        savedPlaces.push({ ...place, id, name: label });
      } else oldSaves.push({ id, label, type: "mosque" });
    }
    return { savedPlaces, oldSaves };
  }, [saved, nearby.results, knownSearch]);
  const mapped =
    mode === "saved"
      ? savedPlaces
      : mode === "search"
        ? knownSearch
        : (nearby.results ?? noResults);
  const results = useMemo(
    () =>
      mode !== "saved" && mosquesOnly
        ? mapped.filter(({ kind }) => kind === "mosque")
        : mapped,
    [mapped, mode, mosquesOnly],
  );
  const visible = useMemo(
    () => results.slice(0, visibleCount),
    [results, visibleCount],
  );
  const selected = visible.find((mosque) => mosque.id === selectedId) ?? null;
  const origin = useMemo<LatLngTuple | null>(
    () => (mode === "nearby" && coords ? [coords.lat, coords.lon] : null),
    [coords, mode],
  );
  const loading =
    mode === "nearby"
      ? nearby.loading
      : mode === "search" && search.status === "loading";
  const failed =
    mode === "nearby"
      ? nearby.error
      : mode === "search" && search.status === "error";

  useEffect(() => {
    const container = list.current;
    const item = container?.querySelector('[aria-pressed="true"]');
    if (!container || !item) return;
    const bounds = container.getBoundingClientRect();
    const row = item.getBoundingClientRect();
    if (row.top < bounds.top) container.scrollTop += row.top - bounds.top;
    else if (row.bottom > bounds.bottom)
      container.scrollTop += row.bottom - bounds.bottom;
  }, [selected]);

  function filterMosques(checked: boolean) {
    setMosquesOnly(checked);
    setVisibleCount(pageSize);
    setSelectedId(null);
  }

  return (
    <div className="rounded-2xl border bg-card">
      <div className="border-b p-4 sm:p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h3 className="flex items-center gap-2 text-sm font-semibold">
              <MapPin aria-hidden="true" className="size-4 text-primary" />
              Mosques &amp; prayer spaces
            </h3>
            <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
              {mode === "nearby"
                ? `Within ${nearbyRadiusKm} km${cityName ? ` of ${cityName} city center` : " of your device location"} · straight-line distance`
                : mode === "saved"
                  ? "Open saved places and directions without searching again."
                  : "Enter a mosque name or a city. Try including the city for common names."}
            </p>
          </div>
          <div
            className="flex gap-1 rounded-lg bg-secondary p-1"
            role="group"
            aria-label="Find places by"
          >
            {(["nearby", "search", "saved"] as const).map((option) => (
              <button
                key={option}
                type="button"
                aria-pressed={mode === option}
                onClick={() => changeMode(option)}
                className={cn(
                  "min-h-9 cursor-pointer rounded-md px-3 text-xs font-semibold capitalize",
                  mode === option
                    ? "bg-card text-primary shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>
        {mode === "search" && (
          <form onSubmit={submitSearch} className="mt-4 flex gap-2">
            <label htmlFor="mosque-search" className="sr-only">
              Mosque name or city
            </label>
            <input
              id="mosque-search"
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. Masjid Istiqlal"
              maxLength={100}
              autoComplete="off"
              className="min-h-11 w-full min-w-0 rounded-lg border bg-background px-3 text-sm"
            />
            <button
              type="submit"
              disabled={query.trim().length < 2 || loading}
              className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary px-3 text-sm font-semibold text-primary-foreground enabled:cursor-pointer disabled:opacity-55"
            >
              <Search aria-hidden="true" className="size-4" />
              Search
            </button>
          </form>
        )}
      </div>

      <div className="p-4 sm:p-5">
        {mode !== "saved" && mapped.length > 0 && (
          <label className="mb-3 inline-flex min-h-8 cursor-pointer items-center gap-2 text-xs font-semibold text-muted-foreground">
            <input
              type="checkbox"
              checked={mosquesOnly}
              onChange={(event) => filterMosques(event.target.checked)}
              className="size-4 accent-primary"
            />
            Mosques only
          </label>
        )}
        {results.length > 0 ? (
          <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
            <div className="space-y-2">
              <MosqueMap
                mosques={visible}
                origin={origin}
                originLabel={originLabel}
                selected={selected}
                onSelect={selectMosque}
              />
              {origin && (
                <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span
                    aria-hidden="true"
                    className="size-2 rounded-full bg-blue-700 dark:bg-blue-400"
                  />{" "}
                  {originLabel}
                </p>
              )}
            </div>
            <div className="min-w-0 space-y-2">
              {selected && (
                <MosqueDetails
                  key={selected.id}
                  mosque={selected}
                  favorite={favorites.isSaved(selected.id)}
                  onToggleFavorite={() => {
                    favorites.toggleMosque(selected);
                    if (mode === "saved") setSelectedId(null);
                  }}
                  onClose={() => setSelectedId(null)}
                />
              )}
              <p
                role="status"
                className="px-1 text-xs font-medium text-muted-foreground"
              >
                {visible.length < results.length
                  ? `Showing ${visible.length} of ${results.length} places`
                  : `${results.length} ${results.length === 1 ? "place" : "places"}`}
                {mode === "search" &&
                  search.status === "success" &&
                  ` for “${search.query}”`}
              </p>
              <ol
                ref={list}
                aria-label="Mosque and prayer space results"
                className="max-h-72 space-y-1 overflow-y-auto rounded-xl border p-1"
              >
                {visible.map((mosque, index) => (
                  <li key={mosque.id}>
                    <MosqueCard
                      mosque={mosque}
                      number={index + 1}
                      selected={selected?.id === mosque.id}
                      onSelect={selectMosque}
                    />
                    {mode === "saved" && (
                      <a
                        href={mosqueDirections(mosque)}
                        onClick={() => favorites.rememberMosque(mosque)}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={`Directions to ${mosque.name}`}
                        className="ml-9 inline-flex min-h-9 items-center gap-1.5 rounded-md px-3 text-xs font-semibold text-primary hover:bg-secondary"
                      >
                        <Navigation aria-hidden="true" className="size-3.5" />
                        Directions
                      </a>
                    )}
                  </li>
                ))}
              </ol>
              {visible.length < results.length && (
                <button
                  type="button"
                  className={secondaryButton}
                  onClick={() => setVisibleCount((count) => count + pageSize)}
                >
                  Show more
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-dashed px-4 py-6 text-center">
            <p role="status" className="text-sm text-muted-foreground">
              {mode === "saved"
                ? oldSaves.length
                  ? "Your older saves have no map pin yet."
                  : "No saved places yet. Open a result and tap the heart to save it."
                : loading
                  ? mode === "nearby"
                    ? "Looking up nearby places…"
                    : "Searching OpenStreetMap…"
                  : failed
                    ? "The map data service didn’t respond. Please try again."
                    : mosquesOnly && mapped.length
                      ? "No result is identified as a mosque. Turn off the filter to see mapped prayer spaces."
                      : mode === "nearby" && !coords
                        ? "Choose a city or use your device location to see nearby places."
                        : mode === "nearby"
                          ? `No mosque or prayer space is mapped within ${nearbyRadiusKm} km. Try searching by name or city.`
                          : search.status === "success"
                            ? `No mapped mosque or prayer space matched “${search.query}”. Try adding a city or using the local name.`
                            : "Search for a mosque or city to see matching places on the map."}
            </p>
            {mode === "nearby" && !loading && (
              <div className="mt-3 flex flex-wrap justify-center gap-2">
                {!coords && (
                  <a href="#location-control" className={secondaryButton}>
                    <LocateFixed aria-hidden="true" className="size-3.5" /> Set
                    location
                  </a>
                )}
                {failed && (
                  <button
                    type="button"
                    onClick={nearby.retry}
                    className={secondaryButton}
                  >
                    Try again
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => changeMode("search")}
                  className={secondaryButton}
                >
                  Search by name or city
                </button>
              </div>
            )}
            {mode === "saved" && !oldSaves.length && (
              <button
                type="button"
                className={`${secondaryButton} mt-3`}
                onClick={() => changeMode("search")}
              >
                Find a place
              </button>
            )}
          </div>
        )}
        {mode === "saved" && oldSaves.length > 0 && (
          <ul
            aria-label="Saved places without map pins"
            className="mt-3 divide-y rounded-xl border"
          >
            {oldSaves.map(({ id, label }) => (
              <li
                key={id}
                className="flex flex-wrap items-center justify-between gap-2 p-3"
              >
                <div className="min-w-0">
                  <p className="text-sm font-semibold wrap-break-word">
                    {label}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    No saved coordinates.
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => {
                      setQuery(label);
                      changeMode("search");
                    }}
                  >
                    Find again
                  </button>
                  <button
                    type="button"
                    className={secondaryButton}
                    onClick={() => favorites.removeMosque(id)}
                    aria-label={`Remove ${label}`}
                  >
                    <X aria-hidden="true" className="size-3.5" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-xs leading-relaxed text-muted-foreground">
          Data from{" "}
          <a
            href="https://www.openstreetmap.org/copyright"
            className="underline"
          >
            OpenStreetMap contributors
          </a>
          . Pins are approximate, and some places or addresses may be missing.
        </p>
      </div>
    </div>
  );
}
