import { useEffect, useRef, useState } from "react";
import {
  CircleMarker,
  MapContainer,
  Marker,
  TileLayer,
  Tooltip,
  useMap,
} from "react-leaflet";
import { divIcon, latLngBounds, type LatLngTuple } from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Mosque } from "@/lib/mosqueApi";

interface MosqueMapProps {
  mosques: Mosque[];
  origin: LatLngTuple | null;
  originLabel: string;
  selected: Mosque | null;
  onSelect: (mosque: Mosque) => void;
}

function markerIcon(index: number, selected: boolean) {
  return divIcon({
    className: "",
    html: `<span class="mosque-map-pin${selected ? " mosque-map-pin-active" : ""}">${index}</span>`,
    iconSize: [30, 30],
    iconAnchor: [15, 15],
    tooltipAnchor: [0, -14],
  });
}

function MapViewport({
  mosques,
  origin,
  selected,
}: Omit<MosqueMapProps, "onSelect" | "originLabel">) {
  const map = useMap();
  useEffect(() => {
    const points: LatLngTuple[] = mosques.map(({ lat, lon }) => [lat, lon]);
    if (origin) points.push(origin);
    if (!points.length) return;
    map.invalidateSize({ pan: false });
    map.fitBounds(latLngBounds(points), {
      padding: [28, 28],
      maxZoom: 15,
      animate: false,
    });
  }, [map, mosques, origin]);

  useEffect(() => {
    if (selected)
      map.panInside([selected.lat, selected.lon], {
        padding: [40, 40],
        animate: false,
      });
  }, [map, selected]);

  return null;
}

export function MosqueMap({
  mosques,
  origin,
  originLabel,
  selected,
  onSelect,
}: MosqueMapProps) {
  const tileError = useRef(false);
  const [incompleteTiles, setIncompleteTiles] = useState(false);
  const first = mosques[0];
  const center: LatLngTuple | undefined =
    origin ?? (first && [first.lat, first.lon]);
  if (!center) return null;

  return (
    <div
      role="region"
      aria-label="Map of mosque results"
      className="isolate overflow-hidden rounded-xl border bg-secondary"
    >
      <MapContainer
        center={center}
        zoom={14}
        scrollWheelZoom={false}
        className="z-0 h-64 w-full sm:h-84"
      >
        <TileLayer
          attribution='© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
          eventHandlers={{
            loading: () => {
              tileError.current = false;
            },
            tileerror: () => {
              tileError.current = true;
            },
            load: () => setIncompleteTiles(tileError.current),
          }}
        />
        <MapViewport mosques={mosques} origin={origin} selected={selected} />
        {origin && (
          <CircleMarker
            center={origin}
            radius={7}
            pathOptions={{
              color: "#fff",
              fillColor: "#1d4ed8",
              fillOpacity: 1,
              weight: 2,
            }}
          >
            <Tooltip direction="top">{originLabel}</Tooltip>
          </CircleMarker>
        )}
        {mosques.map((mosque, index) => {
          const active = mosque.id === selected?.id;
          return (
            <Marker
              key={mosque.id}
              position={[mosque.lat, mosque.lon]}
              icon={markerIcon(index + 1, active)}
              title={mosque.name}
              alt={mosque.name}
              zIndexOffset={active ? 1000 : 0}
              eventHandlers={{ click: () => onSelect(mosque) }}
            >
              <Tooltip direction="top">{mosque.name}</Tooltip>
            </Marker>
          );
        })}
      </MapContainer>
      {incompleteTiles && (
        <p
          role="status"
          className="border-t bg-card px-3 py-2 text-xs text-muted-foreground"
        >
          Some map tiles didn’t load. You can still select a place and open
          directions.
        </p>
      )}
    </div>
  );
}
