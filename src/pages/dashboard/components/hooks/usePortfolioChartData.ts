import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Dividend, HistoricalPrice, ChartDataPoint } from "../types/portfolio-chart";
import { useMemo } from "react";

export function usePortfolioChartData() {
  // Fetch transactions
  const { data: transactions, isLoading: isLoadingTransactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      console.log("Fetching transactions...");
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching transactions:", error);
        throw error;
      }
      console.log("Transactions fetched:", data?.length);
      return data as Transaction[];
    },
  });

  // Fetch dividends
  const { data: dividends, isLoading: isLoadingDividends } = useQuery<Dividend[]>({
    queryKey: ["dividends"],
    queryFn: async () => {
      console.log("Fetching dividends...");
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching dividends:", error);
        throw error;
      }
      console.log("Dividends fetched:", data?.length);
      return data as Dividend[];
    },
  });

  // Get unique symbols and date range
  const { symbols, startDate, endDate } = useMemo(() => {
    if (!transactions?.length) return { symbols: [], startDate: null, endDate: null };
    
    const uniqueSymbols = [...new Set(transactions.map(t => t.symbol))];
    const dates = transactions.map(t => new Date(t.date));
    return {
      symbols: uniqueSymbols,
      startDate: new Date(Math.min(...dates)).toISOString().split('T')[0],
      endDate: new Date().toISOString().split('T')[0],
    };
  }, [transactions]);

  // Fetch historical prices
  const { data: historicalPrices, isLoading: isLoadingPrices } = useQuery<HistoricalPrice[]>({
    queryKey: ["historical-prices", symbols, startDate],
    queryFn: async () => {
      if (!symbols.length || !startDate) return [];
      
      console.log("Fetching historical prices for symbols:", symbols);
      const { data, error } = await supabase
        .from("stock_prices")
        .select("*")
        .in("symbol", symbols)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: true });

      if (error) {
        console.error("Error fetching historical prices:", error);
        throw error;
      }
      console.log("Historical prices fetched:", data?.length);
      return data as HistoricalPrice[];
    },
    enabled: !!symbols.length && !!startDate,
  });

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!transactions || !historicalPrices || !dividends) return [];

    console.log("Calculating chart data...");
    const dateMap = new Map<string, ChartDataPoint>();
    let currentHoldings = new Map<string, number>();
    let totalInvested = 0;
    let cumulativeDividends = 0;

    // Get all unique dates
    const allDates = [...new Set([
      ...transactions.map(t => t.date),
      ...historicalPrices.map(p => p.date),
      ...dividends.map(d => d.date)
    ])].sort();

    console.log("Total unique dates:", allDates.length);

    allDates.forEach(date => {
      // Update holdings based on transactions
      const dayTransactions = transactions.filter(t => t.date === date);
      dayTransactions.forEach(transaction => {
        const shares = transaction.type === 'buy' ? transaction.shares : -transaction.shares;
        const currentShares = currentHoldings.get(transaction.symbol) || 0;
        currentHoldings.set(transaction.symbol, currentShares + shares);
        
        if (transaction.type === 'buy') {
          totalInvested += transaction.shares * transaction.price;
        }
      });

      // Calculate portfolio value using historical prices
      let portfolioValue = 0;
      currentHoldings.forEach((shares, symbol) => {
        const price = historicalPrices.find(p => p.date === date && p.symbol === symbol);
        if (price) {
          portfolioValue += shares * price.closing_price;
        } else {
          console.log(`No price found for ${symbol} on ${date}`);
        }
      });

      // Add dividends
      const dayDividends = dividends.filter(d => d.date === date);
      dayDividends.forEach(dividend => {
        cumulativeDividends += dividend.amount;
      });

      dateMap.set(date, {
        date,
        portfolioValue,
        investedValue: totalInvested,
        cumulativeDividends,
      });
    });

    const result = Array.from(dateMap.values());
    console.log("Final chart data points:", result.length);
    return result;
  }, [transactions, historicalPrices, dividends]);

  const isLoading = isLoadingTransactions || isLoadingDividends || isLoadingPrices;

  return { 
    chartData, 
    isLoading,
    hasData: chartData.length > 0 
  };
}