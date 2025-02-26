
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
      // Récupérer les données des trois tables en parallèle
      const [portfolioValues, investedValues, dividendValues] = await Promise.all([
        supabase
          .from("portfolio_daily_values")
          .select("date, total_value")
          .order("date", { ascending: true }),
        supabase
          .from("portfolio_daily_invested")
          .select("date, total_invested")
          .order("date", { ascending: true }),
        supabase
          .from("portfolio_daily_dividends")
          .select("date, total_dividends")
          .order("date", { ascending: true })
      ]);

      if (portfolioValues.error) throw portfolioValues.error;
      if (investedValues.error) throw investedValues.error;
      if (dividendValues.error) throw dividendValues.error;

      // Créer un Map pour chaque type de données pour un accès rapide
      const valuesByDate = new Map(
        portfolioValues.data.map(v => [v.date, v.total_value])
      );
      const investedByDate = new Map(
        investedValues.data.map(v => [v.date, v.total_invested])
      );
      const dividendsByDate = new Map(
        dividendValues.data.map(v => [v.date, v.total_dividends])
      );

      // Obtenir toutes les dates uniques
      const allDates = [...new Set([
        ...portfolioValues.data.map(v => v.date),
        ...investedValues.data.map(v => v.date),
        ...dividendValues.data.map(v => v.date)
      ])].sort();

      // Générer les données pour chaque date
      const chartData: PortfolioHistoryData[] = allDates.map(date => ({
        date,
        portfolioValue: valuesByDate.get(date) || 0,
        investedValue: investedByDate.get(date) || 0,
        cumulativeDividends: dividendsByDate.get(date) || 0
      }));

      console.log("Generated chart data:", chartData);
      return chartData;
    },
  });

  const updateHistoricalData = async () => {
    try {
      // Mettre à jour les prix historiques
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );
      if (updateError) throw updateError;

      // Mettre à jour les valeurs quotidiennes
      const { error: portfolioError } = await supabase.rpc(
        "update_daily_portfolio_values"
      );
      if (portfolioError) throw portfolioError;

      // Mettre à jour les montants investis
      const { error: investedError } = await supabase.rpc(
        "update_daily_invested"
      );
      if (investedError) throw investedError;

      // Mettre à jour les dividendes
      const { error: dividendsError } = await supabase.rpc(
        "update_daily_dividends"
      );
      if (dividendsError) throw dividendsError;

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
