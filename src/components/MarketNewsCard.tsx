
import { MarketNews } from "@/data/marketNews";
import { Card, CardContent } from "@/components/ui/card";

interface MarketNewsCardProps {
  news: MarketNews;
}

export const MarketNewsCard = ({ news }: MarketNewsCardProps) => {
  return (
    <Card className="h-full overflow-hidden hover:shadow-md transition-shadow">
      <div className="aspect-video w-full overflow-hidden bg-gray-100">
        {news.imageUrl ? (
          <img 
            src={news.imageUrl} 
            alt={news.title} 
            className="h-full w-full object-cover transition-transform hover:scale-105" 
          />
        ) : (
          <div className="h-40 bg-gray-200 animate-pulse" />
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-500">{news.source}</span>
          <span className="text-sm text-gray-500">il y a {news.timestamp}</span>
        </div>
        <h3 className="text-lg font-semibold mb-2 line-clamp-2">{news.title}</h3>
        <p className="text-gray-600 line-clamp-2">{news.excerpt}</p>
      </CardContent>
    </Card>
  );
};
