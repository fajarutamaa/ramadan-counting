export const nearbyRadiusKm = 5;

export interface Mosque {
  id: string;
  name: string;
  address: string | null;
  kind: "mosque" | "prayer-space";
  lat: number;
  lon: number;
  distance?: number;
}

type Tags = Record<string, string | undefined>;
type OsmType = "node" | "way" | "relation";

interface OsmElement {
  type: OsmType;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Tags;
}

interface SearchResult {
  osm_type: OsmType;
  osm_id: number;
  category: string;
  type: string;
  lat: string;
  lon: string;
  name?: string;
  display_name?: string;
  extratags?: Tags;
}

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = Math.PI / 180;
  const a =
    Math.sin(((lat2 - lat1) * radians) / 2) ** 2 +
    Math.cos(lat1 * radians) *
      Math.cos(lat2 * radians) *
      Math.sin(((lon2 - lon1) * radians) / 2) ** 2;
  return 6371 * 2 * Math.asin(Math.sqrt(Math.min(a, 1)));
}

function isCoordinate(
  value: number | undefined,
  limit: number,
): value is number {
  return (
    value !== undefined && Number.isFinite(value) && Math.abs(value) <= limit
  );
}

function getKind(tags: Tags, name: string): Mosque["kind"] | null {
  if (
    tags.disused === "yes" ||
    tags.abandoned === "yes" ||
    (tags.religion && tags.religion !== "muslim")
  )
    return null;
  if (
    tags.amenity !== "mosque" &&
    !(tags.amenity === "place_of_worship" && tags.religion === "muslim")
  )
    return null;

  if (
    /\b(?:musala|mushol+a|mushal+a|musol+a|surau|prayer room)\b/i.test(name) ||
    tags.place_of_worship === "prayer_room"
  )
    return "prayer-space";
  return tags.amenity === "mosque" ||
    tags.building === "mosque" ||
    /\b(?:masjid|mesjid|mosque)\b|مسجد/i.test(name)
    ? "mosque"
    : "prayer-space";
}

function addressParts(...parts: (string | undefined)[]): string | null {
  return (
    [...new Set(parts.map((part) => part?.trim()).filter(Boolean))].join(
      ", ",
    ) || null
  );
}

function elementToMosque(element: OsmElement): Mosque | null {
  const { id, type, tags = {} } = element;
  const lat = element.lat ?? element.center?.lat;
  const lon = element.lon ?? element.center?.lon;
  if (!isCoordinate(lat, 90) || !isCoordinate(lon, 180)) return null;
  const name = tags.name?.trim() || tags["name:en"]?.trim() || "";
  const kind = getKind(tags, name);
  if (!kind) return null;
  const street = [tags["addr:housenumber"], tags["addr:street"]]
    .filter(Boolean)
    .join(" ");
  return {
    id: `${type}/${id}`,
    name:
      name || (kind === "mosque" ? "Unnamed mosque" : "Unnamed prayer space"),
    address:
      tags["addr:full"]?.trim() ||
      addressParts(
        street,
        tags["addr:suburb"] || tags["addr:district"],
        tags["addr:city"] || tags["addr:town"] || tags["addr:village"],
      ),
    kind,
    lat,
    lon,
  };
}

function deduplicate(mosques: Mosque[]) {
  const ids = new Set<string>();
  const names = new Map<string, Mosque[]>();
  return mosques.filter((mosque) => {
    if (ids.has(mosque.id)) return false;
    ids.add(mosque.id);
    const key = mosque.name
      .normalize("NFKC")
      .toLowerCase()
      .replace(/[^\p{L}\p{M}\p{N}]+/gu, " ")
      .trim();
    if (key === "unnamed mosque" || key === "unnamed prayer space") return true;
    const matches = names.get(key) ?? [];
    if (
      matches.some(
        (other) =>
          haversine(mosque.lat, mosque.lon, other.lat, other.lon) <= 0.1,
      )
    )
      return false;
    names.set(key, [...matches, mosque]);
    return true;
  });
}

export function formatMosqueDistance(km: number) {
  return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1)} km`;
}

export function mosqueDirections({ lat, lon }: Pick<Mosque, "lat" | "lon">) {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lon}`;
}

const nearbyCache = new Map<string, { until: number; results: Mosque[] }>();

