
import { PortfolioHistoryData } from "../hooks/api/portfolioDataApi";

/**
 * Vérifie si une date correspond à un weekend (samedi ou dimanche)
 */
export function isWeekend(date: Date): boolean {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 = dimanche, 6 = samedi
}

/**
 * Récupère le dernier jour ouvré (non weekend)
 * Retourne la date d'aujourd'hui si c'est un jour ouvré, sinon le dernier jour ouvré précédent
 */
export function getLastBusinessDay(): Date {
  const today = new Date();
  let date = new Date(today);
  
  // Si aujourd'hui est un weekend, reculer jusqu'au dernier jour ouvré (vendredi)
  while (isWeekend(date)) {
    date.setDate(date.getDate() - 1);
  }
  
  console.log("Dernier jour ouvré calculé:", date.toISOString().split('T')[0]);
  return date;
}

/**
 * Filtre les anomalies dans les données du portfolio
 */
export function filterAnomalies(data: PortfolioHistoryData[]): PortfolioHistoryData[] {
  if (!data || data.length === 0) return [];
  
  // Calculer la moyenne et l'écart type
  const values = data.map(item => item.portfolioValue);
  const avg = values.reduce((sum, val) => sum + val, 0) / values.length;
  const stdDev = Math.sqrt(
    values.map(val => Math.pow(val - avg, 2))
          .reduce((sum, val) => sum + val, 0) / values.length
  );
  
  // Filtrer les valeurs à plus de 3 écarts types de la moyenne
  // ou les valeurs négatives ou nulles
  return data.filter(item => {
    if (item.portfolioValue <= 0) return false;
    
    // Si l'écart type est trop petit pour être significatif, ne pas filtrer
    if (stdDev < avg * 0.01) return true;
    
    const zScore = Math.abs(item.portfolioValue - avg) / stdDev;
    return zScore <= 3;
  });
}

/**
 * Génère une liste de jours ouvrés entre deux dates
 */
export function generateBusinessDays(startDate: Date, endDate: Date): Date[] {
  const businessDays: Date[] = [];
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    if (!isWeekend(currentDate)) {
      businessDays.push(new Date(currentDate));
    }
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return businessDays;
}

/**
 * Vérifie que les données vont bien jusqu'au dernier jour ouvré
 * et retourne la liste des jours manquants si nécessaire
 */
export function checkDataCompleteness(data: PortfolioHistoryData[]): string[] {
  if (!data || data.length === 0) return [];
  
  // Récupérer le dernier jour ouvré
  const lastBusinessDay = getLastBusinessDay();
  const lastBusinessDayString = lastBusinessDay.toISOString().split('T')[0];
  
  // Récupérer la dernière date des données
  const lastDataDate = data.length > 0 
    ? data[data.length - 1].date
    : null;
    
  console.log("Dernière date des données:", lastDataDate);
  console.log("Dernier jour ouvré:", lastBusinessDayString);
  
  const missingDays: string[] = [];
  
  // Vérifier si les données sont à jour
  if (lastDataDate !== lastBusinessDayString) {
    // Trouver tous les jours ouvrés manquants
    if (lastDataDate) {
      const lastDataDateObj = new Date(lastDataDate);
      lastDataDateObj.setDate(lastDataDateObj.getDate() + 1);
      
      const businessDays = generateBusinessDays(lastDataDateObj, lastBusinessDay);
      
      businessDays.forEach(day => {
        missingDays.push(day.toISOString().split('T')[0]);
      });
    } else {
      missingDays.push(lastBusinessDayString);
    }
  }
  
  console.log("Jours ouvrés manquants:", missingDays);
  return missingDays;
}

/**
 * Obtenir la date de la dernière mise à jour des données
 */
export function getLatestDataDate(data: PortfolioHistoryData[]): string | null {
  if (!data || data.length === 0) return null;
  
  // Trier les données par date décroissante
  const sortedData = [...data].sort((a, b) => {
    return new Date(b.date).getTime() - new Date(a.date).getTime();
  });
  
  return sortedData[0].date;
}
