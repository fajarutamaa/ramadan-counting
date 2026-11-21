export const KAABA = { lat: 21.4225, lon: 39.8262 };

export function calcQibla(lat: number, lon: number): number {
  const dLon = ((KAABA.lon - lon) * Math.PI) / 180;
  const lat1 = (lat * Math.PI) / 180;
  const lat2 = (KAABA.lat * Math.PI) / 180;
  const y = Math.sin(dLon);
  const x = Math.cos(lat1) * Math.tan(lat2) - Math.sin(lat1) * Math.cos(dLon);
  let bearing = (Math.atan2(y, x) * 180) / Math.PI;
  bearing = (bearing + 360) % 360;
  return Math.round(bearing) % 360;
}

type CompassEvent = DeviceOrientationEvent & {
  webkitCompassHeading?: number;
  webkitCompassAccuracy?: number;
};

export function normalizeBearing(bearing: number): number {
  return ((bearing % 360) + 360) % 360;
}

export function readCompassHeading(
  event: CompassEvent,
  screenAngle: number,
): { degrees: number; magnetic: boolean } | null {
  // WebKit reports a clockwise magnetic heading. Standard absolute alpha
  // increases counterclockwise, so it must be inverted.
  if (
    typeof event.webkitCompassHeading === "number" &&
    Number.isFinite(event.webkitCompassHeading) &&
    event.webkitCompassHeading >= 0 &&
    !(
      typeof event.webkitCompassAccuracy === "number" &&
      event.webkitCompassAccuracy < 0
    )
  ) {
    return {
      degrees: normalizeBearing(event.webkitCompassHeading + screenAngle),
      magnetic: true,
    };
  }

  if (
    (event.absolute || event.type === "deviceorientationabsolute") &&
    typeof event.alpha === "number" &&
    Number.isFinite(event.alpha)
  ) {
    return {
      degrees: normalizeBearing(-event.alpha + screenAngle),
      magnetic: false,
    };
  }

  return null;
}

export function bearingToCompass(bearing: number): string {
  const dirs = [
    "N",
    "NNE",
    "NE",
    "ENE",
    "E",
    "ESE",
    "SE",
    "SSE",
    "S",
    "SSW",
    "SW",
    "WSW",
    "W",
    "WNW",
    "NW",
    "NNW",
  ];
  return dirs[Math.round(bearing / 22.5) % 16];
}
