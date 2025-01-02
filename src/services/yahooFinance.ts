import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  currentPrice: number | null;
  currency: string;
  error?: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol }
    });

    if (error) {
      console.error(`Error fetching stock price for ${symbol}:`, error);
      return {
        currentPrice: null,
        currency: 'USD',
        error: error.message
      };
    }

    // If we got an error message in the response, log it but don't throw
    if (data.error) {
      console.warn(`Warning for ${symbol}:`, data.error);
    }

    return {
      currentPrice: data.currentPrice,
      currency: data.currency || 'USD',
      error: data.error
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return {
      currentPrice: null,
      currency: 'USD',
      error: error instanceof Error ? error.message : 'Unknown error'
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
            currentValue: stockData.currentPrice !== null 
              ? stockData.currentPrice * transaction.shares 
              : transaction.shares * transaction.price, // Fallback to purchase price
            currentPrice: stockData.currentPrice !== null 
              ? stockData.currentPrice 
              : transaction.price, // Fallback to purchase price
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