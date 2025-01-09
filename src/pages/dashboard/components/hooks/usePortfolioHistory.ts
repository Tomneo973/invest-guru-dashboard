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
      // Fetch transactions for invested value calculation
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) {
        console.error("Error fetching transactions:", transactionsError);
        throw transactionsError;
      }

      // Fetch portfolio history for actual value
      const { data: history, error: historyError } = await supabase
        .from("portfolio_history")
        .select("*")
        .order("date", { ascending: true });

      if (historyError) {
        console.error("Error fetching portfolio history:", historyError);
        throw historyError;
      }

      // Fetch cumulative dividends
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) {
        console.error("Error fetching dividends:", dividendsError);
        throw dividendsError;
      }

      // Get all unique dates from transactions, history, and dividends
      const allDates = [...new Set([
        ...(transactions?.map(t => t.date) || []),
        ...(history?.map(h => h.date) || []),
        ...(dividends?.map(d => d.date) || [])
      ])].sort();

      // Calculate running totals for each date
      const chartData: PortfolioHistoryData[] = allDates.map(date => {
        // Calculate invested value up to this date
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

        // Get portfolio value for this date
        const portfolioValue = history?.find(h => h.date === date)?.total_value || investedValue;

        // Calculate cumulative dividends up to this date
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
      // Call the edge function to update historical data
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );

      if (updateError) throw updateError;

      // Update portfolio holdings and history
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