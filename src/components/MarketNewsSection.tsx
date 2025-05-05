
import { useEffect, useState } from "react";
import { MarketNews, marketNewsData } from "@/data/marketNews";
import { MarketNewsCard } from "./MarketNewsCard";

interface MarketNewsSectionProps {
  refreshInterval?: number; // Intervalle de rafraîchissement en ms (par défaut 5 minutes)
  displayCount?: number; // Nombre d'articles à afficher
}

export const MarketNewsSection = ({ 
  refreshInterval = 300000, // 5 minutes par défaut
  displayCount = 3 
}: MarketNewsSectionProps) => {
  const [displayedNews, setDisplayedNews] = useState<MarketNews[]>([]);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());
  
  // Fonction pour obtenir des articles aléatoires
  const getRandomNews = () => {
    // Mélange les actualités et en prend un certain nombre
    const shuffled = [...marketNewsData].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, displayCount);
    
    // Met à jour la date de dernière actualisation
    setLastRefresh(new Date());
    
    return selected;
  };

  // Fonction pour rafraîchir manuellement les actualités
  const refreshNews = () => {
    setDisplayedNews(getRandomNews());
  };

  // Mise à jour initiale et périodique
  useEffect(() => {
    setDisplayedNews(getRandomNews());

    // Mise à jour périodique selon l'intervalle défini
    const intervalId = setInterval(() => {
      refreshNews();
    }, refreshInterval);

    // Nettoyage de l'intervalle à la suppression du composant
    return () => clearInterval(intervalId);
  }, [refreshInterval]);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div className="text-sm text-gray-500">
          Dernière mise à jour: {lastRefresh.toLocaleTimeString()}
        </div>
        <Button variant="outline" size="sm" onClick={refreshNews}>
          Actualiser
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {displayedNews.map((news) => (
          <MarketNewsCard key={news.id} news={news} />
        ))}
      </div>
    </div>
  );
};

// Composant Button pour le bouton de rafraîchissement
const Button = ({ 
  children, 
  variant = "default", 
  size = "default", 
  onClick 
}: { 
  children: React.ReactNode;
  variant?: "default" | "outline";
  size?: "default" | "sm";
  onClick?: () => void;
}) => {
  const baseClasses = "font-medium rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black";
  const variantClasses = variant === "default" 
    ? "bg-black text-white hover:bg-gray-800" 
    : "border border-gray-300 bg-white hover:bg-gray-50";
  const sizeClasses = size === "default" 
    ? "px-4 py-2 text-sm" 
    : "px-3 py-1 text-xs";
    
  return (
    <button 
      className={`${baseClasses} ${variantClasses} ${sizeClasses}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};
