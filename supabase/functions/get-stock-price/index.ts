
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Fonction pour obtenir le "crumb" nécessaire à l'authentification Yahoo Finance
async function getCrumb() {
  try {
    const response = await fetch("https://finance.yahoo.com", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36"
      }
    });
    
    if (!response.ok) {
      console.error("Error fetching Yahoo Finance homepage:", response.status);
      return null;
    }
    
    const text = await response.text();
    const patternStr = 'window\\.YAHOO\\.context = ({.*?});';
    const pattern = new RegExp(patternStr, 's');
    const match = text.match(pattern);
    
    if (match && match[1]) {
      try {
        const jsDict = JSON.parse(match[1]);
        return jsDict.crumb;
      } catch (e) {
        console.error("Error parsing YAHOO context:", e);
        return null;
      }
    }
    return null;
  } catch (error) {
    console.error("Error in getCrumb:", error);
    return null;
  }
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Parse the request body
    const { symbol } = await req.json();

    if (!symbol) {
      return new Response(
        JSON.stringify({ error: "Symbol parameter is required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Fetching stock price for: ${symbol}`);

    // Obtenir le crumb pour l'authentification Yahoo Finance
    const crumb = await getCrumb();
    console.log(`Got crumb: ${crumb ? 'yes' : 'no'}`);
    
    // Construire l'URL avec le crumb si disponible
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`;
    if (crumb) {
      url += `&crumb=${crumb}`;
    }
    
    // Construire les en-têtes avec l'agent utilisateur et les cookies
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Cookie': `B=c8k1agtgvm1n3&b=3&s=k0; crumb=${crumb || ""}`,
      'Origin': 'https://finance.yahoo.com',
      'Referer': `https://finance.yahoo.com/quote/${symbol}`,
    };

    // First try Yahoo Finance API
    console.log(`Fetching from Yahoo Finance API for ${symbol}`);
    const yahooResponse = await fetch(url, { headers });

    if (yahooResponse.ok) {
      const yahooData = await yahooResponse.json();
      
      // Check if the response is valid
      if (!yahooData.chart.error && yahooData.chart.result && yahooData.chart.result.length > 0) {
        const result = yahooData.chart.result[0];
        const meta = result.meta;
        
        if (meta && meta.regularMarketPrice) {
          return new Response(
            JSON.stringify({
              currentPrice: meta.regularMarketPrice,
              currency: meta.currency || "USD"
            }),
            { headers: { ...corsHeaders, "Content-Type": "application/json" } }
          );
        }
      }
      
      console.error(`Invalid response format from Yahoo Finance for ${symbol}:`, yahooData.chart.error || 'No valid data');
    } else {
      console.error(`Yahoo Finance API error: ${yahooResponse.status}`);
    }

    // Si Yahoo Finance échoue, essayons de récupérer les prix historiques de notre base de données
    console.log(`Trying to get latest price from database for ${symbol}`);
    
    // Create Supabase client
    const supabaseUrl = Deno.env.get("SUPABASE_URL") as string;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") as string;
    
    // Import dynamically because we can't use top-level await in Edge Functions
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2.39.7");
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    const { data: stockData, error: stockError } = await supabase
      .from("stock_prices")
      .select("closing_price, currency, date")
      .eq("symbol", symbol)
      .order("date", { ascending: false })
      .limit(1);
      
    if (stockError) {
      console.error(`Error fetching price from database for ${symbol}:`, stockError);
      return new Response(
        JSON.stringify({ 
          error: `Failed to get price for ${symbol}: ${stockError.message}` 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
      );
    }
    
    if (stockData && stockData.length > 0) {
      console.log(`Using historical price from database for ${symbol}: ${stockData[0].closing_price} ${stockData[0].currency} (${stockData[0].date})`);
      return new Response(
        JSON.stringify({
          currentPrice: stockData[0].closing_price,
          currency: stockData[0].currency || "USD",
          source: "database",
          date: stockData[0].date
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    console.error(`No price data available for ${symbol}`);
    return new Response(
      JSON.stringify({ 
        error: `No price data available for ${symbol}` 
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 404 }
    );

  } catch (error) {
    console.error(`Error fetching stock price:`, error);
    return new Response(
      JSON.stringify({ error: error.message || "An unknown error occurred" }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
