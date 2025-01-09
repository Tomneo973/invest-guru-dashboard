import { startOfYear, subDays, subMonths, subYears } from "date-fns";

export type TimeRange = "7d" | "1m" | "3m" | "6m" | "ytd" | "3y" | "5y" | "all";

export function useTimeRangeFilter(range: TimeRange) {
  const today = new Date();

  switch (range) {
    case "7d":
      return subDays(today, 7);
    case "1m":
      return subMonths(today, 1);
    case "3m":
      return subMonths(today, 3);
    case "6m":
      return subMonths(today, 6);
    case "ytd":
      return startOfYear(today);
    case "3y":
      return subYears(today, 3);
    case "5y":
      return subYears(today, 5);
    case "all":
      return new Date(0); // Return earliest possible date
    default:
      return subMonths(today, 1); // Default to 1 month
  }
}