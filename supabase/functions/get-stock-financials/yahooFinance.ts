
import { corsHeaders } from "./utils.ts";

export async function fetchFromYahooFinanceEnhanced(symbol: string) {
  try {
    console.log('Fetching from Yahoo Finance for symbol:', symbol);
    
    // Use Yahoo Finance API v7 for more reliable access to options data
    const optionsUrl = `https://query2.finance.yahoo.com/v7/finance/options/${symbol}`;
    
    // Enhanced headers to better mimic a browser request
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
      'Accept-Language': 'en-US,en;q=0.9',
      'Cache-Control': 'no-cache',
      'Pragma': 'no-cache',
      'Sec-Ch-Ua': '"Not_A Brand";v="8", "Chromium";v="109"',
      'Sec-Ch-Ua-Mobile': '?0',
      'Sec-Ch-Ua-Platform': '"Windows"',
      'Sec-Fetch-Dest': 'document',
      'Sec-Fetch-Mode': 'navigate',
      'Sec-Fetch-Site': 'none',
      'Sec-Fetch-User': '?1',
      'Upgrade-Insecure-Requests': '1',
      'Referer': 'https://finance.yahoo.com/',
      'Origin': 'https://finance.yahoo.com'
    };

    // Get basic price data from the options endpoint
    const optionsResponse = await fetch(optionsUrl, { headers });

    if (!optionsResponse.ok) {
      throw new Error(`Yahoo Finance options API error: ${optionsResponse.status}`);
    }

    const optionsData = await optionsResponse.json();
    
    if (!optionsData.optionChain || !optionsData.optionChain.result || optionsData.optionChain.result.length === 0) {
      throw new Error("No options data found");
    }

    const result = optionsData.optionChain.result[0];
    const quote = result.quote;
    
    if (!quote) {
      throw new Error("No quote data found");
    }

    // Get detailed stats from the quoteSummary endpoint
    const summaryUrl = `https://query2.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,assetProfile,price,financialData,incomeStatementHistory,cashflowStatementHistory`;
    
    // Fetch detailed financial data
    const summaryResponse = await fetch(summaryUrl, { headers });

    if (!summaryResponse.ok) {
      throw new Error(`Yahoo Finance summary API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    
    if (!summaryData.quoteSummary || !summaryData.quoteSummary.result || summaryData.quoteSummary.result.length === 0) {
      throw new Error("No summary data found");
    }

    const summary = summaryData.quoteSummary.result[0];

    // Extract data from different sections
    const summaryDetail = summary.summaryDetail || {};
    const keyStats = summary.defaultKeyStatistics || {};
    const profile = summary.assetProfile || {};
    const price = summary.price || {};
    const financialData = summary.financialData || {};
    const incomeStatement = summary.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const cashflowStatement = summary.cashflowStatementHistory?.cashflowStatements?.[0] || {};

    // Extract financial metrics for rating criteria
    const grossMargin = financialData.grossMargins?.raw || 0;
    const revenueGrowth = financialData.revenueGrowth?.raw || 0;
    const interestCoverage = financialData.interestCoverage?.raw || 0;
    const debtToEquity = financialData.debtToEquity?.raw || 0;
    const operatingCashflow = cashflowStatement.totalCashFromOperatingActivities?.raw || 0;
    const totalRevenue = incomeStatement.totalRevenue?.raw || 1; // Avoid division by zero
    const operatingCashflowToSales = totalRevenue > 0 ? operatingCashflow / totalRevenue : 0;

    return {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      currentPrice: quote.regularMarketPrice || 0,
      currency: quote.currency || 'USD',
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
      // Financial data
      grossMargin: grossMargin,
      revenueGrowth: revenueGrowth,
      interestCoverage: interestCoverage,
      debtToEquity: debtToEquity,
      operatingCashflowToSales: operatingCashflowToSales
    };
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}
