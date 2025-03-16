
import { supabase } from "@/integrations/supabase/client";

export interface StockFinancialData {
  symbol: string;
  name: string;
  currentPrice: number;
  currency: string;
  eps: number;
  peRatio: number;
  forwardPE: number;
  dividendYield: number;
  marketCap: number;
  fiftyTwoWeekHigh: number;
  fiftyTwoWeekLow: number;
  fairPrice?: number;
  sector?: string;
  industry?: string;
  bookValue?: number;
  priceToBook?: number;
  targetPrice?: number;
  recommendation?: string;
  // Nouvelles données financières
  grossMargin?: number;
  revenueGrowth?: number;
  interestCoverage?: number;
  debtToEquity?: number;
  operatingCashflowToSales?: number;
  // Score et détails
  score?: number; // Score sur 20
  scoreDetails?: {
    valueScore: number;
    growthScore: number;
    profitabilityScore: number;
    dividendScore: number;
    momentumScore: number;
    fundamentalsScore: number; // Nouveau score pour les fondamentaux
  };
  error?: string;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export async function getStockFinancials(symbol: string): Promise<StockFinancialData> {
  try {
    // On utilise la fonction Cloud Supabase existante qui interroge Yahoo Finance
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
    
    // Calcul du prix juste basé sur le PE et l'EPS (formule simplifiée)
    const fairPrice = data.eps * data.peRatio || 0;

    // Calcul du score sur 20 avec les nouveaux critères
    let scoreDetails = calculateStockScore(data, fairPrice);
    let totalScore = scoreDetails.valueScore + scoreDetails.growthScore + 
                     scoreDetails.profitabilityScore + scoreDetails.dividendScore + 
                     scoreDetails.momentumScore + scoreDetails.fundamentalsScore;
    
    // Normaliser le score pour qu'il soit sur 20
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
      // Nouvelles données financières
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

// Fonction pour calculer le score de l'action
function calculateStockScore(data: any, fairPrice: number): { 
  valueScore: number, 
  growthScore: number, 
  profitabilityScore: number, 
  dividendScore: number, 
  momentumScore: number,
  fundamentalsScore: number 
} {
  // 1. Score de valeur (0-3 points)
  let valueScore = 0;
  if (data.currentPrice && fairPrice && fairPrice > 0) {
    const priceFairRatio = data.currentPrice / fairPrice;
    if (priceFairRatio <= 0.8) valueScore = 3; // Très sous-évalué
    else if (priceFairRatio <= 0.9) valueScore = 2;
    else if (priceFairRatio <= 1.0) valueScore = 1;
  }
  if (data.priceToBook && data.priceToBook < 1.5) {
    valueScore += 0.5;
  }

  // 2. Score de croissance (0-3 points)
  let growthScore = 0;
  if (data.forwardPE && data.peRatio) {
    if (data.forwardPE < data.peRatio) {
      // Si le PE futur est inférieur au PE actuel, c'est un signe de croissance attendue
      const peImprovement = 1 - (data.forwardPE / data.peRatio);
      growthScore += Math.min(peImprovement * 10, 2); // Max 2 points pour ça
    }
  }
  // Points supplémentaires pour les recommandations positives
  if (data.recommendation === "buy" || data.recommendation === "strongBuy") {
    growthScore += 1;
  }

  // 3. Score de rentabilité (0-3 points)
  let profitabilityScore = 0;
  if (data.eps > 0) {
    profitabilityScore += 1.5; // Entreprise profitable
    if (data.eps > 5) profitabilityScore += 0.5; // Bons bénéfices par action
  }
  if (data.peRatio > 0 && data.peRatio < 20) {
    profitabilityScore += 1;
  }

  // 4. Score de dividende (0-3 points)
  let dividendScore = 0;
  if (data.dividendYield > 0) {
    if (data.dividendYield >= 0.05) dividendScore = 3; // 5%+ est excellent
    else if (data.dividendYield >= 0.04) dividendScore = 2.5;
    else if (data.dividendYield >= 0.03) dividendScore = 2;
    else if (data.dividendYield >= 0.02) dividendScore = 1.5;
    else dividendScore = 0.5; // Moins de 2% mais paie quand même un dividende
  }

  // 5. Score d'élan/momentum (0-3 points)
  let momentumScore = 0;
  if (data.currentPrice && data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) {
    const range = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
    if (range > 0) {
      const positionInRange = (data.currentPrice - data.fiftyTwoWeekLow) / range;
      // Donner plus de points pour être dans le 2e ou 3e quartile (pas trop haut, pas trop bas)
      if (positionInRange >= 0.25 && positionInRange <= 0.75) {
        momentumScore += 1.5;
      } else if (positionInRange > 0.75 && positionInRange <= 0.9) {
        momentumScore += 1; // Près du haut mais pas au sommet
      } else if (positionInRange >= 0.1 && positionInRange < 0.25) {
        momentumScore += 1; // Pas trop près du bas
      }
    }
  }
  if (data.targetPrice && data.currentPrice) {
    const potentialGain = (data.targetPrice / data.currentPrice) - 1;
    if (potentialGain > 0.2) momentumScore += 1.5; // Plus de 20% de potentiel
    else if (potentialGain > 0.1) momentumScore += 1; // Plus de 10% de potentiel
  }

  // 6. Score des fondamentaux (0-5 points) - Selon les nouveaux critères
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

  // Ajuster les scores pour qu'ils restent dans la plage appropriée (0-5)
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

export async function getHistoricalPrices(symbol: string): Promise<HistoricalPrice[]> {
  try {
    // On utilise la fonction Cloud Supabase pour obtenir l'historique des prix
    const { data, error } = await supabase.functions.invoke('get-historical-prices', {
      body: { symbol, period: '5y', interval: '1mo' }
    });

    if (error) {
      console.error(`Error fetching historical prices for ${symbol}:`, error);
      return [];
    }

    return data.prices || [];
  } catch (error) {
    console.error(`Error fetching historical prices for ${symbol}:`, error);
    return [];
  }
}
