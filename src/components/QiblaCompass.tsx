import { useState, useMemo, useCallback } from "react";
import { motion } from "framer-motion";
import { Compass, LocateFixed } from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { calcQibla, bearingToCompass } from "@/lib/qibla";

interface QiblaCompassProps {
  coords: { lat: number; lon: number } | null;
}

export function QiblaCompass({ coords }: QiblaCompassProps) {
  const [deviceHeading, setDeviceHeading] = useState<number | null>(null);
  const [compassError, setCompassError] = useState<string | null>(null);

  const qiblaBearing = useMemo(() => {
    if (!coords) return null;
    return calcQibla(coords.lat, coords.lon);
  }, [coords]);

  const compassDir = useMemo(() => {
    if (qiblaBearing === null) return null;
    return bearingToCompass(qiblaBearing);
  }, [qiblaBearing]);

  const requestCompass = useCallback(() => {
    if (!("DeviceOrientationEvent" in window)) {
      setCompassError("Compass not available on this device.");
      return;
    }

    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (e.alpha !== null) {
        setDeviceHeading(e.alpha);
      }
    };

    const requestPermission = async () => {
      if (
        typeof (
          DeviceOrientationEvent as unknown as {
            requestPermission?: () => Promise<PermissionState>;
          }
        ).requestPermission === "function"
      ) {
        try {
          const perm = await (
            DeviceOrientationEvent as unknown as {
              requestPermission: () => Promise<PermissionState>;
            }
          ).requestPermission();
          if (perm !== "granted") {
            setCompassError("Compass permission denied.");
            return;
          }
        } catch {
          setCompassError("Compass permission error.");
          return;
        }
      }
      window.addEventListener("deviceorientation", handleOrientation, {
        once: false,
      });
    };

    requestPermission();

    return () => {
      window.removeEventListener("deviceorientation", handleOrientation);
    };
  }, []);

  const rotationAngle = useMemo(() => {
    if (deviceHeading === null || qiblaBearing === null) return 0;
    return qiblaBearing - deviceHeading;
  }, [deviceHeading, qiblaBearing]);

  return (
    <motion.div
      className="bg-card border border-border rounded-xl overflow-hidden"
      variants={fadeInUp}
      initial="hidden"
      animate="visible"
    >
      <div className="p-5 sm:p-6 text-center">
        <div className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300 mb-5">
          <Compass className="w-3 h-3" />
          Qibla Direction
        </div>

        {!coords ? (
          <div className="py-10 text-center">
            <LocateFixed className="w-8 h-8 text-muted-foreground/40 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">
              Enable location access to find Qibla direction
            </p>
          </div>
        ) : (
          <>
            {/* Compass */}
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 mx-auto mb-5">
              {/* Outer ring */}
              <div className="absolute inset-0 rounded-full border-2 border-border" />

              {/* Cardinal marks */}
              {["N", "E", "S", "W"].map((dir, i) => {
                const angle = i * 90;
                return (
                  <div
                    key={dir}
                    className="absolute left-1/2 -translate-x-1/2 text-[11px] font-semibold text-muted-foreground"
                    style={{
                      top: "8px",
                      transformOrigin: "0 92px",
                      transform: `translateX(-50%) rotate(${angle}deg) translateY(0)`,
                    }}
                  >
                    <span
                      style={{
                        transform: `rotate(-${angle}deg)`,
                        display: "inline-block",
                      }}
                    >
                      {dir}
                    </span>
                  </div>
                );
              })}

              {/* Tick marks every 45 degrees */}
              {[0, 45, 90, 135, 180, 225, 270, 315].map((angle) => (
                <div
                  key={angle}
                  className="absolute left-1/2 top-0 w-0.5 h-2 bg-border -translate-x-1/2"
                  style={{
                    transformOrigin: "50% 96px",
                    transform: `translateX(-50%) rotate(${angle}deg)`,
                  }}
                />
              ))}

              {/* Rotating inner compass */}
              <motion.div
                className="absolute inset-4 rounded-full bg-secondary/50 border border-border flex items-center justify-center"
                animate={{
                  rotate: deviceHeading !== null ? -rotationAngle : 0,
                }}
                transition={{ type: "spring", stiffness: 60, damping: 20 }}
              >
                {/* Qibla arrow */}
                <div className="relative w-full h-full flex items-center justify-center">
                  <motion.div
                    className="absolute w-1 h-16 sm:h-20 rounded-full"
                    style={{
                      background:
                        "linear-gradient(to top, transparent 50%, #059669 50%)",
                      transformOrigin: "50% 50%",
                    }}
                    initial={{ rotate: 0 }}
                    animate={{ rotate: qiblaBearing ?? 0 }}
                    transition={{ type: "spring", stiffness: 100, damping: 25 }}
                  >
                    <div className="absolute -top-1 left-1/2 -translate-x-1/2 w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 shadow-sm" />
                  </motion.div>
                  {/* Center dot */}
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-600 dark:bg-emerald-400 z-10" />
                </div>
              </motion.div>
            </div>

            {/* Bearing info */}
            <div className="space-y-2">
              <div className="text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
                {qiblaBearing}°
              </div>
              <div className="text-sm text-muted-foreground">
                {compassDir} — {qiblaBearing} degrees from North
              </div>
            </div>

            {/* Live compass toggle */}
            {!compassError ? (
              !deviceHeading ? (
                <button
                  onClick={requestCompass}
                  className="mt-5 inline-flex items-center gap-1.5 rounded-lg border border-border hover:bg-secondary px-4 py-2 text-xs font-medium text-foreground transition-all active:scale-[0.97]"
                >
                  <Compass className="w-3.5 h-3.5" />
                  Enable Live Compass
                </button>
              ) : (
                <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live compass active — rotate your device
                </div>
              )
            ) : (
              <p className="mt-3 text-xs text-muted-foreground">
                {compassError}
              </p>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
