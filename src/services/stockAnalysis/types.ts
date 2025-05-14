

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
  // Financial data
  grossMargin?: number;
  revenueGrowth?: number;
  interestCoverage?: number;
  debtToEquity?: number;
  operatingCashflowToSales?: number;
  // Score and details
  score?: number; // Score out of 20
  scoreDetails?: {
    valueScore: number;
    growthScore: number;
    profitabilityScore: number;
    dividendScore: number;
    momentumScore: number;
    fundamentalsScore: number;
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
  price?: number;  // Added for compatibility with database format
  currency?: string; // Added for compatibility with database format
}

export interface ScoreDetails {
  valueScore: number;
  growthScore: number;
  profitabilityScore: number;
  dividendScore: number;
  momentumScore: number;
  fundamentalsScore: number;
}
