
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
      // Récupérer toutes les données nécessaires en parallèle
      const [
        transactionsResult,
        holdingsResult,
        pricesResult,
        dividendsResult
      ] = await Promise.all([
        supabase
          .from("transactions")
          .select("*")
          .order("date", { ascending: true }),
        supabase
          .from("portfolio_daily_holdings")
          .select("*")
          .order("date", { ascending: true }),
        supabase
          .from("stock_prices")
          .select("*")
          .order("date", { ascending: true }),
        supabase
          .from("dividends")
          .select("*")
          .order("date", { ascending: true })
      ]);

      if (transactionsResult.error) throw transactionsResult.error;
      if (holdingsResult.error) throw holdingsResult.error;
      if (pricesResult.error) throw pricesResult.error;
      if (dividendsResult.error) throw dividendsResult.error;

      const transactions = transactionsResult.data;
      const holdings = holdingsResult.data;
      const prices = pricesResult.data;
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

      // 2. Créer une Map des prix par symbol et date pour un accès rapide
      const pricesBySymbolAndDate = new Map<string, Map<string, number>>();
      prices.forEach(price => {
        if (!pricesBySymbolAndDate.has(price.symbol)) {
          pricesBySymbolAndDate.set(price.symbol, new Map());
        }
        pricesBySymbolAndDate.get(price.symbol)?.set(price.date, price.closing_price);
      });

      // 3. Générer les données pour chaque jour où nous avons des holdings
      const holdingDates = [...new Set(holdings.map(h => h.date))].sort();
      
      const chartData = holdingDates.map(date => {
        // Calculer la valeur du portfolio pour cette date
        const portfolioValue = holdings
          .filter(h => h.date === date)
          .reduce((total, holding) => {
            const price = pricesBySymbolAndDate.get(holding.symbol)?.get(date);
            return total + (price || 0) * holding.shares;
          }, 0);

        // Trouver la dernière valeur investie connue jusqu'à cette date
        const lastInvestedAmount = Array.from(investedAmounts.entries())
          .filter(([transactionDate]) => transactionDate <= date)
          .reduce((latest, current) => 
            current[0] > latest[0] ? current : latest,
            ['0', 0]
          )[1];

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

      // Ajouter la date d'aujourd'hui avec les dernières valeurs connues
      const today = new Date().toISOString().split('T')[0];
      if (!chartData.find(d => d.date === today) && chartData.length > 0) {
        const lastEntry = chartData[chartData.length - 1];
        chartData.push({
          date: today,
          portfolioValue: lastEntry.portfolioValue,
          investedValue: lastEntry.investedValue,
          cumulativeDividends: lastEntry.cumulativeDividends,
        });
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

      // Mettre à jour l'historique du portfolio
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
