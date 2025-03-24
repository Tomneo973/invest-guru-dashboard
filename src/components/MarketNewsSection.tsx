
import { useEffect, useState } from "react";
import { MarketNews, marketNewsData } from "@/data/marketNews";
import { MarketNewsCard } from "./MarketNewsCard";

// Nombre d'articles à afficher
const DISPLAY_COUNT = 3;

export const MarketNewsSection = () => {
  const [displayedNews, setDisplayedNews] = useState<MarketNews[]>([]);
  
  // Fonction pour obtenir des articles aléatoires
  const getRandomNews = () => {
    // Mélange les actualités et en prend un certain nombre
    const shuffled = [...marketNewsData].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, DISPLAY_COUNT);
  };

  // Mise à jour initiale
  useEffect(() => {
    setDisplayedNews(getRandomNews());

    // Mise à jour périodique toutes les 5 minutes (300000 ms)
    const intervalId = setInterval(() => {
      setDisplayedNews(getRandomNews());
    }, 300000);

    // Nettoyage de l'intervalle à la suppression du composant
    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {displayedNews.map((news) => (
        <MarketNewsCard key={news.id} news={news} />
      ))}
    </div>
  );
};
