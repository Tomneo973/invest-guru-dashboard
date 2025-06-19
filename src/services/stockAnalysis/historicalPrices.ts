
import { supabase } from "@/integrations/supabase/client";
import { HistoricalPrice, DbPriceData } from "./types";

export async function getHistoricalPrices(symbol: string): Promise<HistoricalPrice[]> {
  try {
    console.log('Fetching historical prices for:', symbol);
    
    // Essayer d'abord de récupérer depuis la base de données
    const { data: dbData, error: dbError } = await supabase
      .from("stock_prices")
      .select("date, closing_price, currency")
      .eq("symbol", symbol)
      .order("date", { ascending: true });
      
    if (!dbError && dbData && dbData.length > 0) {
      console.log(`Found ${dbData.length} historical prices in database for ${symbol}`);
      
      // Valider et transformer les données de la base
      const validData = dbData
        .filter((item): item is { date: string; closing_price: number; currency: string } => (
          item !== null && 
          typeof item === 'object' && 
          'date' in item && 
          'closing_price' in item && 
          typeof item.date === 'string' && 
          typeof item.closing_price === 'number'
        ))
        .map(item => ({
          date: item.date,
          open: item.closing_price,
          high: item.closing_price,
          low: item.closing_price,
          close: item.closing_price,
          volume: 0,
          price: item.closing_price,
          currency: item.currency || 'USD'
        }));
        
      if (validData.length > 0) {
        return validData;
      }
    }
    
    // Si pas de données en base, utiliser l'API Yahoo Finance
    console.log(`No database data for ${symbol}, calling Yahoo Finance API...`);
    const { data, error } = await supabase.functions.invoke('get-historical-prices', {
      body: { symbol, period: '5y', interval: '1d' }
    });

    if (error) {
      console.error(`Error invoking get-historical-prices for ${symbol}:`, error);
      throw error;
    }

    if (data.error) {
      console.error(`API error for ${symbol}:`, data.error);
      throw new Error(data.error);
    }

    const prices = data.prices || [];
    console.log(`Retrieved ${prices.length} prices from Yahoo Finance for ${symbol}`);
    
    if (prices.length === 0) {
      console.warn(`No historical prices returned for ${symbol}`);
      return [];
    }

    // Valider les données reçues de l'API
    const validPrices = prices.filter(price => 
      price && 
      typeof price.date === 'string' && 
      typeof price.close === 'number' && 
      !isNaN(price.close)
    );

    console.log(`${validPrices.length} valid prices after filtering for ${symbol}`);
    return validPrices;

  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    
    // En cas d'erreur, essayer une dernière fois avec les données de base
    try {
      const { data: fallbackData } = await supabase
        .from("stock_prices")
        .select("date, closing_price, currency")
        .eq("symbol", symbol)
        .order("date", { ascending: false })
        .limit(30); // Récupérer au moins les 30 derniers jours
        
      if (fallbackData && fallbackData.length > 0) {
        console.log(`Using fallback database data: ${fallbackData.length} prices for ${symbol}`);
        return fallbackData.map(item => ({
          date: item.date,
          open: item.closing_price,
          high: item.closing_price,
          low: item.closing_price,
          close: item.closing_price,
          volume: 0,
          price: item.closing_price,
          currency: item.currency || 'USD'
        }));
      }
    } catch (fallbackError) {
      console.error(`Fallback also failed for ${symbol}:`, fallbackError);
    }
    
    // Retourner un tableau vide au lieu de lever une erreur pour éviter de casser l'interface
    return [];
  }
}
