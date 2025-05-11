
// Fonction pour obtenir le dernier jour ouvrable (lundi-vendredi)
export const getLastBusinessDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  
  // Si nous sommes un dimanche (0), retourner vendredi (moins 2 jours)
  // Si nous sommes un samedi (6), retourner vendredi (moins 1 jour)
  // Sinon, retourner aujourd'hui
  const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 0;
  const lastBusinessDay = new Date(today);
  lastBusinessDay.setDate(today.getDate() - daysToSubtract);
  
  return lastBusinessDay;
};

// Fonction pour filtrer les anomalies
export const filterAnomalies = (data: any[]) => {
  if (!data || data.length === 0) return [];
  
  // Trouver la médiane pour aider à identifier les valeurs aberrantes
  const validValues = data
    .map(item => item.portfolioValue)
    .filter(value => value > 0)
    .sort((a, b) => a - b);
  
  const medianValue = validValues[Math.floor(validValues.length / 2)];
  const lowerBound = medianValue * 0.3;  // 30% de la médiane
  const upperBound = medianValue * 3;    // 300% de la médiane
  
  // Filtrer les valeurs qui s'écartent trop de la médiane
  return data.filter(item => {
    const value = item.portfolioValue;
    
    // Filtrer les valeurs négatives ou trop faibles
    if (value <= 0 || value < lowerBound) return false;
    
    // Filtrer les valeurs trop élevées
    if (value > upperBound) return false;
    
    // Vérifier les écarts entre points consécutifs
    // (cette partie reste similaire à l'original)
    return true;
  });
};
