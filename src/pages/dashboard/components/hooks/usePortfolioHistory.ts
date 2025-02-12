
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
      console.log("Fetching portfolio history...");
      
      // 1. Mettre à jour les holdings quotidiens
      console.log("Updating daily holdings...");
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) {
        console.error("Error updating holdings:", holdingsError);
        throw holdingsError;
      }

      // 2. Mettre à jour l'historique du portfolio
      console.log("Updating portfolio history...");
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) {
        console.error("Error updating history:", historyError);
        throw historyError;
      }

      // 3. Récupérer les données de l'historique
      const { data: history, error: historyFetchError } = await supabase
        .from("portfolio_history")
        .select("*")
        .order("date", { ascending: true });

      if (historyFetchError) {
        console.error("Error fetching history:", historyFetchError);
        throw historyFetchError;
      }

      // 4. Récupérer les transactions pour calculer le montant investi
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // 5. Récupérer les dividendes
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) {
        console.error("Error fetching dividends:", dividendsError);
        throw dividendsError;
      }

      // 6. Créer un ensemble de dates uniques
      const allDates = new Set<string>();
      history?.forEach(h => allDates.add(h.date));
      transactions?.forEach(t => allDates.add(t.date));
      dividends?.forEach(d => allDates.add(d.date));

      // 7. Convertir en tableau trié
      const sortedDates = Array.from(allDates).sort();

      // 8. Calculer les données pour chaque date
      const chartData: PortfolioHistoryData[] = sortedDates.map(date => {
        // Trouver la valeur du portfolio pour cette date
        const historyEntry = history?.find(h => h.date === date);
        
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
          portfolioValue: historyEntry?.total_value || 0,
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
      // 1. Mettre à jour les prix historiques
      console.log("Updating historical prices...");
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );
      if (updateError) throw updateError;

      // 2. Mettre à jour les holdings quotidiens
      console.log("Updating daily holdings...");
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) throw holdingsError;

      // 3. Mettre à jour l'historique du portfolio
      console.log("Updating portfolio history...");
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) throw historyError;

      // 4. Rafraîchir les données
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
