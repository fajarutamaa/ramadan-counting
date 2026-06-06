export interface Mosque {
  id: string;
  name: string;
  address: string;
  lat: number;
  lon: number;
  distance?: number;
}

interface OsmElement {
  type: "node" | "way";
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: {
    name?: string;
    "addr:full"?: string;
    "addr:street"?: string;
    "addr:city"?: string;
    "addr:district"?: string;
    phone?: string;
    website?: string;
    opening_hours?: string;
    wheelchair?: string;
    "toilets:wheelchair"?: string;
  };
}

function haversine(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function elementToMosque(el: OsmElement): Mosque | null {
  const lat = el.lat ?? el.center?.lat;
  const lon = el.lon ?? el.center?.lon;
  if (!lat || !lon) return null;
  const name = el.tags?.name?.trim();
  if (!name) return null;

  const parts = [el.tags?.["addr:full"], el.tags?.["addr:street"]]
    .filter(Boolean)
    .join(", ");
  const city = el.tags?.["addr:city"] ?? "";

  return {
    id: `${el.type}/${el.id}`,
    name,
    address: parts || city || "Unknown location",
    lat,
    lon,
  };
}

export async function fetchNearbyMosques(
  lat: number,
  lon: number,
  radius = 5000,
): Promise<Mosque[]> {
  const query = `
    [out:json][timeout:15];
    (
      node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
      way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lon});
    );
    out center 25;
  `;

  const res = await fetch("https://overpass-api.de/api/interpreter", {
    method: "POST",
    body: `data=${encodeURIComponent(query)}`,
  });

  if (!res.ok) throw new Error("Failed to fetch nearby mosques");

  const data: { elements: OsmElement[] } = await res.json();

  const mosques = data.elements
    .map(elementToMosque)
    .filter((m): m is Mosque => m !== null)
    .map((m) => ({
      ...m,
      distance: Math.round(haversine(lat, lon, m.lat, m.lon) * 10) / 10,
    }))
    .sort((a, b) => (a.distance ?? 0) - (b.distance ?? 0));

  // Deduplicate nearby results (same name within 100m)
  const seen = new Set<string>();
  return mosques.filter((m) => {
    const key = `${m.name.toLowerCase()}-${Math.round(m.lat * 1000)}-${Math.round(m.lon * 1000)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export async function searchMosques(query: string): Promise<Mosque[]> {
  if (!query.trim()) return [];

  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query + " mosque")}&format=json&limit=15&addressdetails=1`;

  const res = await fetch(url, {
    headers: { "User-Agent": "RamadanCounting/1.0" },
  });

  if (!res.ok) throw new Error("Search failed");

  const data: Array<{
    osm_id: number;
    osm_type: string;
    lat: string;
    lon: string;
    display_name: string;
    address?: { city?: string; town?: string; village?: string };
  }> = await res.json();

  return data.map((item) => {
    const city =
      item.address?.city ?? item.address?.town ?? item.address?.village ?? "";
    return {
      id: `${item.osm_type}/${item.osm_id}`,
      name: item.display_name.split(",")[0].trim(),
      address: item.display_name,
      lat: parseFloat(item.lat),
      lon: parseFloat(item.lon),
      city,
    };
  });
}
