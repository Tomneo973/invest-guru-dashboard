
import { supabase } from "@/integrations/supabase/client";

export interface PortfolioHistoryData {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

export async function fetchPortfolioValues(lastBusinessDay: Date) {
  console.log("Fetching portfolio values...");
  const { data, error } = await supabase
    .from("portfolio_daily_values")
    .select("date, total_value")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching portfolio values:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} portfolio values`);
  return data?.map(item => ({
    date: item.date,
    total_value: item.total_value
  })) || [];
}

export async function fetchInvestedValues(lastBusinessDay: Date) {
  console.log("Fetching invested values...");
  const { data, error } = await supabase
    .from("portfolio_daily_invested")
    .select("date, total_invested")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching invested values:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} invested values`);
  return data?.map(item => ({
    date: item.date,
    total_invested: item.total_invested
  })) || [];
}

export async function fetchDividendValues(lastBusinessDay: Date) {
  console.log("Fetching dividend values...");
  const { data, error } = await supabase
    .from("portfolio_daily_dividends")
    .select("date, total_dividends")
    .lte("date", lastBusinessDay.toISOString().split('T')[0])
    .order("date", { ascending: true });

  if (error) {
    console.error("Error fetching dividend values:", error);
    throw error;
  }

  console.log(`Fetched ${data?.length || 0} dividend values`);
  return data?.map(item => ({
    date: item.date,
    total_dividends: item.total_dividends
  })) || [];
}

export async function updateAllPortfolioData() {
  console.log("Starting update of all portfolio data...");
  
  try {
    // Call the update historical prices function
    const { data, error } = await supabase.functions.invoke('update-historical-prices');
    
    if (error) {
      console.error("Error updating historical data:", error);
      throw error;
    }
    
    console.log("Historical data update completed:", data);
    return data;
  } catch (error) {
    console.error("Error in updateAllPortfolioData:", error);
    throw error;
  }
}
