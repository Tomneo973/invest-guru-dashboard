import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Skeleton } from "@/components/ui/skeleton";
import { PortfolioStats } from "./components/PortfolioStats";
import { PortfolioValueChart } from "./components/PortfolioValueChart";
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

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  const { data: dividends, isLoading: isLoadingDividends } = useQuery({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading || isLoadingTransactions || isLoadingDividends) {
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

  // Prepare portfolio value data
  const portfolioData = transactions?.reduce((acc: any[], transaction) => {
    const date = transaction.date;
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      const transactionValue = transaction.type === "buy" 
        ? transaction.shares * transaction.price
        : -(transaction.shares * transaction.price);
      existingEntry.portfolioValue += transactionValue;
    } else {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].portfolioValue : 0;
      const transactionValue = transaction.type === "buy" 
        ? transaction.shares * transaction.price
        : -(transaction.shares * transaction.price);
      
      acc.push({
        date,
        portfolioValue: lastValue + transactionValue,
        cumulativeDividends: 0,
      });
    }
    return acc;
  }, []) || [];

  // Calculate cumulative dividends separately
  let cumulativeDividendAmount = 0;
  dividends?.forEach(dividend => {
    const existingEntry = portfolioData.find(entry => entry.date === dividend.date);
    cumulativeDividendAmount += dividend.amount - (dividend.withheld_taxes || 0);
    
    if (existingEntry) {
      existingEntry.cumulativeDividends = cumulativeDividendAmount;
    } else {
      const lastPortfolioValue = portfolioData.length > 0 
        ? portfolioData[portfolioData.length - 1].portfolioValue 
        : 0;
      
      portfolioData.push({
        date: dividend.date,
        portfolioValue: lastPortfolioValue,
        cumulativeDividends: cumulativeDividendAmount,
      });
    }
  });

  // Sort data by date and propagate cumulative dividends
  portfolioData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  
  // Propagate the last known cumulative dividend value to subsequent dates
  let lastKnownDividendValue = 0;
  portfolioData.forEach(entry => {
    if (entry.cumulativeDividends > 0) {
      lastKnownDividendValue = entry.cumulativeDividends;
    } else {
      entry.cumulativeDividends = lastKnownDividendValue;
    }
  });

  return (
    <div className="w-full space-y-4">
      <PortfolioStats
        totalInvested={totalInvested}
        totalCurrentValue={totalCurrentValue}
        totalReturn={totalReturn}
        totalReturnPercentage={totalReturnPercentage}
        numberOfPositions={numberOfPositions}
        top5Returns={top5Returns}
        flop5Returns={flop5Returns}
      />
      <PortfolioValueChart portfolioData={portfolioData} />
    </div>
  );
}