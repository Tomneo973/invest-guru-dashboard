
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

export function PortfolioChartTooltip({ active, payload, label }: TooltipProps) {
  if (!active || !payload || !payload.length) return null;

  // Créer un map pour organiser les données par type
  const dataMap = new Map<string, { value: number; color: string }>();
  
  payload.forEach((item) => {
    if (item.value !== undefined && item.value !== null) {
      const name = item.name || item.dataKey;
      dataMap.set(name, {
        value: Number(item.value),
        color: item.color || item.stroke
      });
    }
  });

  return (
    <div className="bg-white p-4 border rounded-lg shadow-lg">
      <p className="text-sm text-gray-600 mb-2">
        {format(parseISO(label || ''), "dd MMM yyyy", { locale: fr })}
      </p>
      
      {dataMap.has("Montant investi") && (
        <p className="text-lg font-semibold text-green-500">
          Investi: {dataMap.get("Montant investi")!.value.toLocaleString()} €
        </p>
      )}
      
      {dataMap.has("Valeur du portfolio") && (
        <p className="text-md text-blue-500">
          Valeur: {dataMap.get("Valeur du portfolio")!.value.toLocaleString()} €
        </p>
      )}
      
      {dataMap.has("Dividendes cumulés") && (
        <p className="text-md text-amber-500">
          Dividendes: {dataMap.get("Dividendes cumulés")!.value.toLocaleString()} €
        </p>
      )}
    </div>
  );
}
