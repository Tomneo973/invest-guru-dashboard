
import React, { useEffect } from "react";
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
import { TimeRangeSelector } from "./TimeRangeSelector";
import { TimeRange, useTimeRangeFilter } from "./hooks/useTimeRangeFilter";

const VARIATION_THRESHOLD = 0.5; // 50% variation threshold

const filterAnomalies = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  return data.filter((item, index) => {
    if (index === 0) return true; // Keep first point
    
    const previousValue = data[index - 1].portfolioValue;
    const currentValue = item.portfolioValue;
    
    if (previousValue === 0) return true;
    
    const variation = Math.abs((currentValue - previousValue) / previousValue);
    return variation <= VARIATION_THRESHOLD;
  });
};

export function PortfolioValueChart() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1m");
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistory();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const startDate = useTimeRangeFilter(selectedRange);

  // Forcer la mise à jour si aucune donnée n'est disponible
  useEffect(() => {
    if (!isLoading && (!historyData || historyData.length === 0)) {
      handleUpdateHistoricalData();
    }
  }, [isLoading, historyData]);

  const filteredData = React.useMemo(() => {
    if (!historyData) return [];
    
    // First filter by date range
    const dateFiltered = historyData.filter(
      (data) => new Date(data.date) >= startDate
    );
    
    // Then filter out anomalies
    return filterAnomalies(dateFiltered);
  }, [historyData, startDate]);

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

  if (!filteredData?.length) {
    return (
      <Card className="w-full">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Évolution du Portfolio</CardTitle>
          <div className="flex items-center gap-4">
            <TimeRangeSelector
              selectedRange={selectedRange}
              onRangeChange={setSelectedRange}
            />
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdateHistoricalData}
              disabled={isUpdating}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
              Mettre à jour
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] flex items-center justify-center">
            {isUpdating ? "Mise à jour des données..." : "Aucune donnée disponible"}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle>Évolution du Portfolio</CardTitle>
        <div className="flex items-center gap-4">
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateHistoricalData}
            disabled={isUpdating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            Mettre à jour
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={filteredData}>
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
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  format(parseISO(value), "dd MMM", { locale: fr })
                }
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
              />
              <Tooltip content={<PortfolioChartTooltip />} />
              <Area
                type="monotone"
                dataKey="investedValue"
                stroke="#22c55e"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorInvested)"
                name="Montant investi"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                name="Valeur du portfolio"
                isAnimationActive={false}
              />
              <Area
                type="monotone"
                dataKey="cumulativeDividends"
                stroke="#eab308"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorDividends)"
                name="Dividendes cumulés"
                isAnimationActive={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
