
import { PortfolioHistoryData } from "../hooks/api/portfolioDataApi";

export function getLastBusinessDay(): Date {
  const today = new Date();
  const day = today.getDay();
  
  // If it's Saturday (6) or Sunday (0), go back to Friday
  if (day === 0) { // Sunday
    today.setDate(today.getDate() - 2);
  } else if (day === 6) { // Saturday
    today.setDate(today.getDate() - 1);
  }
  
  return today;
}

export function filterAnomalies(data: PortfolioHistoryData[]): PortfolioHistoryData[] {
  if (data.length === 0) return data;
  
  console.log(`Filtering anomalies from ${data.length} data points`);
  
  // Remove points where portfolio value is 0 but invested value is greater than 0
  // This indicates incomplete data synchronization
  const filtered = data.filter(point => {
    const isAnomaly = point.portfolioValue === 0 && point.investedValue > 0;
    return !isAnomaly;
  });
  
  // Also remove points where both portfolio and invested are 0 (no meaningful data)
  const cleanData = filtered.filter(point => 
    point.portfolioValue > 0 || point.investedValue > 0
  );
  
  const removedCount = data.length - cleanData.length;
  if (removedCount > 0) {
    console.log(`Removed ${removedCount} anomalous data points`);
  }
  
  return cleanData;
}

export function checkDataCompleteness(data: PortfolioHistoryData[]): string[] {
  if (data.length === 0) return [];
  
  const lastBusinessDay = getLastBusinessDay();
  const lastBusinessDayString = lastBusinessDay.toISOString().split('T')[0];
  
  console.log(`Dernière date des données: ${data[data.length - 1].date}`);
  console.log(`Dernier jour ouvré: ${lastBusinessDayString}`);
  
  // Get all business days from the last data point to today
  const lastDataDate = new Date(data[data.length - 1].date);
  const missingDays: string[] = [];
  
  for (let d = new Date(lastDataDate); d <= lastBusinessDay; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay();
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      const dateString = d.toISOString().split('T')[0];
      if (dateString > data[data.length - 1].date) {
        missingDays.push(dateString);
      }
    }
  }
  
  if (missingDays.length > 0) {
    console.log(`Jours ouvrés manquants: ${JSON.stringify(missingDays, null, 2)}`);
  }
  
  return missingDays;
}

export function getLatestDataDate(data: PortfolioHistoryData[]): string {
  if (data.length === 0) return 'No data';
  return data[data.length - 1].date;
}
