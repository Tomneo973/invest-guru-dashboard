
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, period = '5y', interval = '1mo' } = await req.json();
    
    console.log(`Fetching historical prices for: ${symbol} period: ${period} interval: ${interval}`);
    
    // Utiliser directement Yahoo Finance
    const data = await fetchFromYahooFinance(symbol, period, interval);
    
    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-historical-prices function:', error);
    return new Response(
      JSON.stringify({ 
        prices: [],
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  }
});

async function fetchFromYahooFinance(symbol: string, period: string, interval: string) {
  try {
    console.log(`Fetching from Yahoo Finance for symbol: ${symbol}`);
    
    // Conversion de la période en timestamps
    const now = Math.floor(Date.now() / 1000);
    let periodInSeconds: number;
    
    switch(period) {
      case '1d': periodInSeconds = 24 * 60 * 60; break;
      case '5d': periodInSeconds = 5 * 24 * 60 * 60; break;
      case '1mo': periodInSeconds = 30 * 24 * 60 * 60; break;
      case '3mo': periodInSeconds = 90 * 24 * 60 * 60; break;
      case '6mo': periodInSeconds = 180 * 24 * 60 * 60; break;
      case '1y': periodInSeconds = 365 * 24 * 60 * 60; break;
      case '2y': periodInSeconds = 2 * 365 * 24 * 60 * 60; break;
      case '5y': periodInSeconds = 5 * 365 * 24 * 60 * 60; break;
      case '10y': periodInSeconds = 10 * 365 * 24 * 60 * 60; break;
      case 'ytd': {
        const startOfYear = new Date();
        startOfYear.setMonth(0, 1);
        startOfYear.setHours(0, 0, 0, 0);
        periodInSeconds = now - Math.floor(startOfYear.getTime() / 1000);
        break;
      }
      case 'max': 
        // Utiliser une valeur très grande pour "max"
        return fetchFromYahooFinanceWithFixedRange(symbol, interval, 0, now);
      default:
        periodInSeconds = 5 * 365 * 24 * 60 * 60; // 5 ans par défaut
    }
    
    const startDate = now - periodInSeconds;
    
    return fetchFromYahooFinanceWithFixedRange(symbol, interval, startDate, now);
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}

async function fetchFromYahooFinanceWithFixedRange(symbol: string, interval: string, period1: number, period2: number) {
  try {
    // URL avec période et intervalle spécifiés
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=${period1}&period2=${period2}&interval=${interval}&includePrePost=true&events=div%7Csplit`;
    
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://finance.yahoo.com',
      'Referer': `https://finance.yahoo.com/quote/${symbol}`
    };

    const response = await fetch(url, { headers });

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result) {
      throw new Error("No data found");
    }

    const timestamps = result.timestamp || [];
    const quotes = result.indicators.quote?.[0] || {};
    const adjCloses = result.indicators.adjclose?.[0]?.adjclose || [];
    
    const prices = timestamps.map((timestamp: number, index: number) => {
      const date = new Date(timestamp * 1000);
      return {
        date: date.toISOString().split('T')[0], // format YYYY-MM-DD
        open: quotes.open?.[index] || 0,
        high: quotes.high?.[index] || 0,
        low: quotes.low?.[index] || 0,
        close: adjCloses[index] || quotes.close?.[index] || 0,
        volume: quotes.volume?.[index] || 0
      };
    }).filter((price: any) => price.close > 0); // Filtrer les entrées sans prix
    
    return { prices };
  } catch (error) {
    console.error('Error fetching historical prices from Yahoo Finance:', error);
    throw error;
  }
}
