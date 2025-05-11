
import React, { useEffect, useState } from "react";
import { usePortfolioHistory } from "./hooks/usePortfolioHistory";
import { TimeRange, useTimeRangeFilter } from "./hooks/useTimeRangeFilter";
import { useToast } from "@/components/ui/use-toast";
import { ChartContainer } from "./chart/ChartContainer";
import { PortfolioChart } from "./chart/PortfolioChart";
import { getLastBusinessDay, filterAnomalies } from "./utils/dataUtils";

export function PortfolioValueChart() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1m");
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistory();
  const [isUpdating, setIsUpdating] = useState(false);
  const startDate = useTimeRangeFilter(selectedRange);

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
      // Le toast est maintenant géré dans updateHistoricalData
    } catch (error) {
      console.error("Error updating historical data:", error);
      // Le toast d'erreur est maintenant géré dans updateHistoricalData
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <ChartContainer
      title="Évolution du Portfolio"
      isLoading={isLoading}
      isUpdating={isUpdating}
      hasData={filteredData?.length > 0}
      selectedRange={selectedRange}
      onRangeChange={setSelectedRange}
      onUpdate={handleUpdateHistoricalData}
    >
      {filteredData?.length > 0 && <PortfolioChart data={filteredData} />}
    </ChartContainer>
  );
}
