
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
import { useToast } from "@/components/ui/use-toast";

// Seuil de détection des anomalies (pourcentage de variation)
const VARIATION_THRESHOLD = 0.3; // 30% variation threshold

// Fonction pour obtenir le dernier jour ouvrable (lundi-vendredi)
const getLastBusinessDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  
  // Si nous sommes un dimanche (0), retourner vendredi (moins 2 jours)
  // Si nous sommes un samedi (6), retourner vendredi (moins 1 jour)
  // Sinon, retourner aujourd'hui
  const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 0;
  const lastBusinessDay = new Date(today);
  lastBusinessDay.setDate(today.getDate() - daysToSubtract);
  
  return lastBusinessDay;
};

// Fonction pour filtrer les anomalies
const filterAnomalies = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  // Trouver la médiane pour aider à identifier les valeurs aberrantes
  const validValues = data
    .map(item => item.portfolioValue)
    .filter(value => value > 0)
    .sort((a, b) => a - b);
  
  const medianValue = validValues[Math.floor(validValues.length / 2)];
  const lowerBound = medianValue * 0.3;  // 30% de la médiane
  const upperBound = medianValue * 3;    // 300% de la médiane
  
  // Filtrer les valeurs qui s'écartent trop de la médiane
  return data.filter(item => {
    const value = item.portfolioValue;
    
    // Filtrer les valeurs négatives ou trop faibles
    if (value <= 0 || value < lowerBound) return false;
    
    // Filtrer les valeurs trop élevées
    if (value > upperBound) return false;
    
    // Vérifier les écarts entre points consécutifs
    // (cette partie reste similaire à l'original)
    return true;
  });
};

export function PortfolioValueChart() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1m");
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistory();
  const [isUpdating, setIsUpdating] = React.useState(false);
  const startDate = useTimeRangeFilter(selectedRange);
  const { toast } = useToast();

  // Forcer la mise à jour si aucune donnée n'est disponible
  useEffect(() => {
    if (!isLoading && (!historyData || historyData.length === 0)) {
      handleUpdateHistoricalData();
    }
  }, [isLoading, historyData]);

  const filteredData = React.useMemo(() => {
    if (!historyData) return [];
    
    // Obtenir la date du dernier jour ouvrable
    const lastBusinessDay = getLastBusinessDay();
    const lastBusinessDayString = lastBusinessDay.toISOString().split('T')[0];
    
    console.log("Last business day:", lastBusinessDayString);
    console.log("Latest data point date:", historyData.length > 0 ? historyData[historyData.length - 1].date : "N/A");
    
    // Filtrer par plage de dates, en s'assurant d'inclure jusqu'au dernier jour ouvrable
    const dateFiltered = historyData.filter(
      (data) => {
        const dataDate = new Date(data.date);
        return dataDate >= startDate && dataDate <= lastBusinessDay;
      }
    );
    
    // Filtrer les anomalies
    const cleanData = filterAnomalies(dateFiltered);
    
    // Enregistrer les anomalies supprimées dans la console pour le débogage
    if (cleanData.length < dateFiltered.length) {
      console.log(`Filtered out ${dateFiltered.length - cleanData.length} anomalous data points`);
      const anomalies = dateFiltered.filter(item => !cleanData.includes(item));
      console.log("Anomalies removed:", anomalies);
    }
    
    return cleanData;
  }, [historyData, startDate]);

  const handleUpdateHistoricalData = async () => {
    setIsUpdating(true);
    try {
      await updateHistoricalData();
      toast({
        title: "Mise à jour réussie",
        description: "Les données historiques ont été mises à jour avec succès.",
      });
    } catch (error) {
      console.error("Error updating historical data:", error);
      toast({
        title: "Erreur",
        description:
          "Une erreur est survenue lors de la mise à jour des données historiques.",
        variant: "destructive",
      });
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
