import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  currentPrice: number;
  currency: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol }
    });

    if (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      throw error;
    }

    if (!data || !data.currentPrice) {
      console.warn(`No price data available for ${symbol}`);
      return {
        currentPrice: 0,
        currency: 'USD'
      };
    }

    return {
      currentPrice: data.currentPrice,
      currency: data.currency || 'USD',
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return {
      currentPrice: 0,
      currency: 'USD'
    };
  }
}

export async function getPortfolioCurrentValue() {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*");

    if (error) throw error;

    // Group transactions by symbol to avoid duplicate API calls
    const symbolGroups = transactions.reduce((acc: { [key: string]: any[] }, transaction) => {
      if (!acc[transaction.symbol]) {
        acc[transaction.symbol] = [];
      }
      acc[transaction.symbol].push(transaction);
      return acc;
    }, {});

    const portfolioValue = await Promise.all(
      Object.entries(symbolGroups).map(async ([symbol, transactions]) => {
        try {
          const stockData = await getStockPrice(symbol);
          return transactions.map(transaction => ({
            ...transaction,
            currentValue: stockData.currentPrice * transaction.shares,
            currentPrice: stockData.currentPrice,
          }));
        } catch (error) {
          console.error(`Error processing ${symbol}:`, error);
          return transactions.map(transaction => ({
            ...transaction,
            currentValue: transaction.shares * transaction.price, // Fallback to purchase price
            currentPrice: transaction.price, // Fallback to purchase price
          }));
        }
      })
    );

    return portfolioValue.flat();
  } catch (error) {
    console.error("Error calculating portfolio value:", error);
    throw error;
  }
}