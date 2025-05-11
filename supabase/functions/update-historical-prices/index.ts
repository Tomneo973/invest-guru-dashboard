
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

    if (transactionsError) {
      console.error('Error fetching transactions:', transactionsError);
      throw transactionsError;
    }

    const symbols = [...new Set(transactions.map(t => t.symbol))];
    console.log('Symbols to update:', symbols);

    if (symbols.length === 0) {
      return new Response(
        JSON.stringify({ success: true, message: 'No symbols to update', updated: 0 }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        }
      );
    }

    const updatedSymbols = [];
    const failedSymbols = [];
    let totalUpdatedPrices = 0;

    // Pour chaque symbole, récupérer les données historiques
    for (const symbol of symbols) {
      try {
        console.log(`Fetching data for ${symbol}...`);
        const response = await fetch(
          `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=5y`,
          {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
              'Accept-Language': 'en-US,en;q=0.9',
              'Accept-Encoding': 'gzip, deflate, br',
            },
          }
        );

        if (!response.ok) {
          console.error(`Error fetching data for ${symbol}:`, response.status);
          failedSymbols.push({symbol, error: `HTTP status ${response.status}`});
          continue;
        }

        const data = await response.json();
        if (!data.chart?.result?.[0]) {
          console.error(`No data found for ${symbol}`);
          failedSymbols.push({symbol, error: 'No data returned'});
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
            .upsert(pricesToInsert, { 
              onConflict: 'symbol,date',
              ignoreDuplicates: false
            });

          if (error) {
            console.error(`Error inserting prices for ${symbol}:`, error);
            failedSymbols.push({symbol, error: error.message});
          } else {
            console.log(`Successfully updated ${pricesToInsert.length} prices for ${symbol}`);
            updatedSymbols.push(symbol);
            totalUpdatedPrices += pricesToInsert.length;
          }
        } else {
          console.warn(`No valid prices found for ${symbol}`);
          failedSymbols.push({symbol, error: 'No valid prices found'});
        }
      } catch (error) {
        console.error(`Error processing ${symbol}:`, error);
        failedSymbols.push({symbol, error: error.message || 'Unknown error'});
      }
    }

    // Mettre à jour les fonctions de base de données pour calculer les valeurs du portfolio
    try {
      const updateFunctions = [
        supabase.rpc('update_daily_portfolio_values'),
        supabase.rpc('update_daily_invested'),
        supabase.rpc('update_daily_dividends')
      ];
      
      const results = await Promise.allSettled(updateFunctions);
      
      const errors = results
        .filter(result => result.status === 'rejected')
        .map((result: any) => result.reason);
      
      if (errors.length > 0) {
        console.error('Some database functions failed:', errors);
      } else {
        console.log('All database functions executed successfully');
      }
    } catch (error) {
      console.error('Error executing database functions:', error);
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Historical prices updated successfully', 
        updated: totalUpdatedPrices,
        updatedSymbols,
        failedSymbols
      }),
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
