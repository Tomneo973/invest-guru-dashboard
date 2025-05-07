
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  currentPrice: number | null;
  currency: string;
  error?: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    // Call the Supabase edge function to get the stock price
    // This helps us avoid CORS and rate limiting issues
    const { data, error } = await supabase.functions.invoke('get-stock-price', {
      body: { symbol }
    });

    if (error) {
      console.error(`Supabase function error for ${symbol}:`, error);
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return {
      currentPrice: null,
      currency: 'USD',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

