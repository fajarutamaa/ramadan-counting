import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import {
  MapPin,
  Search,
  Navigation,
  LocateFixed,
  ArrowLeft,
  Heart,
  Copy,
  Check,
  X,
} from "lucide-react";
import { MosqueCard } from "@/components/MosqueCard";
import { MosqueMap } from "@/components/MosqueMap";
import {
  fetchNearbyMosques,
  searchMosques,
  type Mosque,
} from "@/lib/mosqueApi";
import { useFavorites } from "@/hooks/useFavorites";
import { useActivity } from "@/hooks/useActivity";
import { fadeInUp } from "@/lib/animations";
import { cn } from "@/lib/utils";

interface MosqueSectionProps {
  coords: { lat: number; lon: number } | null;
}

type ViewMode = "nearby" | "search" | "detail";

export function MosqueSection({ coords }: MosqueSectionProps) {
  const [mode, setMode] = useState<ViewMode>("nearby");
  const [mosques, setMosques] = useState<Mosque[]>([]);
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState("");
  const [locationDenied, setLocationDenied] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const { isFavorite, toggle: toggleFav } = useFavorites();
  const { track: trackActivity } = useActivity();

  // Fetch nearby mosques
  const loadNearby = useCallback(async () => {
    if (!coords) {
      setLocationDenied(true);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const results = await fetchNearbyMosques(coords.lat, coords.lon);
      setMosques(results);
      if (results.length === 0) setError("No mosques found nearby.");
    } catch {
      setError("Failed to load nearby mosques.");
    } finally {
      setLoading(false);
    }
  }, [coords]);

  useEffect(() => {
    if (mode === "nearby") loadNearby();
  }, [mode, loadNearby]);

  // Search
  const handleSearch = useCallback(async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    setMode("search");
    try {
      const results = await searchMosques(query);
      setMosques(results);
      if (results.length === 0) setError("No mosques found.");
    } catch {
      setError("Search failed.");
    } finally {
      setLoading(false);
    }
  }, [query]);

  // Debounced search on input
  useEffect(() => {
    if (mode !== "search") return;
    const timer = setTimeout(() => {
      if (query.trim().length >= 2) handleSearch();
    }, 400);
    return () => clearTimeout(timer);
  }, [query, mode, handleSearch]);

  const handleSelect = useCallback(
    (mosque: Mosque) => {
      setSelectedMosque(mosque);
      setMode("detail");
      trackActivity({ type: "mosque", label: mosque.name, meta: mosque.id });
    },
    [trackActivity],
  );

  const handleBack = useCallback(() => {
    setSelectedMosque(null);
    setMode("nearby");
    setQuery("");
  }, []);

  const mapsUrl = selectedMosque
    ? `https://www.google.com/maps/dir/?api=1&destination=${selectedMosque.lat},${selectedMosque.lon}`
    : "";

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="p-4 sm:p-5 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            {mode === "detail" ? (
              <button
                onClick={handleBack}
                className="p-1.5 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <MapPin className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            )}
            <h3 className="text-sm font-semibold text-foreground">
              {mode === "detail"
                ? "Mosque Details"
                : mode === "search"
                  ? "Search Mosques"
                  : "Nearby Mosques"}
            </h3>
          </div>

          {/* View toggle */}
          {mode !== "detail" && (
            <div className="flex items-center gap-1 bg-secondary rounded-lg p-0.5">
              <button
                onClick={() => {
                  setMode("nearby");
                  setQuery("");
                }}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  mode === "nearby"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Nearby
              </button>
              <button
                onClick={() => setMode("search")}
                className={cn(
                  "px-2.5 py-1 rounded-md text-xs font-medium transition-all",
                  mode === "search"
                    ? "bg-card text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                Search
              </button>
            </div>
          )}
        </div>

        {/* Search bar */}
        {mode !== "detail" && (
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder={
                mode === "search"
                  ? "Search by name, city, or address..."
                  : "Search nearby mosques..."
              }
              className="w-full h-9 pl-9 pr-8 rounded-lg bg-secondary text-sm text-foreground placeholder:text-muted-foreground/60 border-none outline-none focus:ring-1 focus:ring-emerald-500/40 transition-all"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        )}
      </div>

      {/* Detail view */}
      {mode === "detail" && selectedMosque && (
        <div className="p-4 sm:p-5 space-y-4">
          {/* Map */}
          <div className="h-48 sm:h-56 rounded-xl overflow-hidden border border-border">
            <MosqueMap
              mosques={[selectedMosque]}
              center={[selectedMosque.lat, selectedMosque.lon]}
              selectedId={selectedMosque.id}
              className="w-full h-full"
            />
          </div>

          {/* Info */}
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <h4 className="text-base font-semibold text-foreground">
                  {selectedMosque.name}
                </h4>
                <p className="text-sm text-muted-foreground mt-0.5">
                  {selectedMosque.address}
                </p>
              </div>
              <button
                onClick={() =>
                  toggleFav({
                    id: selectedMosque.id,
                    type: "mosque",
                    label: selectedMosque.name,
                  })
                }
                className="shrink-0 p-2 rounded-lg hover:bg-secondary transition-colors"
                aria-label={
                  isFavorite(selectedMosque.id)
                    ? "Remove from favorites"
                    : "Add to favorites"
                }
              >
                <Heart
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isFavorite(selectedMosque.id)
                      ? "fill-red-500 text-red-500"
                      : "text-muted-foreground",
                  )}
                />
              </button>
            </div>

            <div className="flex items-center gap-4 text-sm">
              {coords && selectedMosque.distance !== undefined ? (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <LocateFixed className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  {selectedMosque.distance} km away
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-muted-foreground">
                  <LocateFixed className="w-4 h-4 text-muted-foreground" />
                  Enable location to see distance
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 dark:bg-emerald-500 dark:hover:bg-emerald-400 text-white px-5 py-2.5 text-sm font-semibold transition-all active:scale-[0.97]"
              >
                <Navigation className="w-4 h-4" />
                Google Maps
              </a>

              <button
                onClick={() => {
                  navigator.clipboard.writeText(selectedMosque.address);
                  setCopiedId("address");
                  setTimeout(() => setCopiedId(null), 2000);
                }}
                className="inline-flex items-center gap-2 rounded-xl border border-border hover:bg-secondary px-5 py-2.5 text-sm font-semibold text-foreground transition-all active:scale-[0.97]"
              >
                {copiedId === "address" ? (
                  <Check className="w-4 h-4 text-emerald-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copiedId === "address" ? "Copied!" : "Copy Address"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Nearby / Search list */}
      {mode !== "detail" && (
        <div className="p-4 sm:p-5 space-y-3">
          {/* Loading */}
          {loading && (
            <div className="space-y-3">
              {[...Array(4)].map((_, i) => (
                <div
                  key={i}
                  className="h-20 rounded-xl bg-muted animate-shimmer"
                />
              ))}
            </div>
          )}

          {/* Error / Empty */}
          {!loading && error && (
            <div className="text-center py-8">
              <MapPin className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">{error}</p>
              {(mode === "nearby" || locationDenied) && (
                <p className="text-xs text-muted-foreground/60 mt-1">
                  {locationDenied
                    ? "Enable location access in your browser settings."
                    : "Try searching by name or city."}
                </p>
              )}
            </div>
          )}

          {/* Results */}
          {!loading && !error && mosques.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-muted-foreground">
                {mosques.length} mosque{mosques.length !== 1 ? "s" : ""} found
              </p>
              {mosques.map((mosque) => (
                <MosqueCard
                  key={mosque.id}
                  mosque={mosque}
                  onSelect={handleSelect}
                />
              ))}
            </div>
          )}

          {/* Location permission prompt */}
          {mode === "nearby" &&
            !loading &&
            !error &&
            mosques.length === 0 &&
            !coords && (
              <div className="text-center py-8">
                <LocateFixed className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">
                  Use your location to find nearby mosques
                </p>
                <button
                  onClick={() => {
                    setLocationDenied(false);
                    loadNearby();
                  }}
                  className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 text-xs font-semibold transition-all"
                >
                  <LocateFixed className="w-3.5 h-3.5" />
                  Enable Location
                </button>
              </div>
            )}
        </div>
      )}
    </motion.div>
  );
}
