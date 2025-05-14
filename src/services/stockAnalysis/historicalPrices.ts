

import { supabase } from "@/integrations/supabase/client";
import { HistoricalPrice } from "./types";

export async function getHistoricalPrices(symbol: string): Promise<HistoricalPrice[]> {
  try {
    console.log('Fetching historical prices for:', symbol);
    
    // First, try to get data from our database
    const { data: dbData, error: dbError } = await supabase
      .from("stock_prices")
      .select("date, closing_price as price, currency")
      .eq("symbol", symbol)
      .order("date", { ascending: true });
      
    if (!dbError && dbData && dbData.length > 0) {
      console.log(`Found ${dbData.length} historical prices in database for ${symbol}`);
      
      // Type safety: ensure we're working with valid data objects
      const validData = dbData.filter(item => 
        typeof item === 'object' && item !== null && 'date' in item && 'price' in item
      );
      
      // Properly transform the database data to match the HistoricalPrice interface
      return validData.map(item => ({
        date: item.date,
        open: item.price,   // We only have closing price, so use it for open too
        high: item.price,   // We only have closing price, so use it for high too
        low: item.price,    // We only have closing price, so use it for low too
        close: item.price,
        volume: 0           // Default volume since we don't have this data
      }));
    }
    
    // If database fetch fails or returns no data, use the Supabase Cloud function
    console.log(`No historical prices found in database for ${symbol}, trying API...`);
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

