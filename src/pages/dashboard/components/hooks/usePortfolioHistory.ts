
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

      // 1. Récupérer toutes les transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) throw transactionsError;

      // 2. Récupérer tous les dividendes
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) throw dividendsError;

      // 3. Récupérer tous les prix historiques
      const { data: stockPrices, error: pricesError } = await supabase
        .from("stock_prices")
        .select("*")
        .order("date", { ascending: true });

      if (pricesError) throw pricesError;

      // Créer un ensemble de dates uniques
      const allDates = new Set<string>();
      
      // Ajouter les dates des transactions
      transactions?.forEach(t => allDates.add(t.date));
      // Ajouter les dates des dividendes
      dividends?.forEach(d => allDates.add(d.date));
      // Ajouter les dates des prix
      stockPrices?.forEach(p => allDates.add(p.date));

      // Convertir en tableau trié
      const sortedDates = Array.from(allDates).sort();

      // Calculer les données historiques pour chaque date
      const chartData: PortfolioHistoryData[] = sortedDates.map(date => {
        // 1. Calculer la valeur investie cumulée jusqu'à cette date
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

        // 2. Calculer les dividendes cumulés jusqu'à cette date
        const cumulativeDividends = dividends
          ?.filter(d => d.date <= date)
          .reduce((total, d) => total + d.amount, 0) || 0;

        // 3. Calculer la valeur du portfolio à cette date
        // D'abord, obtenir les holdings à cette date
        const holdings = transactions
          ?.filter(t => t.date <= date)
          .reduce((acc, t) => {
            const currentShares = acc[t.symbol] || 0;
            const newShares = t.type === 'buy' 
              ? currentShares + t.shares 
              : currentShares - t.shares;
            
            if (newShares > 0) {
              acc[t.symbol] = newShares;
            } else {
              delete acc[t.symbol];
            }
            return acc;
          }, {} as Record<string, number>);

        // Calculer la valeur totale en utilisant les prix de clôture
        const portfolioValue = Object.entries(holdings).reduce((total, [symbol, shares]) => {
          const price = stockPrices
            ?.filter(p => p.symbol === symbol && p.date <= date)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
            ?.closing_price || 0;
          
          return total + (shares * price);
        }, 0);

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
