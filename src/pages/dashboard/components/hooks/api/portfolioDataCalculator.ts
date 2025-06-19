
import { supabase } from "@/integrations/supabase/client";

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

export interface StockPrice {
  symbol: string;
  date: string;
  closing_price: number;
  currency: string;
}

export interface CalculatedPortfolioData {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

export async function fetchUserTransactions(): Promise<Transaction[]> {
  console.log("Fetching user transactions...");
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching transactions:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} transactions`);
  return data || [];
}

export async function fetchUserDividends(): Promise<Dividend[]> {
  console.log("Fetching user dividends...");
  const { data, error } = await supabase
    .from("dividends")
    .select("*")
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching dividends:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} dividends`);
  return data || [];
}

export async function fetchStockPricesForPeriod(symbols: string[], startDate: string, endDate: string): Promise<StockPrice[]> {
  if (symbols.length === 0) return [];
  
  console.log(`Fetching stock prices for ${symbols.length} symbols from ${startDate} to ${endDate}`);
  const { data, error } = await supabase
    .from("stock_prices")
    .select("*")
    .in("symbol", symbols)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching stock prices:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} stock price records`);
  return data || [];
}

export function calculatePortfolioDataFromHistory(
  transactions: Transaction[],
  dividends: Dividend[],
  stockPrices: StockPrice[]
): CalculatedPortfolioData[] {
  console.log("Calculating portfolio data from transaction and dividend history...");
  
  if (transactions.length === 0) {
    console.log("No transactions found, returning empty data");
    return [];
  }

  // Créer des maps pour un accès efficace
  const priceMap = new Map<string, number>();
  stockPrices.forEach(price => {
    const key = `${price.symbol}-${price.date}`;
    priceMap.set(key, price.closing_price);
  });

  // Obtenir toutes les dates uniques et les trier
  const allDates = new Set<string>();
  transactions.forEach(t => allDates.add(t.date));
  dividends.forEach(d => allDates.add(d.date));
  
  // Ajouter les dates de prix pour avoir une continuité
  stockPrices.forEach(p => allDates.add(p.date));
  
  const sortedDates = Array.from(allDates).sort();
  console.log(`Processing ${sortedDates.length} unique dates from ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);

  const result: CalculatedPortfolioData[] = [];
  let currentHoldings = new Map<string, number>();
  let totalInvested = 0;
  let cumulativeDividends = 0;
  let lastValidPrices = new Map<string, number>();

  for (const date of sortedDates) {
    // Traiter les transactions de cette date
    const dayTransactions = transactions.filter(t => t.date === date);
    dayTransactions.forEach(transaction => {
      const currentShares = currentHoldings.get(transaction.symbol) || 0;
      
      if (transaction.type === 'buy') {
        currentHoldings.set(transaction.symbol, currentShares + transaction.shares);
        totalInvested += transaction.shares * transaction.price;
      } else if (transaction.type === 'sell') {
        currentHoldings.set(transaction.symbol, currentShares - transaction.shares);
        totalInvested -= transaction.shares * transaction.price;
      }
    });

    // Traiter les dividendes de cette date
    const dayDividends = dividends.filter(d => d.date === date);
    dayDividends.forEach(dividend => {
      cumulativeDividends += dividend.amount;
    });

    // Mettre à jour les derniers prix connus
    stockPrices.filter(p => p.date === date).forEach(price => {
      lastValidPrices.set(price.symbol, price.closing_price);
    });

    // Calculer la valeur du portfolio
    let portfolioValue = 0;
    currentHoldings.forEach((shares, symbol) => {
      if (shares > 0) {
        const price = lastValidPrices.get(symbol);
        if (price !== undefined) {
          portfolioValue += shares * price;
        }
      }
    });

    // Ne ajouter des points que s'il y a des données significatives
    if (totalInvested > 0 || portfolioValue > 0 || cumulativeDividends > 0) {
      result.push({
        date,
        portfolioValue,
        investedValue: totalInvested,
        cumulativeDividends
      });
    }
  }

  console.log(`Generated ${result.length} data points from transaction history`);
  if (result.length > 0) {
    const lastPoint = result[result.length - 1];
    console.log(`Last point: ${lastPoint.date} - Portfolio: ${lastPoint.portfolioValue}, Invested: ${lastPoint.investedValue}, Dividends: ${lastPoint.cumulativeDividends}`);
  }

  return result;
}
