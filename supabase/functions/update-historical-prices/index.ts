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
    console.log('Starting historical prices update...');
    
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Récupérer tous les symboles uniques des transactions
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('symbol')
      .order('date', { ascending: true });

    if (transactionsError) throw transactionsError;

    const symbols = [...new Set(transactions.map(t => t.symbol))];
    console.log('Symbols to update:', symbols);

    // Pour chaque symbole, récupérer les données historiques
    for (const symbol of symbols) {
      console.log(`Fetching data for ${symbol}...`);
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

      // Préparer les prix pour l'insertion
      const pricesToInsert = timestamp.map((ts: number, index: number) => ({
        symbol,
        date: new Date(ts * 1000).toISOString().split('T')[0],
        closing_price: prices[index],
        currency,
      })).filter((p: any) => p.closing_price !== null);

      // Insérer les prix par lots
      if (pricesToInsert.length > 0) {
        const { error } = await supabase
          .from('stock_prices')
          .upsert(pricesToInsert);

        if (error) {
          console.error(`Error inserting prices for ${symbol}:`, error);
        } else {
          console.log(`Successfully updated ${pricesToInsert.length} prices for ${symbol}`);
        }
      }
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Historical prices updated successfully' }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in update-historical-prices function:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});