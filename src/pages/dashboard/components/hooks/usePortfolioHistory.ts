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
      // Mettre à jour les holdings quotidiens
      console.log("Updating daily holdings...");
      const { error: holdingsError } = await supabase.rpc(
        "update_portfolio_daily_holdings"
      );
      if (holdingsError) {
        console.error("Error updating holdings:", holdingsError);
        throw holdingsError;
      }

      // Mettre à jour l'historique du portfolio
      console.log("Updating portfolio history...");
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) {
        console.error("Error updating history:", historyError);
        throw historyError;
      }

      // Récupérer les transactions pour le calcul de la valeur investie
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // Récupérer l'historique du portfolio pour la valeur réelle
      const { data: history, error: portfolioHistoryError } = await supabase
        .from("portfolio_history")
        .select("*")
        .order("date", { ascending: true });

      if (portfolioHistoryError) {
        console.error("Error fetching portfolio history:", portfolioHistoryError);
        throw portfolioHistoryError;
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

      // S'assurer que nous avons des données jusqu'à aujourd'hui
      const today = new Date().toISOString().split('T')[0];
      const allDates = [...new Set([
        ...(transactions?.map(t => t.date) || []),
        ...(history?.map(h => h.date) || []),
        ...(dividends?.map(d => d.date) || []),
        today // Ajouter la date d'aujourd'hui
      ])].sort();

      // Calculer les totaux pour chaque date
      const chartData: PortfolioHistoryData[] = allDates.map(date => {
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
        const portfolioValue = history?.find(h => h.date === date)?.total_value || investedValue;

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

      console.log("Generated chart data:", chartData);
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