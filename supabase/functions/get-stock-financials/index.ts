
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
    const { symbol } = await req.json();
    console.log('Fetching stock financials for:', symbol);

    // Try fetching from Alpha Vantage first
    const companyOverview = await fetchCompanyOverview(symbol);
    const quoteData = await fetchQuote(symbol);
    
    if (!companyOverview || !quoteData) {
      console.log('Alpha Vantage data incomplete, trying Yahoo Finance as fallback');
      return await fetchFromYahooFinance(symbol);
    }
    
    // Format financial data from Alpha Vantage
    const financialDataObj = {
      symbol: symbol,
      name: companyOverview.Name || symbol,
      currentPrice: parseFloat(quoteData['05. price']) || 0,
      currency: quoteData['8. currency'] || 'USD',
      eps: parseFloat(companyOverview.EPS) || 0,
      peRatio: parseFloat(companyOverview.PERatio) || 0,
      forwardPE: parseFloat(companyOverview.ForwardPE) || 0,
      dividendYield: parseFloat(companyOverview.DividendYield) || 0,
      marketCap: parseFloat(companyOverview.MarketCapitalization) || 0,
      fiftyTwoWeekHigh: parseFloat(companyOverview['52WeekHigh']) || 0,
      fiftyTwoWeekLow: parseFloat(companyOverview['52WeekLow']) || 0,
      bookValue: parseFloat(companyOverview.BookValue) || null,
      priceToBook: parseFloat(companyOverview.PriceToBookRatio) || null,
      sector: companyOverview.Sector || null,
      industry: companyOverview.Industry || null,
      targetMeanPrice: null, // Not available in Alpha Vantage
      recommendationMean: null, // Not available in Alpha Vantage
      recommendation: null, // Not available in Alpha Vantage
      // Additional financial metrics
      grossMargin: parseFloat(companyOverview.GrossProfitTTM) / parseFloat(companyOverview.RevenueTTM) || 0,
      revenueGrowth: parseFloat(companyOverview.QuarterlyRevenueGrowthYOY) || 0,
      interestCoverage: 1, // Not directly available in Alpha Vantage
      debtToEquity: parseFloat(companyOverview.DebtToEquity) || 0,
      operatingCashflowToSales: parseFloat(companyOverview.OperatingCashflow) / parseFloat(companyOverview.RevenueTTM) || 0
    };

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

async function fetchCompanyOverview(symbol: string) {
  try {
    console.log('Fetching company overview from Alpha Vantage for:', symbol);
    const response = await fetch(
      `${ALPHAVANTAGE_URL}?function=OVERVIEW&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got valid data
    if (!data.Symbol) {
      console.warn('No company overview data found for symbol:', symbol);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error fetching company overview from Alpha Vantage:', error);
    return null;
  }
}

async function fetchQuote(symbol: string) {
  try {
    console.log('Fetching quote from Alpha Vantage for:', symbol);
    const response = await fetch(
      `${ALPHAVANTAGE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${ALPHA_VANTAGE_API_KEY}`,
      {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Check if we got valid data
    if (!data['Global Quote'] || !data['Global Quote']['01. symbol']) {
      console.warn('No quote data found for symbol:', symbol);
      return null;
    }

    return data['Global Quote'];
  } catch (error) {
    console.error('Error fetching quote from Alpha Vantage:', error);
    return null;
  }
}

async function fetchFromYahooFinance(symbol: string) {
  try {
    console.log('Fetching from Yahoo Finance as fallback for symbol:', symbol);
    // Request headers for Yahoo Finance
    const requestHeaders = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://finance.yahoo.com',
      'Referer': 'https://finance.yahoo.com',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
    };

    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers: requestHeaders }
    );

    if (!quoteResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${quoteResponse.status}`);
    }

    const quoteData = await quoteResponse.json();
    
    if (quoteData.chart.error) {
      throw new Error(quoteData.chart.error.description);
    }

    const quote = quoteData.chart.result?.[0];
    if (!quote || !quote.meta?.regularMarketPrice) {
      throw new Error("No data found");
    }

    // Récupérer les données financières détaillées avec les mêmes en-têtes
    const summaryResponse = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,assetProfile,price,financialData,incomeStatementHistory,cashflowStatementHistory`,
      { headers: requestHeaders }
    );

    if (!summaryResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    
    const summary = summaryData.quoteSummary?.result?.[0];
    if (!summary) {
      throw new Error("No summary data found");
    }

    const summaryDetail = summary.summaryDetail || {};
    const keyStats = summary.defaultKeyStatistics || {};
    const profile = summary.assetProfile || {};
    const price = summary.price || {};
    const financialData = summary.financialData || {};
    const incomeStatement = summary.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const cashflowStatement = summary.cashflowStatementHistory?.cashflowStatements?.[0] || {};

    // Extraire les données financières pour les critères de notation
    const grossMargin = financialData.grossMargins?.raw || 0;
    const revenueGrowth = financialData.revenueGrowth?.raw || 0;
    const interestCoverage = financialData.interestCoverage?.raw || 0;
    const debtToEquity = financialData.debtToEquity?.raw || 0;
    const operatingCashflow = cashflowStatement.totalCashFromOperatingActivities?.raw || 0;
    const totalRevenue = incomeStatement.totalRevenue?.raw || 1; // Pour éviter division par zéro
    const operatingCashflowToSales = totalRevenue > 0 ? operatingCashflow / totalRevenue : 0;

    // Extraire les données financières
    return new Response(
      JSON.stringify({
        symbol: symbol,
        name: price.shortName || price.longName || symbol,
        currentPrice: quote.meta.regularMarketPrice,
        currency: quote.meta.currency || 'USD',
        eps: keyStats.trailingEps?.raw || 0,
        peRatio: summaryDetail.trailingPE?.raw || 0,
        forwardPE: summaryDetail.forwardPE?.raw || 0,
        dividendYield: summaryDetail.dividendYield?.raw || 0,
        marketCap: summaryDetail.marketCap?.raw || 0,
        fiftyTwoWeekHigh: summaryDetail.fiftyTwoWeekHigh?.raw || 0,
        fiftyTwoWeekLow: summaryDetail.fiftyTwoWeekLow?.raw || 0,
        bookValue: keyStats.bookValue?.raw || null,
        priceToBook: keyStats.priceToBook?.raw || null,
        sector: profile.sector || null,
        industry: profile.industry || null,
        targetMeanPrice: price.targetMeanPrice?.raw || null,
        recommendationMean: price.recommendationMean?.raw || null,
        recommendation: price.recommendationKey || null,
        // Nouvelles données financières
        grossMargin: grossMargin,
        revenueGrowth: revenueGrowth,
        interestCoverage: interestCoverage,
        debtToEquity: debtToEquity,
        operatingCashflowToSales: operatingCashflowToSales
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200
      }
    );
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}
