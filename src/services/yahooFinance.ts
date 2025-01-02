import { supabase } from "@/integrations/supabase/client";

const BASE_URL = "https://query1.finance.yahoo.com/v8/finance/chart/";

export interface StockData {
  currentPrice: number;
  currency: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    const response = await fetch(`${BASE_URL}${symbol}?interval=1d`);
    const data = await response.json();
    
    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result[0];
    const currentPrice = result.meta.regularMarketPrice;
    const currency = result.meta.currency;

    return {
      currentPrice,
      currency,
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