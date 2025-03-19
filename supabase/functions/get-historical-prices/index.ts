
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
    const { symbol, period = '5y', interval = '1mo' } = await req.json();
    console.log('Fetching historical prices for:', symbol, 'period:', period, 'interval:', interval);

    // First try with Alpha Vantage
    let data = await fetchFromAlphaVantage(symbol);
    let historicalPrices = formatAlphaVantageData(data);
    
    // If Alpha Vantage fails, try with Yahoo Finance as fallback with enhanced headers
    if (historicalPrices.length === 0) {
      console.log('Alpha Vantage returned no data, trying Yahoo Finance as fallback');
      historicalPrices = await fetchFromYahooFinanceEnhanced(symbol, period, interval);
    }

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

async function fetchFromAlphaVantage(symbol: string) {
  try {
    console.log('Fetching from Alpha Vantage for symbol:', symbol);
    const response = await fetch(
      `${ALPHAVANTAGE_URL}?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching from Alpha Vantage:', error);
    return null;
  }
}

function formatAlphaVantageData(data: any) {
  if (!data || !data['Monthly Time Series']) {
    return [];
  }

  const timeSeries = data['Monthly Time Series'];
  const formattedData = Object.entries(timeSeries).map(([date, values]: [string, any]) => {
    return {
      date,
      open: parseFloat(values['1. open']),
      high: parseFloat(values['2. high']),
      low: parseFloat(values['3. low']),
      close: parseFloat(values['4. close']),
      volume: parseFloat(values['5. volume'])
    };
  });

  // Sort by date descending (newest first)
  return formattedData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

async function fetchFromYahooFinanceEnhanced(symbol: string, period: string, interval: string) {
  try {
    console.log('Fetching from Yahoo Finance as fallback for symbol:', symbol);
    
    // Creating a more comprehensive set of headers to mimic a browser
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/96.0.4664.110 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Cache-Control': 'max-age=0',
      'Origin': 'https://finance.yahoo.com',
      'Referer': `https://finance.yahoo.com/quote/${symbol}`,
      'Cookie': 'B=c8k1agtgvm1n3&b=3&s=k0; GUC=AQEBCAFle3xlbkIhLQTn; A1=d=AQABBHXMcWUCENzjOQXc2U_UyBxdQAfdvqwFEgEBCAFoe2VuZckib0IA_eMBAAcIdc5xZQ&S=AQAAAmidfKPQJ44hPnWgqHy4Owk; A3=d=AQABBHXMcWUCENzjOQXc2U_UyBxdQAfdvqwFEgEBCAFoe2VuZckib0IA_eMBAAcIdc5xZQ&S=AQAAAmidfKPQJ44hPnWgqHy4Owk'
    };
    
    const response = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=${interval}&range=${period}`,
      { headers }
    );

    if (!response.ok) {
      throw new Error(`Yahoo Finance API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.chart.error) {
      throw new Error(data.chart.error.description);
    }

    const result = data.chart.result?.[0];
    if (!result || !result.timestamp || !result.indicators?.quote?.[0]?.close) {
      throw new Error("No data found");
    }

    // Format the historical prices data
    const timestamps = result.timestamp;
    const prices = result.indicators.quote[0];
    
    return timestamps.map((timestamp: number, index: number) => {
      return {
        date: new Date(timestamp * 1000).toISOString().split('T')[0],
        open: prices.open?.[index] || 0,
        high: prices.high?.[index] || 0,
        low: prices.low?.[index] || 0,
        close: prices.close?.[index] || 0,
        volume: prices.volume?.[index] || 0
      };
    }).filter((price: any) => price.close !== null && price.close !== undefined);
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    return [];
  }
}
