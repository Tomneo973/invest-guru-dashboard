import { Button } from "@/components/ui/button";

type TimeRange = "7d" | "1m" | "3m" | "6m" | "ytd" | "3y" | "5y" | "all";

interface TimeRangeSelectorProps {
  selectedRange: TimeRange;
  onRangeChange: (range: TimeRange) => void;
}

const timeRanges: { value: TimeRange; label: string }[] = [
  { value: "7d", label: "7J" },
  { value: "1m", label: "1M" },
  { value: "3m", label: "3M" },
  { value: "6m", label: "6M" },
  { value: "ytd", label: "YTD" },
  { value: "3y", label: "3A" },
  { value: "5y", label: "5A" },
  { value: "all", label: "Max" },
];

export function TimeRangeSelector({ selectedRange, onRangeChange }: TimeRangeSelectorProps) {
  return (
    <div className="flex gap-2">
      {timeRanges.map(({ value, label }) => (
        <Button
          key={value}
          variant={selectedRange === value ? "default" : "outline"}
          size="sm"
          onClick={() => onRangeChange(value)}
        >
          {label}
        </Button>
      ))}
    </div>
  );
}