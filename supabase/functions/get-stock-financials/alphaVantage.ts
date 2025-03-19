
import { corsHeaders } from "./utils.ts";

const ALPHA_VANTAGE_API_KEY = Deno.env.get('ALPHA_VANTAGE_API_KEY') || 'demo';
const ALPHAVANTAGE_URL = "https://www.alphavantage.co/query";

export async function fetchCompanyOverview(symbol: string) {
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

export async function fetchQuote(symbol: string) {
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

export function formatAlphaVantageData(companyOverview: any, quoteData: any, symbol: string) {
  return {
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
}
