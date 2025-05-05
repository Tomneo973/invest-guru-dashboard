
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NeighborhoodPriceInfo } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";

interface NeighborhoodPricesProps {
  propertyAddress: string;
  propertyPricePerSqm: number | null;
}

export function NeighborhoodPrices({ propertyAddress, propertyPricePerSqm }: NeighborhoodPricesProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["neighborhood-prices", propertyAddress],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke("get-neighborhood-prices", {
        body: { address: propertyAddress }
      });
      
      if (error) throw new Error(error.message);
      return data as NeighborhoodPriceInfo;
    },
    enabled: !!propertyAddress,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });

  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0
  });
  
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Erreur</AlertTitle>
        <AlertDescription>
          Impossible de récupérer les données du quartier. Veuillez réessayer plus tard.
        </AlertDescription>
      </Alert>
    );
  }

  // Calculate price position within the price range if we have all required data
  const getPricePositionPercentage = () => {
    if (!data || !propertyPricePerSqm) return null;
    
    const range = data.maxPrice - data.minPrice;
    if (range <= 0) return 50; // Default to middle if there's no range
    
    let position = ((propertyPricePerSqm - data.minPrice) / range) * 100;
    // Constrain between 0 and 100
    position = Math.max(0, Math.min(100, position));
    return position;
  };

  const pricePosition = getPricePositionPercentage();

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center">
          <BarChart3 className="h-4 w-4 mr-2" />
          Prix au m² dans le quartier
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : data ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Minimum</p>
                <p className="font-semibold">{formatter.format(data.minPrice)}/m²</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Moyenne</p>
                <p className="font-semibold">{formatter.format(data.averagePrice)}/m²</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Maximum</p>
                <p className="font-semibold">{formatter.format(data.maxPrice)}/m²</p>
              </div>
            </div>
            
            {propertyPricePerSqm && pricePosition !== null && (
              <div className="pt-3 border-t">
                <div className="mb-2">
                  <div className="flex justify-between mb-1">
                    <p className="text-xs text-muted-foreground">Fourchette de prix</p>
                    <p className="text-xs font-medium">Votre bien: {formatter.format(propertyPricePerSqm)}/m²</p>
                  </div>
                  <div className="relative pt-4">
                    <Progress value={pricePosition} className="h-2" />
                    <div 
                      className="absolute h-4 w-4 rounded-full bg-primary border-2 border-white shadow-md -translate-x-1/2" 
                      style={{ left: `${pricePosition}%`, top: '0px' }}
                    />
                  </div>
                  <div className="flex justify-between mt-1">
                    <p className="text-xs">{formatter.format(data.minPrice)}</p>
                    <p className="text-xs">{formatter.format(data.maxPrice)}</p>
                  </div>
                </div>
                
                <div className="mt-2">
                  <PerformanceIndicator 
                    propertyPrice={propertyPricePerSqm} 
                    averagePrice={data.averagePrice} 
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-3">
              Source: {data.source} • Mis à jour le {formatDate(data.lastUpdated)}
            </p>
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">Aucune donnée disponible pour ce quartier</p>
        )}
      </CardContent>
    </Card>
  );
}

function PerformanceIndicator({ propertyPrice, averagePrice }: { propertyPrice: number, averagePrice: number }) {
  const diff = ((propertyPrice - averagePrice) / averagePrice) * 100;
  
  if (Math.abs(diff) < 5) {
    return (
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 bg-blue-100 text-blue-800 rounded-md font-medium">
          Dans la moyenne du marché
        </span>
      </div>
    );
  } else if (diff < 0) {
    return (
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 bg-green-100 text-green-800 rounded-md font-medium">
          Bon achat ({diff.toFixed(0)}% sous la moyenne)
        </span>
      </div>
    );
  } else {
    return (
      <div className="flex items-center">
        <span className="text-xs px-2 py-1 bg-yellow-100 text-yellow-800 rounded-md font-medium">
          Prix supérieur à la moyenne (+{diff.toFixed(0)}%)
        </span>
      </div>
    );
  }
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  }).format(date);
}
