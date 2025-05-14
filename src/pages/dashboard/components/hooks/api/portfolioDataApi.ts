
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
  console.log("Fetching portfolio values until:", lastBusinessDay.toISOString().split('T')[0]);
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
  console.log("Fetching invested values until:", lastBusinessDay.toISOString().split('T')[0]);
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
  console.log("Fetching dividend values until:", lastBusinessDay.toISOString().split('T')[0]);
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
 * Récupère directement la composition du portfolio pour chaque jour
 * @param lastBusinessDay The date to fetch data until
 */
export const fetchPortfolioComposition = async (lastBusinessDay: Date) => {
  console.log("Fetching portfolio composition until:", lastBusinessDay.toISOString().split('T')[0]);
  const response = await supabase
    .from("portfolio_daily_holdings")
    .select("date, symbol, shares")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });
  
  if (response.error) {
    console.error("Error fetching portfolio composition:", response.error);
    throw response.error;
  }
  
  console.log(`Fetched portfolio composition records: ${response.data.length}`);
  return response.data;
};

/**
 * Récupère les prix historiques pour un ensemble de symboles
 * @param symbols List of symbols to fetch prices for
 * @param startDate Start date for the price history
 * @param endDate End date for the price history
 */
export const fetchHistoricalPrices = async (symbols: string[], startDate: string, endDate: string) => {
  if (!symbols.length) return [];
  
  console.log(`Fetching historical prices for ${symbols.length} symbols from ${startDate} to ${endDate}`);
  const response = await supabase
    .from("stock_prices")
    .select("date, symbol, closing_price")
    .in("symbol", symbols)
    .gte("date", startDate)
    .lte("date", endDate)
    .order("date", { ascending: true });
  
  if (response.error) {
    console.error("Error fetching historical prices:", response.error);
    throw response.error;
  }
  
  console.log(`Fetched ${response.data.length} historical price records`);
  return response.data;
};

/**
 * Updates historical prices data
 */
export const updateHistoricalPrices = async () => {
  try {
    console.log("Updating historical prices...");
    const response = await supabase.functions.invoke("update-historical-prices");
    
    if (response.error) {
      console.error("Error updating historical prices:", response.error);
      throw new Error(`Erreur lors de la mise à jour des prix: ${response.error.message}`);
    }
    
    console.log("Historical prices update response:", response.data);
    
    // Vérifier si des symboles ont échoué
    if (response.data.failedSymbols && response.data.failedSymbols.length > 0) {
      console.warn(`Failed to update prices for ${response.data.failedSymbols.length} symbols:`, 
        response.data.failedSymbols);
    }
    
    return response.data;
  } catch (error) {
    console.error("Error in updateHistoricalPrices:", error);
    throw error;
  }
};

/**
 * Updates portfolio daily holdings
 */
export const updatePortfolioHoldings = async () => {
  try {
    console.log("Updating portfolio daily holdings...");
    const response = await supabase.rpc("update_portfolio_daily_holdings");
    
    if (response.error) {
      console.error("Error updating portfolio daily holdings:", response.error);
      throw new Error(`Erreur lors de la mise à jour des positions du portfolio: ${response.error.message}`);
    }
    
    console.log("Portfolio daily holdings update successful");
    return response.data;
  } catch (error) {
    console.error("Error in updatePortfolioHoldings:", error);
    throw error;
  }
};

/**
 * Updates daily portfolio values
 */
export const updateDailyPortfolioValues = async () => {
  try {
    console.log("Updating daily portfolio values...");
    const response = await supabase.rpc("update_daily_portfolio_values");
    
    if (response.error) {
      console.error("Error updating daily portfolio values:", response.error);
      throw new Error(`Erreur lors de la mise à jour des valeurs du portfolio: ${response.error.message}`);
    }
    
    console.log("Daily portfolio values update successful");
    return response.data;
  } catch (error) {
    console.error("Error in updateDailyPortfolioValues:", error);
    throw error;
  }
};

/**
 * Updates daily invested amounts
 */
export const updateDailyInvested = async () => {
  try {
    console.log("Updating daily invested amounts...");
    const response = await supabase.rpc("update_daily_invested");
    
    if (response.error) {
      console.error("Error updating daily invested amounts:", response.error);
      throw new Error(`Erreur lors de la mise à jour des montants investis: ${response.error.message}`);
    }
    
    console.log("Daily invested amounts update successful");
    return response.data;
  } catch (error) {
    console.error("Error in updateDailyInvested:", error);
    throw error;
  }
};

/**
 * Updates daily dividends
 */
export const updateDailyDividends = async () => {
  try {
    console.log("Updating daily dividends...");
    const response = await supabase.rpc("update_daily_dividends");
    
    if (response.error) {
      console.error("Error updating daily dividends:", response.error);
      throw new Error(`Erreur lors de la mise à jour des dividendes: ${response.error.message}`);
    }
    
    console.log("Daily dividends update successful");
    return response.data;
  } catch (error) {
    console.error("Error in updateDailyDividends:", error);
    throw error;
  }
};

/**
 * Updates all portfolio data in the correct order
 */
export const updateAllPortfolioData = async () => {
  try {
    // 1. D'abord mettre à jour les prix historiques
    const pricesUpdateResult = await updateHistoricalPrices();
    console.log("Historical prices update completed:", pricesUpdateResult);
    
    // 2. Mettre à jour les positions quotidiennes (holdings)
    const holdingsUpdateResult = await updatePortfolioHoldings();
    console.log("Portfolio holdings update completed:", holdingsUpdateResult);
    
    // 3. Mettre à jour les valeurs calculées
    const valuesUpdateResult = await updateDailyPortfolioValues();
    console.log("Daily portfolio values update completed:", valuesUpdateResult);
    
    const investedUpdateResult = await updateDailyInvested();
    console.log("Daily invested update completed:", investedUpdateResult);
    
    const dividendsUpdateResult = await updateDailyDividends();
    console.log("Daily dividends update completed:", dividendsUpdateResult);
    
    return {
      pricesUpdateResult,
      holdingsUpdateResult,
      valuesUpdateResult,
      investedUpdateResult,
      dividendsUpdateResult
    };
  } catch (error) {
    console.error("Error updating all portfolio data:", error);
    throw error;
  }
};
