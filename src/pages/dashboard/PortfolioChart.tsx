import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "./components/PortfolioStats";
import { PortfolioValueChart } from "./components/PortfolioValueChart";
import { DividendStats } from "./components/DividendStats";
import { getStockPrice } from "@/services/yahooFinance";

export function PortfolioChart() {
  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_portfolio_holdings');
      if (error) throw error;

      // Fetch current prices for all holdings
      const holdingsWithCurrentPrices = await Promise.all(
        data.map(async (holding) => {
          const stockData = await getStockPrice(holding.symbol);
          return {
            ...holding,
            current_value: stockData.currentPrice ? stockData.currentPrice * holding.shares : holding.total_invested,
          };
        })
      );

      return holdingsWithCurrentPrices;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  // Calculate portfolio statistics
  const totalInvested = holdings?.reduce((sum, holding) => sum + holding.total_invested, 0) || 0;
  const totalCurrentValue = holdings?.reduce((sum, holding) => sum + holding.current_value, 0) || 0;
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = (totalReturn / totalInvested) * 100;
  const numberOfPositions = holdings?.length || 0;

  // Calculate returns for each position
  const positionReturns = holdings?.map(holding => ({
    symbol: holding.symbol,
    returnPercentage: ((holding.current_value - holding.total_invested) / holding.total_invested) * 100
  })) || [];

  // Get top and flop 5
  const top5Returns = [...positionReturns]
    .sort((a, b) => b.returnPercentage - a.returnPercentage)
    .slice(0, 5);

  const flop5Returns = [...positionReturns]
    .sort((a, b) => a.returnPercentage - b.returnPercentage)
    .slice(0, 5);

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
      />
      <PortfolioValueChart />
      <DividendStats />
    </div>
  );
}