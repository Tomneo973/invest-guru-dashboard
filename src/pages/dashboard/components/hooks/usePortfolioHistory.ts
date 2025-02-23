
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
      console.log("Fetching portfolio history data...");

      // Mettre à jour les holdings quotidiens
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) {
        console.error("Error updating holdings:", holdingsError);
        throw holdingsError;
      }

      // Mettre à jour l'historique du portfolio
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) {
        console.error("Error updating history:", historyError);
        throw historyError;
      }

      // Récupérer tout l'historique du portfolio
      const { data: history, error: portfolioHistoryError } = await supabase
        .from("portfolio_history")
        .select("*")
        .order("date", { ascending: true });

      if (portfolioHistoryError) {
        console.error("Error fetching portfolio history:", portfolioHistoryError);
        throw portfolioHistoryError;
      }

      // Récupérer les transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // Récupérer les dividendes
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) {
        console.error("Error fetching dividends:", dividendsError);
        throw dividendsError;
      }

      // S'assurer que nous avons des données pour chaque jour
      const allDates = new Set<string>();
      
      // Ajouter toutes les dates depuis la première transaction jusqu'à aujourd'hui
      if (transactions && transactions.length > 0) {
        let currentDate = new Date(transactions[0].date);
        const today = new Date();
        
        while (currentDate <= today) {
          allDates.add(currentDate.toISOString().split('T')[0]);
          currentDate.setDate(currentDate.getDate() + 1);
        }
      }

      // Convertir en tableau trié
      const sortedDates = Array.from(allDates).sort();

      // Calculer les valeurs cumulatives pour chaque date
      const chartData: PortfolioHistoryData[] = sortedDates.map(date => {
        // Calculer la valeur investie jusqu'à cette date
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

        // Obtenir la valeur du portfolio pour cette date
        const historyEntry = history?.find(h => h.date === date);
        const portfolioValue = historyEntry?.total_value ?? investedValue;

        // Calculer les dividendes cumulés jusqu'à cette date
        const cumulativeDividends = dividends
          ?.filter(d => d.date <= date)
          .reduce((total, d) => total + d.amount, 0) || 0;

        return {
          date,
          portfolioValue,
          investedValue,
          cumulativeDividends,
        };
      });

      console.log("Generated chart data points:", chartData.length);
      return chartData;
    },
  });

  const updateHistoricalData = async () => {
    try {
      // Mettre à jour les prix historiques via la fonction edge
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );

      if (updateError) throw updateError;

      // Mettre à jour les holdings et l'historique
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) throw holdingsError;

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
