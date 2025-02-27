
import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
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
  });

  const handleSearch = (newSymbol: string) => {
    setSymbol(newSymbol);
    if (symbol === newSymbol) {
      // Si c'est le même symbole, on force le rafraîchissement
      refetchFinancials();
      refetchHistorical();
    }
  };

  const isLoading = isLoadingFinancials || isLoadingHistorical;
  const error = financialsError || historicalError;

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
      
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erreur</AlertTitle>
          <AlertDescription>
            Une erreur est survenue lors de la récupération des données. Veuillez vérifier le symbole et réessayer.
          </AlertDescription>
        </Alert>
      )}
      
      {financials && !isLoading && !error && (
        <div className="space-y-6">
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
