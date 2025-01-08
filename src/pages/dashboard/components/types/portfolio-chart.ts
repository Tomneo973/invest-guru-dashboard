export interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  date: string;
  platform: string;
  currency: string;
  sector: string;
  created_at: string;
}

export interface Dividend {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  currency: string;
  date: string;
  created_at: string;
  withheld_taxes: number;
}

export interface HistoricalPrice {
  symbol: string;
  date: string;
  closing_price: number;
  currency: string;
}

export interface ChartDataPoint {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}