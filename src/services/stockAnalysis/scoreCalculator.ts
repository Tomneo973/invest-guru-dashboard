
import { StockFinancialData, ScoreDetails } from "./types";

// Function to calculate the stock score
export function calculateStockScore(data: any, fairPrice: number): ScoreDetails {
  // 1. Value score (0-3 points)
  let valueScore = 0;
  if (data.currentPrice && fairPrice && fairPrice > 0) {
    const priceFairRatio = data.currentPrice / fairPrice;
    if (priceFairRatio <= 0.8) valueScore = 3; // Very undervalued
    else if (priceFairRatio <= 0.9) valueScore = 2;
    else if (priceFairRatio <= 1.0) valueScore = 1;
  }
  if (data.priceToBook && data.priceToBook < 1.5) {
    valueScore += 0.5;
  }

  // 2. Growth score (0-3 points)
  let growthScore = 0;
  if (data.forwardPE && data.peRatio) {
    if (data.forwardPE < data.peRatio) {
      // If future PE is lower than current PE, it's a sign of expected growth
      const peImprovement = 1 - (data.forwardPE / data.peRatio);
      growthScore += Math.min(peImprovement * 10, 2); // Max 2 points for this
    }
  }
  // Additional points for positive recommendations
  if (data.recommendation === "buy" || data.recommendation === "strongBuy") {
    growthScore += 1;
  }

  // 3. Profitability score (0-3 points)
  let profitabilityScore = 0;
  if (data.eps > 0) {
    profitabilityScore += 1.5; // Profitable company
    if (data.eps > 5) profitabilityScore += 0.5; // Good earnings per share
  }
  if (data.peRatio > 0 && data.peRatio < 20) {
    profitabilityScore += 1;
  }

  // 4. Dividend score (0-3 points)
  let dividendScore = 0;
  if (data.dividendYield > 0) {
    if (data.dividendYield >= 0.05) dividendScore = 3; // 5%+ is excellent
    else if (data.dividendYield >= 0.04) dividendScore = 2.5;
    else if (data.dividendYield >= 0.03) dividendScore = 2;
    else if (data.dividendYield >= 0.02) dividendScore = 1.5;
    else dividendScore = 0.5; // Less than 2% but still pays a dividend
  }

  // 5. Momentum score (0-3 points)
  let momentumScore = 0;
  if (data.currentPrice && data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) {
    const range = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
    if (range > 0) {
      const positionInRange = (data.currentPrice - data.fiftyTwoWeekLow) / range;
      // Give more points for being in the 2nd or 3rd quartile (not too high, not too low)
      if (positionInRange >= 0.25 && positionInRange <= 0.75) {
        momentumScore += 1.5;
      } else if (positionInRange > 0.75 && positionInRange <= 0.9) {
        momentumScore += 1; // Near the top but not at the peak
      } else if (positionInRange >= 0.1 && positionInRange < 0.25) {
        momentumScore += 1; // Not too close to the bottom
      }
    }
  }
  if (data.targetPrice && data.currentPrice) {
    const potentialGain = (data.targetPrice / data.currentPrice) - 1;
    if (potentialGain > 0.2) momentumScore += 1.5; // More than 20% potential
    else if (potentialGain > 0.1) momentumScore += 1; // More than 10% potential
  }

  // 6. Fundamentals score (0-5 points) - Based on new criteria
  let fundamentalsScore = 0;
  
  // Gross Margin
  if (data.grossMargin !== undefined) {
    if (data.grossMargin > 0.4) fundamentalsScore += 1; // >40% -> +1
    else if (data.grossMargin < 0.1) fundamentalsScore -= 1; // <10% -> -1
  }
  
  // Revenue Growth
  if (data.revenueGrowth !== undefined) {
    if (data.revenueGrowth > 0.15) fundamentalsScore += 1; // >15% -> +1
    else if (data.revenueGrowth < 0.02) fundamentalsScore -= 1; // <2% -> -1
  }
  
  // Interest Coverage Rate
  if (data.interestCoverage !== undefined) {
    if (data.interestCoverage > 5) fundamentalsScore += 1; // >5 -> +1
    else if (data.interestCoverage < 1.5) fundamentalsScore -= 1; // <1.5 -> -1
  }
  
  // Debt to Equity Ratio
  if (data.debtToEquity !== undefined) {
    if (data.debtToEquity < 1) fundamentalsScore += 1; // <1 -> +1
    else if (data.debtToEquity > 4) fundamentalsScore -= 1; // >4 -> -1
  }
  
  // Operating Cash Flow to Sales
  if (data.operatingCashflowToSales !== undefined) {
    if (data.operatingCashflowToSales > 0.15) fundamentalsScore += 1; // >15% -> +1
    else if (data.operatingCashflowToSales < 0.05) fundamentalsScore -= 1; // <5% -> -1
  }

  // Adjust scores to stay within the appropriate range (0-5)
  fundamentalsScore = Math.min(Math.max(fundamentalsScore, 0), 5);
  valueScore = Math.min(Math.max(valueScore, 0), 3);
  growthScore = Math.min(Math.max(growthScore, 0), 3);
  profitabilityScore = Math.min(Math.max(profitabilityScore, 0), 3);
  dividendScore = Math.min(Math.max(dividendScore, 0), 3);
  momentumScore = Math.min(Math.max(momentumScore, 0), 3);

  return {
    valueScore,
    growthScore,
    profitabilityScore,
    dividendScore,
    momentumScore,
    fundamentalsScore
  };
}
