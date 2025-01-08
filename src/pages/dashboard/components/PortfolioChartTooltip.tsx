import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function PortfolioChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <p className="text-sm text-gray-600">
        {format(parseISO(label || ''), "dd MMM yyyy", { locale: fr })}
      </p>
      <p className="text-lg font-semibold text-green-500">
        Investi: {Number(payload[0].value).toLocaleString()} €
      </p>
      <p className="text-md text-blue-500">
        Valeur: {Number(payload[1].value).toLocaleString()} €
      </p>
      <p className="text-md text-amber-500">
        Dividendes: {Number(payload[2].value).toLocaleString()} €
      </p>
    </div>
  );
}