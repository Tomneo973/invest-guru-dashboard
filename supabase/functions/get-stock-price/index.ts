
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';
const ALPHAVANTAGE_URL = "https://www.alphavantage.co/query";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    console.log('Fetching stock price for:', symbol);

    // Try Alpha Vantage first
    let data = await fetchFromAlphaVantage(symbol);
    
    // If Alpha Vantage fails, try Yahoo Finance as fallback
    if (!data || !data.currentPrice) {
      console.log('Alpha Vantage data incomplete, trying Yahoo Finance as fallback');
      data = await fetchFromYahooFinance(symbol);
    }

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

async function fetchFromAlphaVantage(symbol: string) {
  try {
    console.log('Fetching from Alpha Vantage for symbol:', symbol);
    const response = await fetch(
      `${ALPHAVANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got valid data
    if (!data['Global Quote'] || !data['Global Quote']['01. symbol']) {
      console.warn('No quote data found for symbol:', symbol);
      return null;
    }

    const quote = data['Global Quote'];
    return { 
      currentPrice: parseFloat(quote['05. price']),
      currency: quote['8. currency'] || 'USD'
    };
  } catch (error) {
    console.error('Error fetching from Alpha Vantage:', error);
    return null;
  }
}

async function fetchFromYahooFinance(symbol: string) {
  try {
    console.log('Fetching from Yahoo Finance as fallback for symbol:', symbol);
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Origin': 'https://finance.yahoo.com',
          'Referer': 'https://finance.yahoo.com',
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result || !result.meta?.regularMarketPrice) {
      throw new Error("No data found");
    }

    return { 
      currentPrice: result.meta.regularMarketPrice,
      currency: result.meta.currency || 'USD'
    };
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}
