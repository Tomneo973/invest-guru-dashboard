
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { toast } from "@/components/ui/use-toast";
import { StockSearchForm } from "./components/StockSearchForm";
import { StockFinancials } from "./components/StockFinancials";
import { StockPriceChart } from "./components/StockPriceChart";
import { getStockFinancials, getHistoricalPrices } from "@/services/stockAnalysis";

export default function StockAnalysisPage() {
  const [symbol, setSymbol] = useState<string | null>(null);

  const {
    data: financials,
    isLoading: isLoadingFinancials,
    error: financialsError,
    refetch: refetchFinancials,
  } = useQuery({
    queryKey: ["stock-financials", symbol],
    queryFn: () => (symbol ? getStockFinancials(symbol) : Promise.reject("No symbol provided")),
    enabled: !!symbol,
    retry: 1,
    onError: (error) => {
      console.error("Error fetching financials:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de récupérer les données financières pour ${symbol}. Veuillez réessayer.`,
      });
    },
  });

  const {
    data: historicalPrices,
    isLoading: isLoadingHistorical,
    error: historicalError,
    refetch: refetchHistorical,
  } = useQuery({
    queryKey: ["historical-prices", symbol],
    queryFn: () => (symbol ? getHistoricalPrices(symbol) : Promise.reject("No symbol provided")),
    enabled: !!symbol,
    retry: 1,
    onError: (error) => {
      console.error("Error fetching historical prices:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: `Impossible de récupérer l'historique des prix pour ${symbol}.`,
      });
    },
  });

  const handleSearch = (newSymbol: string) => {
    const formattedSymbol = newSymbol.trim().toUpperCase();
    setSymbol(formattedSymbol);
    
    if (symbol === formattedSymbol) {
      // Si c'est le même symbole, on force le rafraîchissement
      refetchFinancials();
      refetchHistorical();
    }
    
    toast({
      title: "Recherche en cours",
      description: `Récupération des données pour ${formattedSymbol}...`,
    });
  };

  const isLoading = isLoadingFinancials || isLoadingHistorical;
  const error = financialsError || historicalError;
  const hasFinancialsError = financials?.error || financialsError;

  // Fonction pour obtenir la classe de couleur en fonction du score
  const getScoreColorClass = (score?: number) => {
    if (!score) return "";
    if (score >= 15) return "bg-green-100 border-green-500 text-green-800";
    if (score >= 10) return "bg-amber-100 border-amber-500 text-amber-800";
    return "bg-red-100 border-red-500 text-red-800";
  };

  // Fonction pour obtenir le texte de recommandation
  const getRecommendationText = (score?: number) => {
    if (!score) return "";
    if (score >= 15) return "Très recommandé pour investissement";
    if (score >= 10) return "Potentiellement intéressant, analyse approfondie recommandée";
    return "Non recommandé selon nos critères";
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Analyse d'action</h1>
      
      <StockSearchForm onSubmit={handleSearch} isLoading={isLoading} />
      
      {symbol && isLoading && (
        <div className="space-y-4">
          <Skeleton className="w-full h-[400px] rounded-lg" />
          <Skeleton className="w-full h-[300px] rounded-lg" />
        </div>
      )}
      
      {hasFinancialsError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            {financials?.error 
              ? `Une erreur est survenue: ${financials.error}`
              : "Une erreur est survenue lors de la récupération des données. Veuillez vérifier le symbole et réessayer."}
          </AlertDescription>
        </Alert>
      )}
      
      {financials && !financials.error && !isLoading && !error && (
        <div className="space-y-6">
          {financials.score !== undefined && (
            <div className={`p-4 border-l-4 rounded ${getScoreColorClass(financials.score)}`}>
              <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                <div>
                  <h3 className="text-lg font-semibold">{financials.name} ({financials.symbol})</h3>
                  <p>{getRecommendationText(financials.score)}</p>
                </div>
                <div className="mt-2 md:mt-0">
                  <span className="text-2xl font-bold">{financials.score}/20</span>
                </div>
              </div>
            </div>
          )}
          
          <StockFinancials data={financials} />
          
          {historicalPrices && historicalPrices.length > 0 && (
            <StockPriceChart 
              data={historicalPrices} 
              symbol={symbol || ""} 
              currency={financials.currency}
            />
          )}
        </div>
      )}
    </div>
  );
}
