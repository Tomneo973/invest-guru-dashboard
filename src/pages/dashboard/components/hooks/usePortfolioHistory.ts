
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

      // Récupérer toutes les transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (transactionsError) throw transactionsError;

      if (!transactions || transactions.length === 0) {
        return [];
      }

      // Récupérer tous les dividendes
      const { data: dividends, error: dividendsError } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (dividendsError) throw dividendsError;

      // Récupérer tous les prix historiques
      const { data: stockPrices, error: pricesError } = await supabase
        .from("stock_prices")
        .select("*")
        .order("date", { ascending: true });

      if (pricesError) throw pricesError;

      // Créer un ensemble de dates uniques à partir des transactions et des prix
      const allDates = new Set<string>();
      transactions.forEach(t => allDates.add(t.date));
      stockPrices?.forEach(p => allDates.add(p.date));
      dividends?.forEach(d => allDates.add(d.date));

      const sortedDates = Array.from(allDates).sort();

      // Pour chaque date, calculer l'état du portfolio
      const chartData: PortfolioHistoryData[] = sortedDates.map(currentDate => {
        // 1. Calculer les positions pour cette date
        const holdings = new Map<string, number>();
        
        // Appliquer toutes les transactions jusqu'à cette date pour obtenir les positions
        transactions
          .filter(t => t.date <= currentDate)
          .forEach(t => {
            const currentShares = holdings.get(t.symbol) || 0;
            const newShares = t.type === 'buy' 
              ? currentShares + t.shares 
              : currentShares - t.shares;
            
            if (newShares > 0) {
              holdings.set(t.symbol, newShares);
            } else {
              holdings.delete(t.symbol);
            }
          });

        // 2. Calculer la valeur du portfolio pour cette date
        let portfolioValue = 0;
        holdings.forEach((shares, symbol) => {
          // Trouver le prix de clôture le plus récent pour cette date
          const latestPrice = stockPrices
            ?.filter(p => p.symbol === symbol && p.date <= currentDate)
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0];

          if (latestPrice) {
            portfolioValue += shares * latestPrice.closing_price;
          }
        });

        // 3. Calculer le montant total investi jusqu'à cette date
        const investedValue = transactions
          .filter(t => t.date <= currentDate)
          .reduce((total, t) => {
            if (t.type === 'buy') {
              return total + (t.shares * t.price);
            } else if (t.type === 'sell') {
              return total - (t.shares * t.price);
            }
            return total;
          }, 0);

        // 4. Calculer les dividendes cumulés jusqu'à cette date
        const cumulativeDividends = dividends
          ?.filter(d => d.date <= currentDate)
          .reduce((total, d) => total + d.amount, 0) || 0;

        return {
          date: currentDate,
          portfolioValue,
          investedValue,
          cumulativeDividends,
        };
      });

      console.log("Generated chart data points:", chartData.length);
      
      // Log quelques points de données pour vérification
      const lastPoint = chartData[chartData.length - 1];
      console.log("Last data point:", {
        date: lastPoint.date,
        portfolioValue: lastPoint.portfolioValue,
        investedValue: lastPoint.investedValue,
        cumulativeDividends: lastPoint.cumulativeDividends,
      });

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
