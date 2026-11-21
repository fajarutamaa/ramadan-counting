import { useEffect, useRef, useState } from "react";
import { readCompassHeading } from "@/lib/qibla";

type CompassState = "idle" | "permission" | "listening";
type Heading = NonNullable<ReturnType<typeof readCompassHeading>>;

export function useCompassHeading() {
  const [state, setState] = useState<CompassState>("idle");
  const [heading, setHeading] = useState<Heading | null>(null);
  const [error, setError] = useState<string | null>(null);
  const attempt = useRef(0);

  useEffect(
    () => () => {
      attempt.current += 1;
    },
    [],
  );

  async function start() {
    const current = ++attempt.current;
    setError(null);
    if (!window.isSecureContext) {
      setError("Live compass requires a secure (HTTPS) connection.");
      return;
    }
    const orientation = window.DeviceOrientationEvent as
      | (typeof DeviceOrientationEvent & {
          requestPermission?: (absolute?: boolean) => Promise<string>;
        })
      | undefined;
    if (!orientation) {
      setError("This browser does not support a live compass.");
      return;
    }

    setState("permission");
    try {
      const permission = orientation.requestPermission
        ? await orientation.requestPermission(true)
        : "granted";
      if (current !== attempt.current) return;
      if (permission !== "granted") {
        setState("idle");
        setError(
          "Compass permission was denied. Check motion and orientation permissions in your browser.",
        );
        return;
      }
      setState("listening");
    } catch {
      if (current !== attempt.current) return;
      setState("idle");
      setError(
        "Could not enable the compass. Check your browser permissions and try again.",
      );
    }
  }

  function stop() {
    attempt.current += 1;
    setState("idle");
    setHeading(null);
    setError(null);
  }

  useEffect(() => {
    if (state !== "listening") return;
    let lastReading = Date.now();
    function onOrientation(event: DeviceOrientationEvent) {
      const legacyAngle = (window as Window & { orientation?: number })
        .orientation;
      const next = readCompassHeading(
        event,
        window.screen.orientation?.angle ?? legacyAngle ?? 0,
      );
      if (!next) return;
      lastReading = Date.now();
      setHeading((previous) =>
        previous?.degrees === next.degrees &&
        previous.magnetic === next.magnetic
          ? previous
          : next,
      );
    }

    window.addEventListener("deviceorientationabsolute", onOrientation);
    window.addEventListener("deviceorientation", onOrientation);
    const timeout = window.setInterval(() => {
      if (Date.now() - lastReading < 6000) return;
      setState("idle");
      setHeading(null);
      setError(
        "No north reference received. Try a phone with a compass sensor and hold it flat.",
      );
    }, 1000);

    return () => {
      window.removeEventListener("deviceorientationabsolute", onOrientation);
      window.removeEventListener("deviceorientation", onOrientation);
      window.clearInterval(timeout);
    };
  }, [state]);

  return { heading, error, state, start, stop };
}
