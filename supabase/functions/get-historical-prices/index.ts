
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
    const { symbol, period, interval } = await req.json();
    console.log('Fetching historical prices for:', symbol, 'period:', period, 'interval:', interval);

    // Fetch historical data from Yahoo Finance
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval || '1mo'}&range=${period || '5y'}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0',
        },
      }
    );

    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      throw new Error(`API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart.error) {
      console.warn('Yahoo Finance returned error:', data.chart.error);
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      throw new Error("No data found");
    }

    // Format the historical prices data
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0];
    
    const historicalPrices = timestamps.map((timestamp: number, index: number) => {
      return {
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: prices.open?.[index] || 0,
        high: prices.high?.[index] || 0,
        low: prices.low?.[index] || 0,
        close: prices.close?.[index] || 0,
        volume: prices.volume?.[index] || 0
      };
    }).filter((price: any) => price.close !== null && price.close !== undefined);

    return new Response(
      JSON.stringify({ prices: historicalPrices }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-historical-prices function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        prices: []
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to ensure the response reaches the client
      }
    );
  }
});
