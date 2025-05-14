
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  currentPrice: number | null;
  currency: string;
  error?: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    console.log(`Fetching stock price for ${symbol}`);
    
    // Utilise la fonction Supabase pour obtenir le prix de l'action
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

    if (data.error) {
      console.warn(`Warning fetching stock price for ${symbol}:`, data.error);
      
      // Essayer d'utiliser les prix historiques de notre base de données comme fallback
      console.log("Trying to use historical prices as fallback...");
      const { data: historicalData, error: historicalError } = await supabase
        .from("stock_prices")
        .select("closing_price, currency")
        .eq("symbol", symbol)
        .order("date", { ascending: false })
        .limit(1);
        
      if (historicalError || !historicalData || historicalData.length === 0) {
        return {
          currentPrice: null,
          currency: 'USD',
          error: data.error
        };
      }
      
      console.log(`Found historical price for ${symbol}:`, historicalData[0]);
      return {
        currentPrice: historicalData[0].closing_price,
        currency: historicalData[0].currency || 'USD',
        error: `Used historical price as fallback. Original error: ${data.error}`
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
