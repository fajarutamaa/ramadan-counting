import type { Coords } from "@/hooks/useGeolocation";

export interface CityLocation extends Coords {
  id: number;
  name: string;
  region: string;
  timeZone: string;
}

interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  admin1?: string;
  country?: string;
  timezone?: string;
}

export async function searchCities(
  name: string,
  signal: AbortSignal,
): Promise<CityLocation[]> {
  const url = new URL("https://geocoding-api.open-meteo.com/v1/search");
  url.search = new URLSearchParams({
    name,
    count: "8",
    language: "en",
  }).toString();
  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error("City search failed");
  const { results = [] }: { results?: GeocodingResult[] } =
    await response.json();

  return results.flatMap(
    ({ id, name, latitude, longitude, admin1, country, timezone }) => {
      if (
        !timezone ||
        !Number.isFinite(latitude) ||
        !Number.isFinite(longitude)
      )
        return [];
      return [
        {
          id,
          name,
          region: [
            ...new Set(
              [admin1, country].filter((part) => part && part !== name),
            ),
          ].join(", "),
          lat: latitude,
          lon: longitude,
          timeZone: timezone,
        },
      ];
    },
  );
}
