
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

  console.log(`Processing data for ${allDates.length} unique dates`);
  
  // Pour le débogage, voyons les premières et dernières dates
  if (allDates.length > 0) {
    console.log(`Date range: ${allDates[0]} to ${allDates[allDates.length - 1]}`);
  }

  // Generate the data for each date
  const result = allDates.map(date => {
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
  
  console.log(`Generated ${result.length} portfolio history data points`);
  
  return result;
};

/**
 * Checks and logs any anomalous data points
 */
export const checkForAnomalies = (chartData: PortfolioHistoryData[]): void => {
  if (!chartData || chartData.length === 0) {
    console.warn("No data to check for anomalies");
    return;
  }
  
  const anomalies = chartData.filter(item => {
    // Negative values
    if (item.portfolioValue < 0) return true;
    
    // Zero values only if invested value is positive
    if (item.portfolioValue === 0 && item.investedValue > 0) return true;
    
    // Abnormally high values compared to invested value
    if (item.investedValue > 0 && item.portfolioValue > item.investedValue * 5) return true;
    
    // Abnormally low values compared to invested value
    if (item.investedValue > 0 && item.portfolioValue < item.investedValue * 0.2) return true;
    
    return false;
  });
  
  if (anomalies.length > 0) {
    console.warn(`Found ${anomalies.length} anomalous data points:`, anomalies);
  } else {
    console.log("No anomalies detected in the data");
  }
  
  // Vérifiez également si les dernières données sont à jour
  const mostRecentDate = new Date(chartData[chartData.length - 1].date);
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);
  
  if (mostRecentDate < threeDaysAgo) {
    console.warn(`Latest data point is from ${mostRecentDate.toISOString().split('T')[0]}, which is more than 3 days old`);
  }
};
