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

  // Prepare portfolio value data (transactions only)
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
      });
    }
    return acc;
  }, []) || [];

  // Sort portfolio data by date
  portfolioData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Prepare dividends data separately
  const dividendsData = dividends?.reduce((acc: any[], dividend) => {
    const date = dividend.date;
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      existingEntry.cumulativeDividends += dividend.amount - (dividend.withheld_taxes || 0);
    } else {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].cumulativeDividends : 0;
      acc.push({
        date,
        cumulativeDividends: lastValue + dividend.amount - (dividend.withheld_taxes || 0),
      });
    }
    return acc;
  }, []) || [];

  // Sort dividends data by date
  dividendsData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Combine both datasets while preserving separate points
  const combinedData = [
    ...portfolioData.map(entry => ({
      date: entry.date,
      portfolioValue: entry.portfolioValue,
      cumulativeDividends: null,
    })),
    ...dividendsData.map(entry => ({
      date: entry.date,
      portfolioValue: null,
      cumulativeDividends: entry.cumulativeDividends,
    })),
  ].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  // Propagate last known values
  let lastPortfolioValue = 0;
  let lastDividendValue = 0;

  combinedData.forEach(entry => {
    if (entry.portfolioValue !== null) {
      lastPortfolioValue = entry.portfolioValue;
    } else {
      entry.portfolioValue = lastPortfolioValue;
    }

    if (entry.cumulativeDividends !== null) {
      lastDividendValue = entry.cumulativeDividends;
    } else {
      entry.cumulativeDividends = lastDividendValue;
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
      <PortfolioValueChart portfolioData={combinedData} />
    </div>
  );
}