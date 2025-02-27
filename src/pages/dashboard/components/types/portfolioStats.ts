
// Types pour les taux de change et les montants par devise
export interface CurrencyAmount {
  currency: string;
  amount: number;
}

export interface ExchangeRate {
  currency: string;
  rate: number;
}

export interface PortfolioStatsProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  numberOfPositions: number;
  top5Returns: Array<{ symbol: string; returnPercentage: number }>;
  flop5Returns: Array<{ symbol: string; returnPercentage: number }>;
  currencyAmounts?: CurrencyAmount[]; // Montants par devise
}

// Taux de change simulés (à remplacer par une API réelle)
export const mockExchangeRates: Record<string, Record<string, number>> = {
  CHF: { USD: 1.12, EUR: 1.04, GBP: 0.88, CHF: 1 },
  USD: { CHF: 0.89, EUR: 0.93, GBP: 0.78, USD: 1 },
  EUR: { CHF: 0.96, USD: 1.08, GBP: 0.84, EUR: 1 },
  GBP: { CHF: 1.14, USD: 1.28, EUR: 1.19, GBP: 1 }
};
