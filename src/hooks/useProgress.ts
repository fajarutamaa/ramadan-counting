import { useMemo } from "react";

export interface ProgressData {
  percentage: number;
  daysTotal: number;
  daysRemaining: number;
  daysElapsed: number;
}

export function useProgress(targetDate: Date | null): ProgressData {
  return useMemo(() => {
    if (!targetDate) {
      return {
        percentage: 0,
        daysTotal: 0,
        daysRemaining: 0,
        daysElapsed: 0,
      };
    }

    const now = new Date();
    const oneYearAgo = new Date(targetDate);
    oneYearAgo.setFullYear(targetDate.getFullYear() - 1);

    const totalTime = targetDate.getTime() - oneYearAgo.getTime();
    const elapsedTime = now.getTime() - oneYearAgo.getTime();
    const remainingTime = targetDate.getTime() - now.getTime();

    const daysTotal = Math.floor(totalTime / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.floor(elapsedTime / (1000 * 60 * 60 * 24));
    const daysRemaining = Math.max(
      0,
      Math.floor(remainingTime / (1000 * 60 * 60 * 24)),
    );

    const percentage = Math.min(
      100,
      Math.max(0, (elapsedTime / totalTime) * 100),
    );

    return {
      percentage: Math.round(percentage * 10) / 10,
      daysTotal,
      daysRemaining,
      daysElapsed,
    };
  }, [targetDate]);
}
