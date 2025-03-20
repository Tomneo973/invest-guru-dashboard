
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "./components/PortfolioStats";
import { PortfolioValueChart } from "./components/PortfolioValueChart";
import { getStockPrice } from "@/services/yahooFinance";
import { usePortfolioHistory } from "./components/hooks/usePortfolioHistory";

export function PortfolioChart() {
  const { historyData, isLoading: isLoadingHistory } = usePortfolioHistory();
  
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

  if (isLoading || isLoadingHistory) {
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

  // Format history data for the chart
  const chartData = historyData?.map(item => ({
    date: item.date,
    value: item.portfolioValue
  })) || [];

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
      <PortfolioValueChart data={chartData} />
    </div>
  );
}
