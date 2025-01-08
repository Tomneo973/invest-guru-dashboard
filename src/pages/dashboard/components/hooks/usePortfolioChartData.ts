import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Transaction, Dividend, HistoricalPrice, ChartDataPoint } from "../types/portfolio-chart";
import { useMemo } from "react";

export function usePortfolioChartData() {
  // Fetch transactions
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch dividends
  const { data: dividends } = useQuery<Dividend[]>({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Dividend[];
    },
  });

  // Get unique symbols and start date
  const startDate = transactions?.[0]?.date;
  const symbols = [...new Set(transactions?.map(t => t.symbol) || [])];

  // Fetch historical prices
  const { data: historicalPrices } = useQuery<HistoricalPrice[]>({
    queryKey: ["historical-prices", symbols, startDate],
    queryFn: async () => {
      if (!symbols.length || !startDate) return [];
      
      const { data, error } = await supabase.functions.invoke("get-historical-prices", {
        body: { symbols, startDate },
      });

      if (error) throw error;
      return data as HistoricalPrice[];
    },
    enabled: !!symbols.length && !!startDate,
  });

  // Calculate chart data
  const chartData = useMemo(() => {
    if (!transactions || !historicalPrices || !dividends) return [];

    const dateMap = new Map<string, ChartDataPoint>();
    let currentHoldings = new Map<string, number>();
    let totalInvested = 0;
    let cumulativeDividends = 0;

    // Sort all dates
    const allDates = [...new Set([
      ...(transactions?.map(t => t.date) || []),
      ...(historicalPrices?.map(p => p.date) || []),
      ...(dividends?.map(d => d.date) || [])
    ])].sort();

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

      // Add dividends
      const dayDividends = dividends.filter(d => d.date === date);
      dayDividends.forEach(dividend => {
        cumulativeDividends += dividend.amount;
      });

      // Calculate portfolio value
      let portfolioValue = 0;
      const dayPrices = historicalPrices.filter(p => p.date === date);
      dayPrices.forEach(price => {
        const shares = currentHoldings.get(price.symbol) || 0;
        portfolioValue += shares * price.closing_price;
      });

      dateMap.set(date, {
        date,
        portfolioValue,
        investedValue: totalInvested,
        cumulativeDividends,
      });
    });

    return Array.from(dateMap.values());
  }, [transactions, historicalPrices, dividends]);

  return { chartData, isLoading: !chartData.length };
}