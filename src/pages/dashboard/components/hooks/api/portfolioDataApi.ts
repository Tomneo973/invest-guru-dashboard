
import { supabase } from "@/integrations/supabase/client";

export interface PortfolioHistoryData {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

/**
 * Fetches portfolio values data from Supabase
 * @param lastBusinessDay The date to fetch data until
 */
export const fetchPortfolioValues = async (lastBusinessDay: Date) => {
  const response = await supabase
    .from("portfolio_daily_values")
    .select("date, total_value")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });
  
  if (response.error) throw response.error;
  return response.data;
};

/**
 * Fetches invested values data from Supabase
 * @param lastBusinessDay The date to fetch data until
 */
export const fetchInvestedValues = async (lastBusinessDay: Date) => {
  const response = await supabase
    .from("portfolio_daily_invested")
    .select("date, total_invested")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });
  
  if (response.error) throw response.error;
  return response.data;
};

/**
 * Fetches dividend values data from Supabase
 * @param lastBusinessDay The date to fetch data until
 */
export const fetchDividendValues = async (lastBusinessDay: Date) => {
  const response = await supabase
    .from("portfolio_daily_dividends")
    .select("date, total_dividends")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });
  
  if (response.error) throw response.error;
  return response.data;
};

/**
 * Updates historical prices data
 */
export const updateHistoricalPrices = async () => {
  const response = await supabase.functions.invoke("update-historical-prices");
  if (response.error) throw new Error(`Erreur lors de la mise à jour des prix: ${response.error.message}`);
  return response.data;
};

/**
 * Updates daily portfolio values
 */
export const updateDailyPortfolioValues = async () => {
  const response = await supabase.rpc("update_daily_portfolio_values");
  if (response.error) throw new Error(`Erreur lors de la mise à jour des valeurs du portfolio: ${response.error.message}`);
  return response.data;
};

/**
 * Updates daily invested amounts
 */
export const updateDailyInvested = async () => {
  const response = await supabase.rpc("update_daily_invested");
  if (response.error) throw new Error(`Erreur lors de la mise à jour des montants investis: ${response.error.message}`);
  return response.data;
};

/**
 * Updates daily dividends
 */
export const updateDailyDividends = async () => {
  const response = await supabase.rpc("update_daily_dividends");
  if (response.error) throw new Error(`Erreur lors de la mise à jour des dividendes: ${response.error.message}`);
  return response.data;
};
