
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";

// Fonction pour obtenir les cookies et crumb nécessaires
async function getYahooAuth() {
  try {
    // Première requête pour obtenir les cookies de session
    const homeResponse = await fetch("https://finance.yahoo.com/", {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.5",
        "Accept-Encoding": "gzip, deflate, br",
        "Connection": "keep-alive",
        "Upgrade-Insecure-Requests": "1",
      }
    });

    const cookies = homeResponse.headers.get("set-cookie") || "";
    const homeText = await homeResponse.text();
    
    // Extraire le crumb du contenu de la page
    let crumb = null;
    const crumbMatch = homeText.match(/"CrumbStore":\s*{"crumb":"([^"]+)"/);
    if (crumbMatch) {
      crumb = crumbMatch[1];
    } else {
      // Méthode alternative pour extraire le crumb
      const contextMatch = homeText.match(/window\.YAHOO\.context\s*=\s*({[^;]+});/);
      if (contextMatch) {
        try {
          const context = JSON.parse(contextMatch[1]);
          crumb = context.crumb;
        } catch (e) {
          console.log("Could not parse context for crumb");
        }
      }
    }

    return { cookies, crumb };
  } catch (error) {
    console.error("Error getting Yahoo auth:", error);
    return { cookies: "", crumb: null };
  }
}

// Fonction pour récupérer les données avec la nouvelle API
async function fetchHistoricalData(symbol: string, period: string, interval: string) {
  const { cookies, crumb } = await getYahooAuth();
  
  // Construire l'URL avec les paramètres appropriés
  const baseUrl = "https://query1.finance.yahoo.com/v8/finance/chart";
  let url = `${baseUrl}/${symbol}?interval=${interval}&range=${period}`;
  
  if (crumb) {
    url += `&crumb=${encodeURIComponent(crumb)}`;
  }

  const headers = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "en-US,en;q=0.9",
    "Accept-Encoding": "gzip, deflate, br",
    "Referer": `https://finance.yahoo.com/quote/${symbol}/`,
    "Origin": "https://finance.yahoo.com",
    "Connection": "keep-alive",
    "Sec-Fetch-Dest": "empty",
    "Sec-Fetch-Mode": "cors",
    "Sec-Fetch-Site": "same-site",
  };

  if (cookies) {
    headers["Cookie"] = cookies;
  }

  console.log(`Fetching from: ${url}`);
  
  const response = await fetch(url, { headers });
  
  if (!response.ok) {
    throw new Error(`Yahoo Finance API error: ${response.status} ${response.statusText}`);
  }

  return await response.json();
}

serve(async (req) => {
  // CORS handling
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol, period = '5y', interval = '1d' } = await req.json();
    
    if (!symbol) {
      return new Response(
        JSON.stringify({ error: 'Symbol parameter is required' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    console.log(`Fetching historical prices for ${symbol} with period ${period} and interval ${interval}`);
    
    // Tentative de récupération des données
    let data;
    try {
      data = await fetchHistoricalData(symbol, period, interval);
    } catch (error) {
      console.error(`Error with primary method for ${symbol}:`, error);
      
      // Méthode de fallback plus simple
      console.log(`Trying fallback method for ${symbol}...`);
      const fallbackUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`;
      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
          "Accept": "application/json",
        }
      });
      
      if (!fallbackResponse.ok) {
        throw new Error(`Fallback method failed: ${fallbackResponse.status}`);
      }
      
      data = await fallbackResponse.json();
    }
    
    if (data.chart?.error) {
      console.error(`Yahoo Finance API error: ${data.chart.error.description}`);
      return new Response(
        JSON.stringify({ error: data.chart.error.description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const result = data.chart?.result?.[0];
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No data found for symbol' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Extraire les données
    const { timestamp, indicators, meta } = result;
    const quote = indicators.quote[0];
    const currency = meta?.currency || 'USD';
    
    // Construire les données de prix historiques
    const historicalPrices = [];
    
    for (let i = 0; i < timestamp.length; i++) {
      const date = new Date(timestamp[i] * 1000).toISOString().split('T')[0];
      const open = quote.open?.[i];
      const high = quote.high?.[i];
      const low = quote.low?.[i];
      const close = quote.close?.[i];
      const volume = quote.volume?.[i] || 0;
      
      // Ne garder que les points de données valides
      if (close !== null && close !== undefined) {
        historicalPrices.push({
          date,
          open: open || close,
          high: high || close,
          low: low || close,
          close,
          volume,
          price: close, // Pour la compatibilité
          currency
        });
      }
    }

    console.log(`Successfully retrieved ${historicalPrices.length} historical prices for ${symbol}`);
    
    if (historicalPrices.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No valid price data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    return new Response(
      JSON.stringify({ prices: historicalPrices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in get-historical-prices:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error occurred' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
