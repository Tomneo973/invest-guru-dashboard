
import { PortfolioHistoryData } from "../api/portfolioDataApi";

/**
 * Processes raw portfolio data into a unified format
 */
export const processPortfolioData = (
  portfolioValues: { date: string; total_value: number }[],
  investedValues: { date: string; total_invested: number }[],
  dividendValues: { date: string; total_dividends: number }[]
): PortfolioHistoryData[] => {
  // Create Maps for each type of data for quick access
  const valuesByDate = new Map(
    portfolioValues.map(v => [v.date, v.total_value])
  );
  const investedByDate = new Map(
    investedValues.map(v => [v.date, v.total_invested])
  );
  const dividendsByDate = new Map(
    dividendValues.map(v => [v.date, v.total_dividends])
  );

  // Get all unique dates
  const allDates = [...new Set([
    ...portfolioValues.map(v => v.date),
    ...investedValues.map(v => v.date),
    ...dividendValues.map(v => v.date)
  ])].sort();

  // Generate the data for each date
  return allDates.map(date => {
    const portfolioValue = valuesByDate.get(date) || 0;
    const investedValue = investedByDate.get(date) || 0;
    const cumulativeDividends = dividendsByDate.get(date) || 0;
    
    return {
      date,
      portfolioValue,
      investedValue,
      cumulativeDividends
    };
  });
};

/**
 * Checks and logs any anomalous data points
 */
export const checkForAnomalies = (chartData: PortfolioHistoryData[]): void => {
  const anomalies = chartData.filter(item => {
    // Negative or zero values
    if (item.portfolioValue <= 0) return true;
    
    // Abnormally high values compared to invested value
    if (item.portfolioValue > item.investedValue * 5) return true;
    
    // Abnormally low values compared to invested value
    if (item.portfolioValue < item.investedValue * 0.2 && item.investedValue > 0) return true;
    
    return false;
  });
  
  if (anomalies.length > 0) {
    console.warn(`Found ${anomalies.length} anomalous data points:`, anomalies);
  }
};
