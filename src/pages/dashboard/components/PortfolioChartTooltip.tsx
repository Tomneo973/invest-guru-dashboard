
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { PortfolioHistoryData } from "./hooks/usePortfolioHistory";

interface TooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    dataKey: keyof PortfolioHistoryData;
    name: string;
  }>;
  label?: string;
}

export function PortfolioChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload?.length || !label) {
    return null;
  }

  return (
    <div className="rounded-lg border bg-background p-2 shadow-sm">
      <div className="font-medium">
        {format(parseISO(label), "dd MMMM yyyy", { locale: fr })}
      </div>
      <div className="mt-1 flex flex-col gap-0.5">
        {payload.map((entry) => (
          <div
            key={entry.dataKey}
            className="flex items-center justify-between gap-8"
          >
            <span className="text-muted-foreground text-xs">{entry.name}:</span>
            <span className="font-medium tabular-nums">
              {entry.value.toLocaleString()} €
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
