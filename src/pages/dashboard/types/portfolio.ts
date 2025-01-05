export type SortField = 'symbol' | 'name' | 'shares' | 'avgPrice' | 'invested' | 'currentValue' | 'return' | 'currency' | 'sector';
export type SortDirection = 'asc' | 'desc';

export interface Holding {
  symbol: string;
  shares: number;
  total_invested: number;
  current_value: number;
  currency: string;
  sector: string;
}

// Mapping des symboles vers les noms complets
export const companyNames: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc.',
  'ABBV': 'AbbVie Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson',
  'V': 'Visa Inc.',
  'PG': 'Procter & Gamble Co.',
  'MA': 'Mastercard Inc.',
  'UNH': 'UnitedHealth Group Inc.',
  'HD': 'The Home Depot Inc.',
  'BAC': 'Bank of America Corp.',
  'XOM': 'Exxon Mobil Corporation',
  'PFE': 'Pfizer Inc.',
  'DIS': 'The Walt Disney Co.',
  'CSCO': 'Cisco Systems Inc.',
};