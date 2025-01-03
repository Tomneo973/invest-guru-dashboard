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