
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "./components/PortfolioStats";
import { PortfolioValueChart } from "./components/PortfolioValueChart";
import { getStockPrice } from "@/services/yahooFinance";
import { useToast } from "@/hooks/use-toast";

export function PortfolioChart() {
  const { toast } = useToast();
  
  const { data: holdings, isLoading, error, isError } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      try {
        console.log("Fetching portfolio holdings...");
        const { data, error } = await supabase.rpc('get_portfolio_holdings');
        
        if (error) {
          console.error("Error fetching portfolio holdings:", error);
          toast({
            title: "Erreur",
            description: `Impossible de récupérer les positions du portfolio: ${error.message}`,
            variant: "destructive",
          });
          throw error;
        }

        console.log(`Fetched ${data.length} portfolio holdings`);
        
        // Fetch current prices for all holdings
        console.log("Fetching current prices for holdings...");
        const holdingsWithCurrentPrices = await Promise.all(
          data.map(async (holding) => {
            try {
              const stockData = await getStockPrice(holding.symbol);
              return {
                ...holding,
                current_price: stockData.currentPrice,
                current_value: stockData.currentPrice ? stockData.currentPrice * holding.shares : holding.total_invested,
                price_error: stockData.error,
              };
            } catch (error) {
              console.error(`Error fetching price for ${holding.symbol}:`, error);
              return {
                ...holding,
                current_price: null,
                current_value: holding.total_invested, // Use invested value as fallback
                price_error: error instanceof Error ? error.message : 'Unknown error',
              };
            }
          })
        );

        // Log any holdings where price fetching failed
        const failedPriceFetches = holdingsWithCurrentPrices.filter(h => h.price_error);
        if (failedPriceFetches.length > 0) {
          console.warn(`Failed to fetch prices for ${failedPriceFetches.length} symbols:`, 
            failedPriceFetches.map(h => `${h.symbol}: ${h.price_error}`));
        }

        return holdingsWithCurrentPrices;
      } catch (error) {
        console.error("Error in portfolio holdings query:", error);
        throw error;
      }
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }
  
  if (isError) {
    console.error("Error loading portfolio data:", error);
    return (
      <div className="w-full space-y-8">
        <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-lg font-medium text-red-800 mb-2">Erreur de chargement des données</h3>
          <p className="text-red-600">
            Une erreur est survenue lors du chargement des données du portfolio. 
            Veuillez réessayer dans quelques instants ou cliquer sur "Mettre à jour" dans le graphique ci-dessous.
          </p>
          <p className="text-sm text-red-500 mt-2">
            Détail de l'erreur: {error instanceof Error ? error.message : 'Erreur inconnue'}
          </p>
        </div>
        <PortfolioValueChart />
      </div>
    );
  }

  // Calculate portfolio statistics
  const totalInvested = holdings?.reduce((sum, holding) => sum + holding.total_invested, 0) || 0;
  const totalCurrentValue = holdings?.reduce((sum, holding) => sum + holding.current_value, 0) || 0;
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = totalInvested > 0 ? (totalReturn / totalInvested) * 100 : 0;
  const numberOfPositions = holdings?.length || 0;

  // Calculate returns for each position
  const positionReturns = holdings?.map(holding => ({
    symbol: holding.symbol,
    returnPercentage: holding.total_invested > 0 
      ? ((holding.current_value - holding.total_invested) / holding.total_invested) * 100
      : 0
  })) || [];

  // Get top and flop 5
  const top5Returns = [...positionReturns]
    .sort((a, b) => b.returnPercentage - a.returnPercentage)
    .slice(0, 5);

  const flop5Returns = [...positionReturns]
    .sort((a, b) => a.returnPercentage - b.returnPercentage)
    .slice(0, 5);

  // Calcul des montants par devise
  const currencyAmounts = holdings?.reduce((acc, holding) => {
    const currency = holding.currency;
    const existingCurrency = acc.find(item => item.currency === currency);
    
    if (existingCurrency) {
      existingCurrency.amount += holding.current_value;
    } else {
      acc.push({ currency, amount: holding.current_value });
    }
    
    return acc;
  }, [] as Array<{ currency: string; amount: number }>) || [];

  return (
    <div className="w-full space-y-8">
      <PortfolioStats
        totalInvested={totalInvested}
        totalCurrentValue={totalCurrentValue}
        totalReturn={totalReturn}
        totalReturnPercentage={totalReturnPercentage}
        numberOfPositions={numberOfPositions}
        top5Returns={top5Returns}
        flop5Returns={flop5Returns}
        currencyAmounts={currencyAmounts}
      />
      <PortfolioValueChart />
    </div>
  );
}
