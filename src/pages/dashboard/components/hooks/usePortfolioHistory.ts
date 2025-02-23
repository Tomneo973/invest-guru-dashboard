
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PortfolioHistoryData {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

export function usePortfolioHistory() {
  const { toast } = useToast();

  const {
    data: historyData,
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ["portfolio-history"],
    queryFn: async () => {
      // 1. Mettre à jour la composition quotidienne du portfolio
      console.log("Updating daily holdings...");
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) {
        console.error("Error updating holdings:", holdingsError);
        throw holdingsError;
      }

      // 2. Mettre à jour l'historique des valeurs du portfolio
      console.log("Updating portfolio history...");
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) {
        console.error("Error updating history:", historyError);
        throw historyError;
      }

      // 3. Récupérer les valeurs historiques calculées
      const { data: portfolioHistory, error: historyFetchError } = await supabase
        .from("portfolio_history")
        .select("*")
        .order("date", { ascending: true });

      if (historyFetchError) throw historyFetchError;

      // 4. Récupérer toutes les transactions pour le calcul des montants investis
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) throw transactionsError;

      // 5. Récupérer tous les dividendes
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) throw dividendsError;

      // 6. Créer un ensemble de toutes les dates
      const allDates = new Set([
        ...portfolioHistory?.map(h => h.date) || [],
        ...transactions?.map(t => t.date) || [],
        ...dividends?.map(d => d.date) || [],
      ]);

      // 7. Créer les données pour chaque date
      const chartData: PortfolioHistoryData[] = Array.from(allDates)
        .sort()
        .map(date => {
          // Trouver la valeur du portfolio pour cette date
          const historyEntry = portfolioHistory?.find(h => h.date === date);

          // Calculer le montant investi cumulé jusqu'à cette date
          const investedValue = transactions
            ?.filter(t => t.date <= date)
            .reduce((total, t) => {
              if (t.type === 'buy') {
                return total + (t.shares * t.price);
              } else if (t.type === 'sell') {
                return total - (t.shares * t.price);
              }
              return total;
            }, 0) || 0;

          // Calculer les dividendes cumulés jusqu'à cette date
          const cumulativeDividends = dividends
            ?.filter(d => d.date <= date)
            .reduce((total, d) => total + d.amount, 0) || 0;

          return {
            date,
            portfolioValue: historyEntry?.total_value || investedValue,
            investedValue,
            cumulativeDividends,
          };
        });

      console.log("Generated chart data points:", chartData.length);
      console.log("Last data point:", chartData[chartData.length - 1]);
      
      return chartData;
    },
  });

  const updateHistoricalData = async () => {
    try {
      // 1. Mettre à jour les prix historiques
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );
      if (updateError) throw updateError;

      // 2. Mettre à jour les holdings quotidiens
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) throw holdingsError;

      // 3. Mettre à jour l'historique du portfolio
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) throw historyError;

      await refetch();

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
    }
  };

  return {
    historyData,
    isLoading,
    updateHistoricalData,
  };
}
