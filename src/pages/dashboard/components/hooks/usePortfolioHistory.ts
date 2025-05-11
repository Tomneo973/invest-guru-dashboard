
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export interface PortfolioHistoryData {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

// Fonction utilitaire pour obtenir le dernier jour ouvrable (lundi-vendredi)
const getLastBusinessDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  
  // Si nous sommes un dimanche (0), retourner vendredi (moins 2 jours)
  // Si nous sommes un samedi (6), retourner vendredi (moins 1 jour)
  // Sinon, retourner aujourd'hui
  const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 0;
  const lastBusinessDay = new Date(today);
  lastBusinessDay.setDate(today.getDate() - daysToSubtract);
  
  return lastBusinessDay;
};

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
        // Récupérer les données des trois tables en parallèle
        const [portfolioValues, investedValues, dividendValues] = await Promise.all([
          supabase
            .from("portfolio_daily_values")
            .select("date, total_value")
            .lte("date", lastBusinessDay.toISOString().split('T')[0])
            .order("date", { ascending: true }),
          supabase
            .from("portfolio_daily_invested")
            .select("date, total_invested")
            .lte("date", lastBusinessDay.toISOString().split('T')[0])
            .order("date", { ascending: true }),
          supabase
            .from("portfolio_daily_dividends")
            .select("date, total_dividends")
            .lte("date", lastBusinessDay.toISOString().split('T')[0])
            .order("date", { ascending: true })
        ]);

        if (portfolioValues.error) throw portfolioValues.error;
        if (investedValues.error) throw investedValues.error;
        if (dividendValues.error) throw dividendValues.error;

        console.log(`Fetched portfolio data: ${portfolioValues.data.length} values, ${investedValues.data.length} invested values, ${dividendValues.data.length} dividend values`);
        console.log(`Last business day: ${lastBusinessDay.toISOString().split('T')[0]}`);

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
      // Afficher une notification de début de mise à jour
      toast({
        title: "Mise à jour en cours",
        description: "Récupération des données historiques...",
      });
      
      console.log("Starting update of historical data...");
      
      // Mettre à jour les prix historiques
      const updatePricesResponse = await supabase.functions.invoke(
        "update-historical-prices"
      );
      
      console.log("Update prices response:", updatePricesResponse);
      
      if (updatePricesResponse.error) {
        console.error("Error updating historical prices:", updatePricesResponse.error);
        throw new Error(`Erreur lors de la mise à jour des prix: ${updatePricesResponse.error.message}`);
      }
      console.log("Historical prices updated successfully");

      // Mettre à jour les valeurs quotidiennes
      const portfolioValuesResponse = await supabase.rpc(
        "update_daily_portfolio_values"
      );
      
      console.log("Update portfolio values response:", portfolioValuesResponse);
      
      if (portfolioValuesResponse.error) {
        console.error("Error updating daily portfolio values:", portfolioValuesResponse.error);
        throw new Error(`Erreur lors de la mise à jour des valeurs du portfolio: ${portfolioValuesResponse.error.message}`);
      }
      console.log("Daily portfolio values updated successfully");

      // Mettre à jour les montants investis
      const investedResponse = await supabase.rpc(
        "update_daily_invested"
      );
      
      console.log("Update invested response:", investedResponse);
      
      if (investedResponse.error) {
        console.error("Error updating daily invested amounts:", investedResponse.error);
        throw new Error(`Erreur lors de la mise à jour des montants investis: ${investedResponse.error.message}`);
      }
      console.log("Daily invested amounts updated successfully");

      // Mettre à jour les dividendes
      const dividendsResponse = await supabase.rpc(
        "update_daily_dividends"
      );
      
      console.log("Update dividends response:", dividendsResponse);
      
      if (dividendsResponse.error) {
        console.error("Error updating daily dividends:", dividendsResponse.error);
        throw new Error(`Erreur lors de la mise à jour des dividendes: ${dividendsResponse.error.message}`);
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
          `Une erreur est survenue: ${error instanceof Error ? error.message : "Erreur inconnue"}`,
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
