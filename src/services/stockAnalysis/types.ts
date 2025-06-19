
// Types for financial data analysis

export interface FinancialRatio {
  symbol: string;
  date: string;
  pe?: number;
  pb?: number;
  ps?: number;
  pfcf?: number;
  dividendYield?: number;
  roe?: number;
  roa?: number;
}

export interface KeyMetric {
  symbol: string;
  date: string;
  revenue?: number;
  netIncome?: number;
  eps?: number;
  marketCap?: number;
  ebitda?: number;
  debtToEquity?: number;
  currentRatio?: number;
  freeCashFlow?: number;
  enterpriseValue?: number;
}

export interface Score {
  symbol: string;
  totalScore: number;
  valueScore: number;
  growthScore: number;
  qualityScore: number;
  profitabilityScore: number;
  date: string;
}

export interface ScoreDetails {
  valueScore: number;
  growthScore: number;
  profitabilityScore: number;
  dividendScore: number;
  momentumScore: number;
  fundamentalsScore: number;
}

export interface HistoricalPrice {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  // Additional fields that might be present
  price?: number;
  currency?: string;
}

export interface StockData {
  symbol: string;
  name?: string;
  price?: number;
  change?: number;
  percentChange?: number;
  volume?: number;
  marketCap?: number;
  peRatio?: number;
  dividend?: number;
  yield?: number;
  eps?: number;
  scores?: Score;
  historical?: HistoricalPrice[];
  financials?: KeyMetric[];
  ratios?: FinancialRatio[];
}

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
  grossMargin?: number;
  revenueGrowth?: number;
  interestCoverage?: number;
  debtToEquity?: number;
  operatingCashflowToSales?: number;
  score?: number;
  scoreDetails?: ScoreDetails;
  error?: string;
}

// Interface pour les données de prix stockées dans la base de données
export interface DbPriceData {
  date: string;
  closing_price: number;
  currency: string;
}
