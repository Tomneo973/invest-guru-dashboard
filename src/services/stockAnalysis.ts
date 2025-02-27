
import { supabase } from "@/integrations/supabase/client";

export interface StockFinancialData {
  symbol: string;
  name: string;
  currentPrice: number;
  currency: string;
  eps: number;
  peRatio: number;
  forwardPE: number;
  dividendYield: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fairPrice?: number;
  sector?: string;
  industry?: string;
  bookValue?: number;
  priceToBook?: number;
  targetPrice?: number;
  recommendation?: string;
  error?: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getStockFinancials(symbol: string): Promise<StockFinancialData> {
  try {
    // On utilise la fonction Cloud Supabase existante qui interroge Yahoo Finance
    const { data, error } = await supabase.functions.invoke('get-stock-financials', {
      body: { symbol }
    });

    if (error) {
      console.error(`Error fetching stock financials for ${symbol}:`, error);
      return {
        symbol,
        name: "",
        currentPrice: 0,
        currency: 'USD',
        eps: 0,
        peRatio: 0,
        forwardPE: 0,
        dividendYield: 0,
        marketCap: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        error: error.message
      };
    }
    
    // Calcul du prix juste basé sur le PE et l'EPS (formule simplifiée)
    const fairPrice = data.eps * data.peRatio || 0;

    return {
      symbol,
      name: data.name || symbol,
      currentPrice: data.currentPrice || 0,
      currency: data.currency || 'USD',
      eps: data.eps || 0,
      peRatio: data.peRatio || 0,
      forwardPE: data.forwardPE || 0,
      dividendYield: data.dividendYield || 0,
      marketCap: data.marketCap || 0,
      fiftyTwoWeekHigh: data.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: data.fiftyTwoWeekLow || 0,
      fairPrice,
      sector: data.sector,
      industry: data.industry,
      bookValue: data.bookValue,
      priceToBook: data.priceToBook,
      targetPrice: data.targetPrice,
      recommendation: data.recommendation
    };
  } catch (error) {
    console.error(`Error fetching stock financials for ${symbol}:`, error);
    return {
      symbol,
      name: "",
      currentPrice: 0,
      currency: 'USD',
      eps: 0,
      peRatio: 0,
      forwardPE: 0,
      dividendYield: 0,
      marketCap: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}

export async function getHistoricalPrices(symbol: string): Promise<HistoricalPrice[]> {
  try {
    // On utilise la fonction Cloud Supabase pour obtenir l'historique des prix
    const { data, error } = await supabase.functions.invoke('get-historical-prices', {
      body: { symbol, period: '5y', interval: '1mo' }
    });

    if (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }

    return data.prices || [];
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    return [];
  }
}
