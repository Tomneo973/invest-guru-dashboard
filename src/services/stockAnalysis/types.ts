
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

// Interface pour les données de prix stockées dans la base de données
export interface DbPriceData {
  date: string;
  closing_price: number;
  currency: string;
}
