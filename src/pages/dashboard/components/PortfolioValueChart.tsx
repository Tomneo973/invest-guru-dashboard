
import React, { useEffect, useState } from "react";
import { usePortfolioHistoryFromTransactions } from "./hooks/usePortfolioHistoryFromTransactions";
import { TimeRange, useTimeRangeFilter } from "./hooks/useTimeRangeFilter";
import { ChartContainer } from "./chart/ChartContainer";
import { PortfolioChart } from "./chart/PortfolioChart";

export function PortfolioValueChart() {
  const [selectedRange, setSelectedRange] = React.useState<TimeRange>("1m");
  const { historyData, isLoading, updateHistoricalData } = usePortfolioHistoryFromTransactions();
  const [isUpdating, setIsUpdating] = useState(false);
  const startDate = useTimeRangeFilter(selectedRange);

  const filteredData = React.useMemo(() => {
    if (!historyData) return [];
    
    console.log(`Filtering ${historyData.length} data points for range ${selectedRange}`);
    
    // Filtrer par plage de dates
    const dateFiltered = historyData.filter(
      (data) => {
        const dataDate = new Date(data.date);
        return dataDate >= startDate;
      }
    );
    
    console.log(`Filtered data contains ${dateFiltered.length} points from ${dateFiltered[0]?.date || 'N/A'} to ${dateFiltered[dateFiltered.length-1]?.date || 'N/A'}`);
    
    return dateFiltered;
  }, [historyData, startDate, selectedRange]);

  const handleUpdateHistoricalData = async () => {
    setIsUpdating(true);
    try {
      await updateHistoricalData();
    } catch (error) {
      console.error("Error updating historical data:", error);
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
