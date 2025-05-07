
import { supabase } from "@/integrations/supabase/client";

export interface StockData {
  currentPrice: number | null;
  currency: string;
  error?: string;
}

export async function getStockPrice(symbol: string): Promise<StockData> {
  try {
    // Utiliser directement la fonction qui appelle Yahoo Finance
    return await getStockPriceFromYahooFinance(symbol);
  } catch (error) {
    console.error(`Error fetching stock price for ${symbol}:`, error);
    return {
      currentPrice: null,
      currency: 'USD',
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

async function getStockPriceFromYahooFinance(symbol: string): Promise<StockData> {
  try {
    // URL complète avec tous les paramètres nécessaires
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=0&period2=9999999999&interval=1d&includePrePost=true&events=div%7Csplit`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://finance.yahoo.com',
      'Referer': `https://finance.yahoo.com/quote/${symbol}`
    };

    console.log(`Fetching stock data for ${symbol} from Yahoo Finance directly`);
    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result || !result.meta) {
      throw new Error("No data found");
    }

    const meta = result.meta;
    
    // Récupérer le dernier prix disponible
    return {
      currentPrice: meta.regularMarketPrice || null,
      currency: meta.currency || 'USD'
    };
  } catch (error) {
    console.error(`Error fetching from Yahoo Finance:`, error);
    throw error;
  }
}
