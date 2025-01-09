import React from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { PortfolioChartTooltip } from "./PortfolioChartTooltip";
import { usePortfolioHistory } from "./hooks/usePortfolioHistory";

export function PortfolioValueChart() {
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistory();
  const [isUpdating, setIsUpdating] = React.useState(false);

  const handleUpdateHistoricalData = async () => {
    setIsUpdating(true);
    try {
      await updateHistoricalData();
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Évolution du Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Chargement des données...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!historyData?.length) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Évolution du Portfolio</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Évolution du Portfolio</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={handleUpdateHistoricalData}
          disabled={isUpdating}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
          Mettre à jour les données
        </Button>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={historyData}>
              <defs>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  format(parseISO(value), "dd MMM", { locale: fr })
                }
                stroke="#6B7280"
              />
              <YAxis
                tickFormatter={(value) => `${value.toLocaleString()} €`}
                stroke="#6B7280"
              />
              <Tooltip content={<PortfolioChartTooltip />} />
              <Area
                type="monotone"
                dataKey="investedValue"
                stroke="#22c55e"
                fillOpacity={1}
                fill="url(#colorInvested)"
                name="Montant investi"
              />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="#3b82f6"
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                name="Valeur du portfolio"
              />
              <Area
                type="monotone"
                dataKey="cumulativeDividends"
                stroke="#eab308"
                fillOpacity={1}
                fill="url(#colorDividends)"
                name="Dividendes cumulés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}