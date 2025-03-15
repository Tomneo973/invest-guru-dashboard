
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
  score?: number; // Score sur 20
  scoreDetails?: {
    valueScore: number;
    growthScore: number;
    profitabilityScore: number;
    dividendScore: number;
    momentumScore: number;
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

    // Calcul du score sur 20
    let scoreDetails = calculateStockScore(data, fairPrice);
    let totalScore = scoreDetails.valueScore + scoreDetails.growthScore + 
                     scoreDetails.profitabilityScore + scoreDetails.dividendScore + 
                     scoreDetails.momentumScore;
    
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
      targetPrice: data.targetPrice,
      recommendation: data.recommendation,
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
  momentumScore: number 
} {
  // 1. Score de valeur (0-4 points)
  let valueScore = 0;
  if (data.currentPrice && fairPrice && fairPrice > 0) {
    const priceFairRatio = data.currentPrice / fairPrice;
    if (priceFairRatio <= 0.8) valueScore = 4; // Très sous-évalué
    else if (priceFairRatio <= 0.9) valueScore = 3;
    else if (priceFairRatio <= 1.0) valueScore = 2;
    else if (priceFairRatio <= 1.1) valueScore = 1;
  }
  if (data.priceToBook && data.priceToBook < 1.5) {
    valueScore += 0.5;
  }

  // 2. Score de croissance (0-4 points)
  let growthScore = 0;
  if (data.forwardPE && data.peRatio) {
    if (data.forwardPE < data.peRatio) {
      // Si le PE futur est inférieur au PE actuel, c'est un signe de croissance attendue
      const peImprovement = 1 - (data.forwardPE / data.peRatio);
      growthScore += Math.min(peImprovement * 10, 3); // Max 3 points pour ça
    }
  }
  // Points supplémentaires pour les recommandations positives
  if (data.recommendation === "buy" || data.recommendation === "strongBuy") {
    growthScore += 1;
  }

  // 3. Score de rentabilité (0-4 points)
  let profitabilityScore = 0;
  if (data.eps > 0) {
    profitabilityScore += 2; // Entreprise profitable
    if (data.eps > 5) profitabilityScore += 1; // Bons bénéfices par action
  }
  if (data.peRatio > 0 && data.peRatio < 20) {
    profitabilityScore += 1;
  }

  // 4. Score de dividende (0-4 points)
  let dividendScore = 0;
  if (data.dividendYield > 0) {
    if (data.dividendYield >= 0.05) dividendScore = 4; // 5%+ est excellent
    else if (data.dividendYield >= 0.04) dividendScore = 3;
    else if (data.dividendYield >= 0.03) dividendScore = 2;
    else if (data.dividendYield >= 0.02) dividendScore = 1;
    else dividendScore = 0.5; // Moins de 2% mais paie quand même un dividende
  }

  // 5. Score d'élan/momentum (0-4 points)
  let momentumScore = 0;
  if (data.currentPrice && data.fiftyTwoWeekLow && data.fiftyTwoWeekHigh) {
    const range = data.fiftyTwoWeekHigh - data.fiftyTwoWeekLow;
    if (range > 0) {
      const positionInRange = (data.currentPrice - data.fiftyTwoWeekLow) / range;
      // Donner plus de points pour être dans le 2e ou 3e quartile (pas trop haut, pas trop bas)
      if (positionInRange >= 0.25 && positionInRange <= 0.75) {
        momentumScore += 2;
      } else if (positionInRange > 0.75 && positionInRange <= 0.9) {
        momentumScore += 1; // Près du haut mais pas au sommet
      } else if (positionInRange >= 0.1 && positionInRange < 0.25) {
        momentumScore += 1; // Pas trop près du bas
      }
    }
  }
  if (data.targetPrice && data.currentPrice) {
    const potentialGain = (data.targetPrice / data.currentPrice) - 1;
    if (potentialGain > 0.2) momentumScore += 2; // Plus de 20% de potentiel
    else if (potentialGain > 0.1) momentumScore += 1; // Plus de 10% de potentiel
  }

  return {
    valueScore,
    growthScore,
    profitabilityScore,
    dividendScore,
    momentumScore
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
