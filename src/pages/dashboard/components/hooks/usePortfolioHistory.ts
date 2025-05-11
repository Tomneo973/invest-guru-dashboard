
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
      try {
        console.log("Fetching portfolio history data...");
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

        console.log(`Fetched portfolio data: ${portfolioValues.data.length} values, ${investedValues.data.length} invested values, ${dividendValues.data.length} dividend values`);

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
        const chartData: PortfolioHistoryData[] = allDates.map(date => {
          const portfolioValue = valuesByDate.get(date) || 0;
          const investedValue = investedByDate.get(date) || 0;
          const cumulativeDividends = dividendsByDate.get(date) || 0;
          
          return {
            date,
            portfolioValue,
            investedValue,
            cumulativeDividends
          };
        });

        console.log(`Generated ${chartData.length} chart data points`);
        
        // Vérification des anomalies
        const anomalies = chartData.filter(item => {
          // Valeurs négatives ou nulles
          if (item.portfolioValue <= 0) return true;
          
          // Valeurs anormalement élevées par rapport à la valeur investie
          if (item.portfolioValue > item.investedValue * 5) return true;
          
          // Valeurs anormalement basses par rapport à la valeur investie
          if (item.portfolioValue < item.investedValue * 0.2 && item.investedValue > 0) return true;
          
          return false;
        });
        
        if (anomalies.length > 0) {
          console.warn(`Found ${anomalies.length} anomalous data points:`, anomalies);
        }

        return chartData;
      } catch (error) {
        console.error("Error fetching portfolio history data:", error);
        throw error;
      }
    },
  });

  const updateHistoricalData = async () => {
    try {
      console.log("Starting update of historical data...");
      
      // Mettre à jour les prix historiques
      const { error: updateError } = await supabase.functions.invoke(
        "update-historical-prices"
      );
      if (updateError) {
        console.error("Error updating historical prices:", updateError);
        throw updateError;
      }
      console.log("Historical prices updated successfully");

      // Mettre à jour les valeurs quotidiennes
      const { error: portfolioError } = await supabase.rpc(
        "update_daily_portfolio_values"
      );
      if (portfolioError) {
        console.error("Error updating daily portfolio values:", portfolioError);
        throw portfolioError;
      }
      console.log("Daily portfolio values updated successfully");

      // Mettre à jour les montants investis
      const { error: investedError } = await supabase.rpc(
        "update_daily_invested"
      );
      if (investedError) {
        console.error("Error updating daily invested amounts:", investedError);
        throw investedError;
      }
      console.log("Daily invested amounts updated successfully");

      // Mettre à jour les dividendes
      const { error: dividendsError } = await supabase.rpc(
        "update_daily_dividends"
      );
      if (dividendsError) {
        console.error("Error updating daily dividends:", dividendsError);
        throw dividendsError;
      }
      console.log("Daily dividends updated successfully");

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
        description:
          "Une erreur est survenue lors de la mise à jour des données historiques.",
        variant: "destructive",
      });
      throw error;
    }
  };

  return {
    historyData,
    isLoading,
    updateHistoricalData,
  };
}
