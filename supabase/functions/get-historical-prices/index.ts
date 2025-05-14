
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
    
    // Obtenir le crumb pour l'authentification
    const crumb = await getCrumb();
    console.log(`Got crumb: ${crumb ? 'yes' : 'no'}`);
    
    // Construire l'URL avec le crumb si disponible
    let url = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`;
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

    // Faire la requête à l'API Yahoo Finance
    console.log(`Fetching from URL: ${url}`);
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      console.error(`Yahoo Finance API error: ${response.status}`);
      return new Response(
        JSON.stringify({ error: `Yahoo Finance API error: ${response.status}` }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: response.status }
      );
    }

    const data = await response.json();
    
    if (data.chart.error) {
      console.error(`Yahoo Finance API error: ${data.chart.error.description}`);
      return new Response(
        JSON.stringify({ error: data.chart.error.description }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const result = data.chart.result?.[0];
    if (!result) {
      return new Response(
        JSON.stringify({ error: 'No data found' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 404 }
      );
    }

    // Extraire les prix historiques
    const { timestamp, indicators } = result;
    const prices = indicators.quote[0].close;
    const currency = result.meta.currency || 'USD';
    
    // Construire les données de prix pour la réponse
    const historicalPrices = [];
    for (let i = 0; i < timestamp.length; i++) {
      if (prices[i] !== null) {
        const date = new Date(timestamp[i] * 1000).toISOString().split('T')[0];
        historicalPrices.push({
          date,
          price: prices[i],
          currency
        });
      }
    }

    console.log(`Retrieved ${historicalPrices.length} historical prices for ${symbol}`);
    
    return new Response(
      JSON.stringify({ prices: historicalPrices }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
