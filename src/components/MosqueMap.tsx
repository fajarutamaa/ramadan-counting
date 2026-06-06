import { useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Mosque } from "@/lib/mosqueApi";

interface MosqueMapProps {
  mosques: Mosque[];
  center?: [number, number];
  selectedId?: string;
  onSelect?: (mosque: Mosque) => void;
  className?: string;
}

// Fix default marker icon path issue with bundlers
const iconUrl = "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png";
const iconRetinaUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png";
const shadowUrl =
  "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png";

const defaultIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

const selectedIcon = L.icon({
  iconUrl,
  iconRetinaUrl,
  shadowUrl,
  iconSize: [30, 49],
  iconAnchor: [15, 49],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
  className: "selected-marker",
});

export function MosqueMap({
  mosques,
  center,
  selectedId,
  onSelect,
  className,
}: MosqueMapProps) {
  const mapRef = useRef<L.Map>(null);

  const defaultCenter: [number, number] = center ?? [51.505, -0.09];

  useEffect(() => {
    if (mapRef.current && center) {
      mapRef.current.setView(center, mapRef.current.getZoom());
    }
  }, [center]);

  return (
    <div className={className}>
      <MapContainer
        center={defaultCenter}
        zoom={13}
        className="w-full h-full rounded-xl z-0"
        ref={mapRef}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        {mosques.map((mosque) => (
          <Marker
            key={mosque.id}
            position={[mosque.lat, mosque.lon]}
            icon={mosque.id === selectedId ? selectedIcon : defaultIcon}
            eventHandlers={{
              click: () => onSelect?.(mosque),
            }}
          >
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{mosque.name}</p>
                <p className="text-xs text-gray-500 mt-0.5">{mosque.address}</p>
                {mosque.distance !== undefined && (
                  <p className="text-xs text-emerald-600 mt-0.5">
                    {mosque.distance} km
                  </p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
}
