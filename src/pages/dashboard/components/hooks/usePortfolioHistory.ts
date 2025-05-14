
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/components/ui/use-toast";
import { getLastBusinessDay } from "../utils/dataUtils";
import { 
  fetchPortfolioValues, 
  fetchInvestedValues, 
  fetchDividendValues,
  updateHistoricalPrices,
  updateDailyPortfolioValues,
  updateDailyInvested,
  updateDailyDividends,
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
      
      // Update historical prices
      await updateHistoricalPrices();
      console.log("Historical prices updated successfully");

      // Update daily portfolio values
      await updateDailyPortfolioValues();
      console.log("Daily portfolio values updated successfully");

      // Update invested amounts
      await updateDailyInvested();
      console.log("Daily invested amounts updated successfully");

      // Update dividends
      await updateDailyDividends();
      console.log("Daily dividends updated successfully");

      // Refetch the data
      await refetch();
      console.log("Portfolio history data refetched successfully");

      toast({
        title: "Mise à jour réussie",
        description: "Les données historiques ont été mises à jour avec succès.",
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

  return {
    historyData,
    isLoading,
    updateHistoricalData,
  };
}
