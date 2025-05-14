
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { getLastBusinessDay } from "../utils/dataUtils";
import { 
  fetchPortfolioValues, 
  fetchInvestedValues, 
  fetchDividendValues,
  updateAllPortfolioData,
  type PortfolioHistoryData
} from "./api/portfolioDataApi";
import { 
  processPortfolioData, 
  checkForAnomalies 
} from "./utils/portfolioDataProcessor";

export type { PortfolioHistoryData };

export function usePortfolioHistory() {
  const { toast } = useToast();
  const lastBusinessDay = getLastBusinessDay();
  
  const {
    data: historyData,
    isLoading,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ["portfolio-history"],
    queryFn: async () => {
      try {
        console.log("Fetching portfolio history data...");
        console.log(`Last business day: ${lastBusinessDay.toISOString().split('T')[0]}`);
        
        // Fetch data from all three tables in parallel
        const [portfolioValues, investedValues, dividendValues] = await Promise.all([
          fetchPortfolioValues(lastBusinessDay),
          fetchInvestedValues(lastBusinessDay),
          fetchDividendValues(lastBusinessDay)
        ]);

        console.log(`Fetched portfolio data: ${portfolioValues.length} values, ${investedValues.length} invested values, ${dividendValues.length} dividend values`);

        // Log the latest dates for each data type
        if (portfolioValues.length > 0) {
          const latestPortfolioDate = portfolioValues[portfolioValues.length - 1].date;
          console.log(`Latest portfolio value date: ${latestPortfolioDate}`);
        }
        
        if (investedValues.length > 0) {
          const latestInvestedDate = investedValues[investedValues.length - 1].date;
          console.log(`Latest invested value date: ${latestInvestedDate}`);
        }
        
        if (dividendValues.length > 0) {
          const latestDividendDate = dividendValues[dividendValues.length - 1].date;
          console.log(`Latest dividend value date: ${latestDividendDate}`);
        }

        // Check if we have data for the last business day
        const lastBusinessDayStr = lastBusinessDay.toISOString().split('T')[0];
        const hasLatestPortfolioData = portfolioValues.some(v => v.date === lastBusinessDayStr);
        const hasLatestInvestedData = investedValues.some(v => v.date === lastBusinessDayStr);
        const hasLatestDividendData = dividendValues.some(v => v.date === lastBusinessDayStr);
        
        console.log(`Has latest data for ${lastBusinessDayStr}? Portfolio: ${hasLatestPortfolioData}, Invested: ${hasLatestInvestedData}, Dividends: ${hasLatestDividendData}`);

        // Process the data
        const chartData = processPortfolioData(
          portfolioValues,
          investedValues,
          dividendValues
        );

        console.log(`Generated ${chartData.length} chart data points`);
        if (chartData.length > 0) {
          const lastDataPoint = chartData[chartData.length - 1];
          console.log(`Last data point: date = ${lastDataPoint.date}, value = ${lastDataPoint.portfolioValue}`);
        }
        
        // Check for anomalies
        checkForAnomalies(chartData);

        return chartData;
      } catch (error) {
        console.error("Error fetching portfolio history data:", error);
        throw error;
      }
    },
  });

  const updateHistoricalData = async () => {
    try {
      // Show notification that update is in progress
      toast({
        title: "Mise à jour en cours",
        description: "Récupération des données historiques...",
      });
      
      console.log("Starting update of historical data...");
      
      // Update all portfolio data in the correct order
      await updateAllPortfolioData();
      
      console.log("All portfolio data updated successfully");

      // Refetch the data
      await refetch();
      console.log("Portfolio history data refetched successfully");

      toast({
        title: "Mise à jour réussie",
        description: "Les données historiques ont été mises à jour avec succès jusqu'au dernier jour ouvré.",
      });
    } catch (error) {
      console.error("Error updating historical data:", error);
      toast({
        title: "Erreur",
        description: `Une erreur est survenue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
        variant: "destructive",
      });
    }
  };

  // Si aucune donnée ou erreur, afficher un message d'erreur détaillé pour aider au débogage
  if (isError) {
    console.error("Error in usePortfolioHistory hook:", error);
  }

  return {
    historyData,
    isLoading,
    isError,
    error,
    updateHistoricalData,
  };
}
