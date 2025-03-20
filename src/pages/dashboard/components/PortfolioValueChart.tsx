
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
import { useIsMobile } from "@/hooks/use-mobile";

export function PortfolioValueChart() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1m");
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistory();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const startDate = useTimeRangeFilter(selectedRange);
  const isMobile = useIsMobile();

  // Forcer la mise à jour si aucune donnée n'est disponible
  useEffect(() => {
    if (!isLoading && (!historyData || historyData.length === 0)) {
      handleUpdateHistoricalData();
    }
  }, [isLoading, historyData]);

  const filteredData = React.useMemo(() => {
    if (!historyData) return [];
    return historyData.filter(
      (data) => new Date(data.date) >= startDate
    );
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
      <CardHeader className={`flex ${isMobile ? 'flex-col space-y-3' : 'flex-row items-center justify-between space-y-0'} pb-4`}>
        <CardTitle>Évolution du Portfolio</CardTitle>
        <div className={`flex ${isMobile ? 'flex-col space-y-2 w-full' : 'items-center gap-4'}`}>
          <TimeRangeSelector
            selectedRange={selectedRange}
            onRangeChange={setSelectedRange}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={handleUpdateHistoricalData}
            disabled={isUpdating}
            className={isMobile ? "w-full" : ""}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isUpdating ? "animate-spin" : ""}`} />
            Mettre à jour
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className={`${isMobile ? 'h-[200px]' : 'h-[300px]'}`}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart 
              data={filteredData}
              margin={isMobile ? { top: 5, right: 5, bottom: 5, left: 5 } : { top: 10, right: 30, bottom: 10, left: 20 }}
            >
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
                  format(parseISO(value), isMobile ? "dd/MM" : "dd MMM", { locale: fr })
                }
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
                tickMargin={isMobile ? 5 : 10}
                interval={isMobile ? "preserveStartEnd" : "auto"}
              />
              <YAxis
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
                stroke="#6B7280"
                tick={{ fill: '#6B7280', fontSize: isMobile ? 10 : 12 }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
                width={isMobile ? 40 : 60}
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
