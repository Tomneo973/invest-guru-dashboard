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

    if (error) throw error;

    return {
      currentPrice: data.currentPrice,
      currency: data.currency,
    };
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    throw error;
  }
}

export async function getPortfolioCurrentValue() {
  try {
    const { data: transactions, error } = await supabase
      .from("transactions")
      .select("*");

    if (error) throw error;

    const portfolioValue = await Promise.all(
      transactions.map(async (transaction) => {
        try {
          const stockData = await getStockPrice(transaction.symbol);
          return {
            ...transaction,
            currentValue: stockData.currentPrice * transaction.shares,
            currentPrice: stockData.currentPrice,
          };
        } catch (error) {
          console.error(`Error processing ${transaction.symbol}:`, error);
          return {
            ...transaction,
            currentValue: null,
            currentPrice: null,
          };
        }
      })
    );

    return portfolioValue;
  } catch (error) {
    console.error("Error calculating portfolio value:", error);
    throw error;
  }
}