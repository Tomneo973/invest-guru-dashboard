
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { addDays, parseISO } from "date-fns";

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
      // Mettre à jour l'historique du portfolio si nécessaire
      const { error: historyError } = await supabase.rpc(
        "update_portfolio_history"
      );
      if (historyError) {
        console.error("Error updating history:", historyError);
        throw historyError;
      }

      // Récupérer toutes les données nécessaires en parallèle
      const [transactionsResult, historyResult, dividendsResult] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: true }),
        supabase
          .from("portfolio_history")
          .select("*")
          .order("date", { ascending: true }),
        supabase
          .from("dividends")
          .select("*")
          .order("date", { ascending: true })
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (historyResult.error) throw historyResult.error;
      if (dividendsResult.error) throw dividendsResult.error;

      const transactions = transactionsResult.data;
      const history = historyResult.data;
      const dividends = dividendsResult.data;

      // 1. Calculer les montants investis pour chaque date de transaction
      const investedAmounts = new Map<string, number>();
      let runningInvestedAmount = 0;

      transactions.forEach(t => {
        if (t.type === 'buy') {
          runningInvestedAmount += (t.shares * t.price);
        } else if (t.type === 'sell') {
          runningInvestedAmount -= (t.shares * t.price);
        }
        investedAmounts.set(t.date, runningInvestedAmount);
      });

      // 2. Générer une liste de toutes les dates entre la première et aujourd'hui
      const firstDate = history.length > 0 ? parseISO(history[0].date) : new Date();
      const today = new Date();
      const allDates: string[] = [];
      let currentDate = firstDate;

      while (currentDate <= today) {
        allDates.push(currentDate.toISOString().split('T')[0]);
        currentDate = addDays(currentDate, 1);
      }

      // 3. Générer les données pour chaque jour
      const chartData: PortfolioHistoryData[] = allDates.map(date => {
        // Trouver la dernière valeur investie connue jusqu'à cette date
        const lastInvestedAmount = Array.from(investedAmounts.entries())
          .filter(([transactionDate]) => transactionDate <= date)
          .reduce((latest, current) => 
            current[0] > latest[0] ? current : latest,
            ['0', 0]
          )[1];

        // Trouver la valeur du portfolio pour cette date
        const portfolioEntry = history.find(h => h.date === date);
        
        // Si pas de valeur pour cette date, prendre la dernière valeur connue
        let portfolioValue = portfolioEntry?.total_value;
        if (!portfolioValue) {
          const lastKnownValue = history
            .filter(h => h.date <= date)
            .sort((a, b) => b.date.localeCompare(a.date))[0];
          portfolioValue = lastKnownValue?.total_value || lastInvestedAmount;
        }

        // Calculer les dividendes cumulés jusqu'à cette date
        const cumulativeDividends = dividends
          .filter(d => d.date <= date)
          .reduce((total, d) => total + d.amount, 0);

        return {
          date,
          portfolioValue,
          investedValue: lastInvestedAmount,
          cumulativeDividends,
        };
      });

      // Ajouter la date d'aujourd'hui si elle n'est pas déjà présente
      const todayStr = today.toISOString().split('T')[0];
      if (!chartData.find(d => d.date === todayStr)) {
        const lastEntry = chartData[chartData.length - 1];
        if (lastEntry) {
          chartData.push({
            date: todayStr,
            portfolioValue: lastEntry.portfolioValue,
            investedValue: lastEntry.investedValue,
            cumulativeDividends: lastEntry.cumulativeDividends,
          });
        }
      }

      console.log("Generated chart data:", chartData);
      return chartData.sort((a, b) => a.date.localeCompare(b.date));
    },
  });

  const updateHistoricalData = async () => {
    try {
      // Mettre à jour les prix historiques
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
