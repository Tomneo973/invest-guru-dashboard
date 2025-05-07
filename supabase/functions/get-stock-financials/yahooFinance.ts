
import { corsHeaders } from "./utils.ts";

export async function fetchFromYahooFinanceEnhanced(symbol: string) {
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

    // First get the quote data
    const quoteResponse = await fetch(
      `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1d&range=1d`,
      { headers }
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

    // Récupérer les données financières détaillées
    const summaryResponse = await fetch(
      `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,assetProfile,price,financialData,incomeStatementHistory,cashflowStatementHistory`,
      { headers }
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

    // Extract financial data for scoring criteria
    const grossMargin = financialData.grossMargins?.raw || 0;
    const revenueGrowth = financialData.revenueGrowth?.raw || 0;
    const interestCoverage = financialData.interestCoverage?.raw || 0;
    const debtToEquity = financialData.debtToEquity?.raw || 0;
    const operatingCashflow = cashflowStatement.totalCashFromOperatingActivities?.raw || 0;
    const totalRevenue = incomeStatement.totalRevenue?.raw || 1; // To avoid division by zero
    const operatingCashflowToSales = totalRevenue > 0 ? operatingCashflow / totalRevenue : 0;

    return {
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
      // New financial data
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
