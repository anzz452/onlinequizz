import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(minutes: number): string {
  if (minutes < 60) return `${minutes} mins`;
  const hrs = Math.floor(minutes / 60);
  const remainingMins = minutes % 60;
  return remainingMins > 0 ? `${hrs}h ${remainingMins}m` : `${hrs} hours`;
}

export function formatScore(score: number | null | undefined): string {
  if (score === null || score === undefined) return "N/A";
  return Number.isInteger(score) ? `${score}` : score.toFixed(1);
}

export function formatPercentage(percentage: number | null | undefined): string {
  if (percentage === null || percentage === undefined) return "N/A";
  return `${percentage.toFixed(1)}%`;
}