async function loadOverpass(
  query: string,
  lat: number,
  lon: number,
  signal: AbortSignal,
) {
  const override = import.meta.env.VITE_API_OVERPASS_URL;
  const global = "https://overpass.private.coffee/api/interpreter";
  // The Asia extract covers Indonesia and most nearby countries. Keep the
  // global endpoint available if the regional service is down or has no data.
  const inSoutheastAsia = lat >= -12 && lat <= 25 && lon >= 90 && lon <= 141;
  const endpoints = override
    ? [override]
    : inSoutheastAsia
      ? ["https://ovp.dresel.systems/api-as/interpreter", global]
      : [global];
  for (const endpoint of endpoints) {
    signal.throwIfAborted();
    const url = new URL(endpoint);
    url.searchParams.set("data", query);
    try {
      const response = await fetch(url, {
        signal: AbortSignal.any([signal, AbortSignal.timeout(15_000)]),
      });
      if (!response.ok)
        throw new Error(`Nearby mosque lookup failed (${response.status})`);
      const { elements, remark }: { elements?: OsmElement[]; remark?: string } =
        await response.json();
      if (remark || !Array.isArray(elements))
        throw new Error("Incomplete Overpass response");
      if (elements.length || endpoint === endpoints.at(-1)) return elements;
    } catch (error) {
      if (signal.aborted || endpoint === endpoints.at(-1)) throw error;
    }
  }
  return [];
}

export async function fetchNearbyMosques(
  lat: number,
  lon: number,
  signal: AbortSignal,
): Promise<Mosque[]> {
  if (!isCoordinate(lat, 90) || !isCoordinate(lon, 180)) return [];
  const key = `${lat},${lon}`;
  const cached = nearbyCache.get(key);
  if (cached && cached.until > Date.now()) return cached.results;

  const radius = nearbyRadiusKm * 1000;
  const area = `(around:${radius},${lat},${lon})`;
  const query = `[out:json][timeout:12];(nwr["amenity"="place_of_worship"]["religion"="muslim"]${area};nwr["amenity"="mosque"]${area};);out center;`;
  const elements = await loadOverpass(query, lat, lon, signal);

  const results = deduplicate(
    elements
      .flatMap((element) => {
        const mosque = elementToMosque(element);
        if (!mosque) return [];
        const distance = haversine(lat, lon, mosque.lat, mosque.lon);
        return distance <= nearbyRadiusKm ? [{ ...mosque, distance }] : [];
      })
      .sort((a, b) => a.distance - b.distance),
  );
  nearbyCache.set(key, { until: Date.now() + 10 * 60_000, results });
  return results;
}

const searchCache = new Map<string, Mosque[]>();

export async function searchMosques(
  query: string,
  signal: AbortSignal,
): Promise<Mosque[]> {
  const name = query.trim().replace(/\s+/g, " ");
  if (name.length < 2) return [];
  const key = name.toLowerCase();
  const cached = searchCache.get(key);
  if (cached) return cached;

  const locationBase = (
    import.meta.env.VITE_API_LOCATION_URL ||
    "https://nominatim.openstreetmap.org"
  ).replace(/\/$/, "");
  const url = new URL(`${locationBase}/search`);
  url.search = new URLSearchParams({
    q: /\b(?:masjid|mesjid|mosque|musala|mushol+a|mushal+a|surau)\b|مسجد/i.test(
      name,
    )
      ? name
      : `${name} mosque`,
    format: "jsonv2",
    extratags: "1",
    limit: "20",
  }).toString();
  const response = await fetch(url, {
    signal: AbortSignal.any([signal, AbortSignal.timeout(12_000)]),
  });
  if (!response.ok)
    throw new Error(`Mosque search failed (${response.status})`);
  const results: SearchResult[] = await response.json();
  const mosques = deduplicate(
    results.flatMap((result) => {
      const lat = result.lat ? Number(result.lat) : NaN;
      const lon = result.lon ? Number(result.lon) : NaN;
      if (!isCoordinate(lat, 90) || !isCoordinate(lon, 180)) return [];
      const title = result.name?.trim() || "";
      const kind = getKind(
        {
          ...result.extratags,
          amenity:
            result.category === "amenity"
              ? result.type
              : result.extratags?.amenity,
        },
        title,
      );
      if (!kind) return [];
      const parts =
        result.display_name?.split(",").map((part) => part.trim()) ?? [];
      if (parts[0] === title) parts.shift();
      return [
        {
          id: `${result.osm_type}/${result.osm_id}`,
          name:
            title ||
            (kind === "mosque" ? "Unnamed mosque" : "Unnamed prayer space"),
          address: addressParts(...parts),
          kind,
          lat,
          lon,
        },
      ];
    }),
  );
  searchCache.set(key, mosques);
  return mosques;
}
