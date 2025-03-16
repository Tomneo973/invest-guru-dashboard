
import { supabase } from "@/integrations/supabase/client";
import { StockFinancialData } from "./types";
import { calculateStockScore } from "./scoreCalculator";

export async function getStockFinancials(symbol: string): Promise<StockFinancialData> {
  try {
    console.log('Fetching financial data for:', symbol);
    // Use the existing Supabase Cloud function that queries Yahoo Finance
    const { data, error } = await supabase.functions.invoke('get-stock-financials', {
      body: { symbol }
    });

    if (error) {
      console.error(`Error fetching stock financials for ${symbol}:`, error);
      return {
        symbol,
        name: "",
        currentPrice: 0,
        currency: 'USD',
        eps: 0,
        peRatio: 0,
        forwardPE: 0,
        dividendYield: 0,
        marketCap: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        error: error.message
      };
    }
    
    if (data.error) {
      console.error(`Yahoo Finance API error for ${symbol}:`, data.error);
      return {
        symbol,
        name: "",
        currentPrice: 0,
        currency: 'USD',
        eps: 0,
        peRatio: 0,
        forwardPE: 0,
        dividendYield: 0,
        marketCap: 0,
        fiftyTwoWeekHigh: 0,
        fiftyTwoWeekLow: 0,
        error: data.error
      };
    }
    
    // Calculate fair price based on PE and EPS (simplified formula)
    const fairPrice = data.eps * data.peRatio || 0;

    // Calculate the score out of 20 with the new criteria
    let scoreDetails = calculateStockScore(data, fairPrice);
    let totalScore = scoreDetails.valueScore + scoreDetails.growthScore + 
                     scoreDetails.profitabilityScore + scoreDetails.dividendScore + 
                     scoreDetails.momentumScore + scoreDetails.fundamentalsScore;
    
    // Normalize the score to be out of 20
    totalScore = Math.min(Math.max(totalScore, 0), 20);

    return {
      symbol,
      name: data.name || symbol,
      currentPrice: data.currentPrice || 0,
      currency: data.currency || 'USD',
      eps: data.eps || 0,
      peRatio: data.peRatio || 0,
      forwardPE: data.forwardPE || 0,
      dividendYield: data.dividendYield || 0,
      marketCap: data.marketCap || 0,
      fiftyTwoWeekHigh: data.fiftyTwoWeekHigh || 0,
      fiftyTwoWeekLow: data.fiftyTwoWeekLow || 0,
      fairPrice,
      sector: data.sector,
      industry: data.industry,
      bookValue: data.bookValue,
      priceToBook: data.priceToBook,
      targetPrice: data.targetMeanPrice,
      recommendation: data.recommendation,
      // New financial data
      grossMargin: data.grossMargin,
      revenueGrowth: data.revenueGrowth,
      interestCoverage: data.interestCoverage,
      debtToEquity: data.debtToEquity,
      operatingCashflowToSales: data.operatingCashflowToSales,
      score: Number(totalScore.toFixed(1)),
      scoreDetails
    };
  } catch (error) {
    console.error(`Error fetching stock financials for ${symbol}:`, error);
    return {
      symbol,
      name: "",
      currentPrice: 0,
      currency: 'USD',
      eps: 0,
      peRatio: 0,
      forwardPE: 0,
      dividendYield: 0,
      marketCap: 0,
      fiftyTwoWeekHigh: 0,
      fiftyTwoWeekLow: 0,
      error: error instanceof Error ? error.message : 'Unknown error'
    };
  }
}
