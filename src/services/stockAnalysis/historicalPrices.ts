
import { supabase } from "@/integrations/supabase/client";
import { HistoricalPrice } from "./types";

export async function getHistoricalPrices(symbol: string): Promise<HistoricalPrice[]> {
  try {
    console.log('Fetching historical prices for:', symbol);
    // Use the Supabase Cloud function to get the price history
    const { data, error } = await supabase.functions.invoke('get-historical-prices', {
      body: { symbol, period: '5y', interval: '1mo' }
    });

    if (error) {
      console.error(`Error invoking get-historical-prices for ${symbol}:`, error);
      throw error;
    }

    if (data.error) {
      console.error(`Error in get-historical-prices for ${symbol}:`, data.error);
      throw new Error(data.error);
    }

    // Ensure we have valid data
    const prices = data.prices || [];
    if (prices.length === 0) {
      console.warn(`No historical prices returned for ${symbol}`);
    }

    return prices;
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    // Return empty array instead of throwing to prevent UI breaking
    return [];
  }
}
