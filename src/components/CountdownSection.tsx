import { useState } from "react";
import { useCountdown } from "@/hooks/useCountdown";
import { CountdownCard } from "@/components/CountdownCard";
import { FastingTracker } from "@/components/FastingTracker";
import { IslamicQuotes } from "@/components/IslamicQuotes";
import { RamadanArrived } from "@/components/RamadanArrived";
import type { Coords } from "@/hooks/useGeolocation";

interface CountdownSectionProps {
  ramadanDate: Date | null;
  coords: Coords | null;
}

export function CountdownSection({
  ramadanDate,
  coords,
}: CountdownSectionProps) {
  const [ramadanHasArrived, setRamadanHasArrived] = useState(false);
  const timeLeft = useCountdown(ramadanDate, () => {
    setRamadanHasArrived(true);
  });

  if (ramadanHasArrived) {
    return (
      <div className="space-y-6">
        <FastingTracker coords={coords} ramadanStart={ramadanDate} />
        <RamadanArrived />
      </div>
    );
  }

  if (
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0
  ) {
    return (
      <div className="space-y-6">
        <FastingTracker coords={coords} ramadanStart={ramadanDate} />
        <RamadanArrived />
      </div>
    );
  }

  return (
    <>
      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
        role="timer"
        aria-live="polite"
        aria-atomic="true"
        aria-label={`${timeLeft.days} days, ${timeLeft.hours} hours, ${timeLeft.minutes} minutes, ${timeLeft.seconds} until Ramadan`}
      >
        <CountdownCard value={timeLeft.days} label="Days" index={0} />
        <CountdownCard value={timeLeft.hours} label="Hours" index={1} />
        <CountdownCard value={timeLeft.minutes} label="Minutes" index={2} />
        <CountdownCard value={timeLeft.seconds} label="Seconds" index={3} />
      </div>
      <IslamicQuotes />
    </>
  );
}
