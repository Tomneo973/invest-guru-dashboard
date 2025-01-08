import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbols, startDate } = await req.json();
    console.log('Fetching historical prices for:', symbols, 'since:', startDate);

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Check existing prices in database
    const { data: existingPrices } = await supabase
      .from('stock_prices')
      .select('*')
      .in('symbol', symbols)
      .gte('date', startDate)
      .order('date', { ascending: true });

    // Get missing dates for each symbol
    const missingPrices = [];
    for (const symbol of symbols) {
      const symbolPrices = existingPrices?.filter(p => p.symbol === symbol) || [];
      if (symbolPrices.length === 0) {
        missingPrices.push({ symbol, startDate });
      }
    }

    // Fetch missing prices from Yahoo Finance
    for (const { symbol, startDate } of missingPrices) {
      console.log('Fetching prices for:', symbol);
      const response = await fetch(
        `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5y`,
        {
          headers: {
            'User-Agent': 'Mozilla/5.0',
          },
        }
      );

      if (!response.ok) {
        console.error(`Error fetching data for ${symbol}:`, response.status);
        continue;
      }

      const data = await response.json();
      if (!data.chart?.result?.[0]) {
        console.error(`No data found for ${symbol}`);
        continue;
      }

      const { timestamp, indicators } = data.chart.result[0];
      const prices = indicators.quote[0].close;
      const currency = data.chart.result[0].meta.currency || 'USD';

      // Prepare prices for insertion
      const pricesToInsert = timestamp.map((ts: number, index: number) => ({
        symbol,
        date: new Date(ts * 1000).toISOString().split('T')[0],
        closing_price: prices[index],
        currency,
      })).filter((p: any) => p.closing_price !== null);

      // Insert prices in batches
      if (pricesToInsert.length > 0) {
        const { error } = await supabase
          .from('stock_prices')
          .upsert(pricesToInsert);

        if (error) {
          console.error(`Error inserting prices for ${symbol}:`, error);
        }
      }
    }

    // Return all prices (existing + newly fetched)
    const { data: allPrices, error } = await supabase
      .from('stock_prices')
      .select('*')
      .in('symbol', symbols)
      .gte('date', startDate)
      .order('date', { ascending: true });

    if (error) throw error;

    return new Response(
      JSON.stringify(allPrices),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in get-historical-prices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});