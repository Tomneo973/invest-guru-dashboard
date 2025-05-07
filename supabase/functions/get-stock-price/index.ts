
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
    const { symbol } = await req.json();
    console.log('Fetching stock price for:', symbol);

    // Utilisons directement Yahoo Finance avec la nouvelle approche
    const data = await fetchFromYahooFinance(symbol);

    return new Response(
      JSON.stringify(data),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-stock-price function:', error);
    return new Response(
      JSON.stringify({ 
        currentPrice: null,
        currency: 'USD',
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even for errors to ensure the response reaches the client
      }
    );
  }
});

async function fetchFromYahooFinance(symbol: string) {
  try {
    console.log('Fetching from Yahoo Finance for symbol:', symbol);
    
    // URL complète avec tous les paramètres nécessaires
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=0&period2=9999999999&interval=1d&includePrePost=true&events=div%7Csplit`;
    
    // Ensemble complet d'en-têtes pour imiter un navigateur
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
    if (!result || !result.meta) {
      throw new Error("No data found");
    }

    const meta = result.meta;
    
    return { 
      currentPrice: meta.regularMarketPrice || null,
      currency: meta.currency || 'USD'
    };
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}
