
import { corsHeaders } from "./utils.ts";

export async function fetchFromYahooFinanceEnhanced(symbol: string) {
  try {
    console.log('Fetching from Yahoo Finance for symbol:', symbol);
    
    // URL complète avec tous les paramètres nécessaires pour les données de chart
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${symbol}?symbol=${symbol}&period1=0&period2=9999999999&interval=1d&includePrePost=true&events=div%7Csplit`;
    
    // En-têtes améliorés pour imiter un navigateur
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'en-US,en;q=0.9',
      'Origin': 'https://finance.yahoo.com',
      'Referer': `https://finance.yahoo.com/quote/${symbol}`
    };

    // Récupération des données de base (chart)
    const chartResponse = await fetch(chartUrl, { headers });

    if (!chartResponse.ok) {
      throw new Error(`Yahoo Finance API error: ${chartResponse.status}`);
    }

    const chartData = await chartResponse.json();
    
    if (chartData.chart.error) {
      throw new Error(chartData.chart.error.description);
    }

    const result = chartData.chart.result?.[0];
    if (!result || !result.meta) {
      throw new Error("No chart data found");
    }
    
    // URL pour les données détaillées
    const detailUrl = `https://query1.finance.yahoo.com/v10/finance/quoteSummary/${symbol}?modules=summaryDetail,defaultKeyStatistics,assetProfile,price,financialData,incomeStatementHistory,cashflowStatementHistory`;
    
    // Récupération des données détaillées
    const summaryResponse = await fetch(detailUrl, { headers });

    if (!summaryResponse.ok) {
      throw new Error(`Yahoo Finance summary API error: ${summaryResponse.status}`);
    }

    const summaryData = await summaryResponse.json();
    
    const summary = summaryData.quoteSummary?.result?.[0];
    if (!summary) {
      throw new Error("No summary data found");
    }

    // Extraction des données de différentes sections
    const summaryDetail = summary.summaryDetail || {};
    const keyStats = summary.defaultKeyStatistics || {};
    const profile = summary.assetProfile || {};
    const price = summary.price || {};
    const financialData = summary.financialData || {};
    const incomeStatement = summary.incomeStatementHistory?.incomeStatementHistory?.[0] || {};
    const cashflowStatement = summary.cashflowStatementHistory?.cashflowStatements?.[0] || {};

    // Extraction des métriques financières pour les critères de notation
    const grossMargin = financialData.grossMargins?.raw || 0;
    const revenueGrowth = financialData.revenueGrowth?.raw || 0;
    const interestCoverage = financialData.interestCoverage?.raw || 0;
    const debtToEquity = financialData.debtToEquity?.raw || 0;
    const operatingCashflow = cashflowStatement.totalCashFromOperatingActivities?.raw || 0;
    const totalRevenue = incomeStatement.totalRevenue?.raw || 1; // Pour éviter division par zéro
    const operatingCashflowToSales = totalRevenue > 0 ? operatingCashflow / totalRevenue : 0;

    return {
      symbol: symbol,
      name: price.shortName || price.longName || symbol,
      currentPrice: result.meta.regularMarketPrice || 0,
      currency: result.meta.currency || 'USD',
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
    };
  } catch (error) {
    console.error('Error fetching from Yahoo Finance:', error);
    throw error;
  }
}
