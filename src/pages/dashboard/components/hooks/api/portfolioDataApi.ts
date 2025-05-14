
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
  
  if (response.error) {
    console.error("Error fetching portfolio values:", response.error);
    throw response.error;
  }
  
  console.log(`Fetched ${response.data.length} portfolio values records`);
  console.log("Latest portfolio value date:", response.data.length > 0 ? response.data[response.data.length - 1].date : "N/A");
  
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
  
  if (response.error) {
    console.error("Error fetching invested values:", response.error);
    throw response.error;
  }
  
  console.log(`Fetched ${response.data.length} invested values records`);
  console.log("Latest invested value date:", response.data.length > 0 ? response.data[response.data.length - 1].date : "N/A");
  
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
  
  if (response.error) {
    console.error("Error fetching dividend values:", response.error);
    throw response.error;
  }
  
  console.log(`Fetched ${response.data.length} dividend values records`);
  console.log("Latest dividend value date:", response.data.length > 0 ? response.data[response.data.length - 1].date : "N/A");
  
  return response.data;
};

/**
 * Updates historical prices data
 */
export const updateHistoricalPrices = async () => {
  console.log("Updating historical prices...");
  const response = await supabase.functions.invoke("update-historical-prices");
  
  if (response.error) {
    console.error("Error updating historical prices:", response.error);
    throw new Error(`Erreur lors de la mise à jour des prix: ${response.error.message}`);
  }
  
  console.log("Historical prices update response:", response.data);
  return response.data;
};

/**
 * Updates daily portfolio values
 */
export const updateDailyPortfolioValues = async () => {
  console.log("Updating daily portfolio values...");
  const response = await supabase.rpc("update_daily_portfolio_values");
  
  if (response.error) {
    console.error("Error updating daily portfolio values:", response.error);
    throw new Error(`Erreur lors de la mise à jour des valeurs du portfolio: ${response.error.message}`);
  }
  
  console.log("Daily portfolio values update successful");
  return response.data;
};

/**
 * Updates daily invested amounts
 */
export const updateDailyInvested = async () => {
  console.log("Updating daily invested amounts...");
  const response = await supabase.rpc("update_daily_invested");
  
  if (response.error) {
    console.error("Error updating daily invested amounts:", response.error);
    throw new Error(`Erreur lors de la mise à jour des montants investis: ${response.error.message}`);
  }
  
  console.log("Daily invested amounts update successful");
  return response.data;
};

/**
 * Updates daily dividends
 */
export const updateDailyDividends = async () => {
  console.log("Updating daily dividends...");
  const response = await supabase.rpc("update_daily_dividends");
  
  if (response.error) {
    console.error("Error updating daily dividends:", response.error);
    throw new Error(`Erreur lors de la mise à jour des dividendes: ${response.error.message}`);
  }
  
  console.log("Daily dividends update successful");
  return response.data;
};
