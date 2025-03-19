
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { corsHeaders } from "./utils.ts";
import { fetchCompanyOverview, fetchQuote, formatAlphaVantageData } from "./alphaVantage.ts";
import { fetchFromYahooFinanceEnhanced } from "./yahooFinance.ts";

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { symbol } = await req.json();
    console.log('Fetching stock financials for:', symbol);

    // Try fetching from Alpha Vantage first
    const companyOverview = await fetchCompanyOverview(symbol);
    const quoteData = await fetchQuote(symbol);
    
    if (!companyOverview || !quoteData) {
      console.log('Alpha Vantage data incomplete, trying Yahoo Finance as fallback');
      const yahooData = await fetchFromYahooFinanceEnhanced(symbol);
      
      return new Response(
        JSON.stringify(yahooData),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200
        }
      );
    }
    
    // Format financial data from Alpha Vantage
    const financialDataObj = formatAlphaVantageData(companyOverview, quoteData, symbol);

    return new Response(
      JSON.stringify(financialDataObj),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error in get-stock-financials function:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 even for errors to ensure the response reaches the client
      }
    );
  }
});
