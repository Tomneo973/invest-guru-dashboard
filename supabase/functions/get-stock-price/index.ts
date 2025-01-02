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

    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return new Response(
        JSON.stringify({ 
          currentPrice: null,
          currency: 'USD',
          error: `API error: ${response.status}` 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const data = await response.json();
    console.log('Yahoo Finance response:', data);
    
    if (data.chart.error) {
      console.warn('Yahoo Finance returned error:', data.chart.error);
      return new Response(
        JSON.stringify({ 
          currentPrice: null,
          currency: 'USD',
          error: data.chart.error.description 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    const result = data.chart.result?.[0];
    if (!result || !result.meta?.regularMarketPrice) {
      console.warn('No market price data found for symbol:', symbol);
      return new Response(
        JSON.stringify({ 
          currentPrice: null,
          currency: 'USD',
          error: "No data found, symbol may be delisted" 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }

    return new Response(
      JSON.stringify({ 
        currentPrice: result.meta.regularMarketPrice,
        currency: result.meta.currency || 'USD'
      }),
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
        status: 200
      }
    );
  }
});