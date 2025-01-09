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
      // Fetch portfolio history
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

      // Calculate cumulative dividends
      let cumulativeDividends = 0;
      const dividendsByDate = new Map<string, number>();
      dividends?.forEach((dividend) => {
        cumulativeDividends += dividend.amount;
        dividendsByDate.set(dividend.date, cumulativeDividends);
      });

      // Combine all data
      const chartData: PortfolioHistoryData[] = history?.map((record) => ({
        date: record.date,
        portfolioValue: record.total_value,
        investedValue: record.total_value, // This will be updated with actual invested value if needed
        cumulativeDividends: dividendsByDate.get(record.date) || cumulativeDividends,
      })) || [];

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