
import { useQuery } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import {
  fetchUserTransactions,
  fetchUserDividends,
  fetchStockPricesForPeriod,
  calculatePortfolioDataFromHistory,
  updateAllPortfolioData,
  type CalculatedPortfolioData
} from "./api/portfolioDataCalculator";

export type { CalculatedPortfolioData as PortfolioHistoryData };

export function usePortfolioHistoryFromTransactions() {
  const { toast } = useToast();
  
  const {
    data: historyData,
    isLoading,
    refetch,
    isError,
    error
  } = useQuery({
    queryKey: ["portfolio-history-from-transactions"],
    queryFn: async () => {
      try {
        console.log("Calculating portfolio history from transactions and dividends...");
        
        // Récupérer les transactions et dividendes
        const [transactions, dividends] = await Promise.all([
          fetchUserTransactions(),
          fetchUserDividends()
        ]);

        if (transactions.length === 0) {
          console.log("No transactions found");
          return [];
        }

        // Obtenir les symboles uniques et la plage de dates
        const symbols = [...new Set(transactions.map(t => t.symbol))];
        const allDates = [
          ...transactions.map(t => t.date),
          ...dividends.map(d => d.date)
        ];
        
        const startDate = allDates.reduce((min, date) => date < min ? date : min);
        const endDate = new Date().toISOString().split('T')[0]; // Aujourd'hui

        console.log(`Date range: ${startDate} to ${endDate}`);
        console.log(`Symbols: ${symbols.join(', ')}`);

        // Récupérer les prix historiques pour cette période
        const stockPrices = await fetchStockPricesForPeriod(symbols, startDate, endDate);

        // Calculer les données du portfolio
        const portfolioData = calculatePortfolioDataFromHistory(
          transactions,
          dividends,
          stockPrices
        );

        return portfolioData;
      } catch (error) {
        console.error("Error calculating portfolio history from transactions:", error);
        throw error;
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });

  const updateHistoricalData = async () => {
    try {
      toast({
        title: "Mise à jour en cours",
        description: "Recalcul des données historiques...",
      });
      
      console.log("Starting recalculation of historical data...");
      
      // Mettre à jour les prix historiques d'abord
      await updateAllPortfolioData();
      
      // Puis recalculer les données
      await refetch();
      console.log("Portfolio history recalculated successfully");

      toast({
        title: "Mise à jour réussie",
        description: "Les données historiques ont été recalculées avec succès.",
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

  if (isError) {
    console.error("Error in usePortfolioHistoryFromTransactions hook:", error);
  }

  return {
    historyData,
    isLoading,
    isError,
    error,
    updateHistoricalData,
  };
}
