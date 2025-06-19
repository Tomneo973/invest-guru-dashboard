
import { PortfolioHistoryData } from "../api/portfolioDataApi";

export function processPortfolioData(
  portfolioValues: Array<{ date: string; total_value: number }>,
  investedValues: Array<{ date: string; total_invested: number }>,
  dividendValues: Array<{ date: string; total_dividends: number }>
): PortfolioHistoryData[] {
  console.log("Processing portfolio data...");
  console.log(`Input data: ${portfolioValues.length} portfolio, ${investedValues.length} invested, ${dividendValues.length} dividends`);
  
  // Create maps for efficient lookup
  const portfolioMap = new Map(portfolioValues.map(item => [item.date, item.total_value]));
  const investedMap = new Map(investedValues.map(item => [item.date, item.total_invested]));
  const dividendMap = new Map(dividendValues.map(item => [item.date, item.total_dividends]));
  
  // Get all unique dates and sort them
  const allDates = new Set([
    ...portfolioValues.map(item => item.date),
    ...investedValues.map(item => item.date),
    ...dividendValues.map(item => item.date)
  ]);
  
  const sortedDates = Array.from(allDates).sort();
  console.log(`Processing ${sortedDates.length} unique dates from ${sortedDates[0]} to ${sortedDates[sortedDates.length - 1]}`);
  
  // Forward fill missing values
  let lastPortfolioValue = 0;
  let lastInvestedValue = 0;
  let lastDividendValue = 0;
  
  const processedData: PortfolioHistoryData[] = [];
  
  for (const date of sortedDates) {
    // Update values if available, otherwise use last known values
    if (portfolioMap.has(date)) {
      lastPortfolioValue = portfolioMap.get(date)!;
    }
    if (investedMap.has(date)) {
      lastInvestedValue = investedMap.get(date)!;
    }
    if (dividendMap.has(date)) {
      lastDividendValue = dividendMap.get(date)!;
    }
    
    // Only add data points where we have meaningful values
    if (lastPortfolioValue > 0 || lastInvestedValue > 0) {
      processedData.push({
        date,
        portfolioValue: lastPortfolioValue,
        investedValue: lastInvestedValue,
        cumulativeDividends: lastDividendValue
      });
    }
  }
  
  console.log(`Processed data contains ${processedData.length} valid points`);
  
  if (processedData.length > 0) {
    const firstPoint = processedData[0];
    const lastPoint = processedData[processedData.length - 1];
    console.log(`First point: ${firstPoint.date} - Portfolio: ${firstPoint.portfolioValue}, Invested: ${firstPoint.investedValue}`);
    console.log(`Last point: ${lastPoint.date} - Portfolio: ${lastPoint.portfolioValue}, Invested: ${lastPoint.investedValue}`);
  }
  
  return processedData;
}

export function checkForAnomalies(data: PortfolioHistoryData[]) {
  if (data.length === 0) return;
  
  const anomalies = data.filter(point => 
    point.portfolioValue === 0 && point.investedValue > 0
  );
  
  if (anomalies.length > 0) {
    console.warn(`Found ${anomalies.length} potential anomalies (portfolio value = 0 but invested > 0)`);
    console.log("Sample anomalies:", anomalies.slice(0, 3));
  }
  
  // Check for large jumps that might indicate data issues
  for (let i = 1; i < data.length; i++) {
    const prev = data[i - 1];
    const curr = data[i];
    
    const portfolioChange = Math.abs(curr.portfolioValue - prev.portfolioValue) / Math.max(prev.portfolioValue, 1);
    const investedChange = Math.abs(curr.investedValue - prev.investedValue) / Math.max(prev.investedValue, 1);
    
    if (portfolioChange > 0.5 || investedChange > 0.5) {
      console.warn(`Large change detected between ${prev.date} and ${curr.date}:`, {
        portfolioChange: `${(portfolioChange * 100).toFixed(1)}%`,
        investedChange: `${(investedChange * 100).toFixed(1)}%`
      });
    }
  }
}
