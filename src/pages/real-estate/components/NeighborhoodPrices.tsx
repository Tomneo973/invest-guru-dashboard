
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, BarChart3 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NeighborhoodPriceInfo } from "../types";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

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
          <div className="space-y-3">
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
            
            {propertyPricePerSqm && (
              <div className="pt-2 border-t">
                <p className="text-xs text-muted-foreground">Votre bien</p>
                <div className="flex items-center gap-2">
                  <p className="font-semibold">{formatter.format(propertyPricePerSqm)}/m²</p>
                  <PerformanceIndicator 
                    propertyPrice={propertyPricePerSqm} 
                    averagePrice={data.averagePrice} 
                  />
                </div>
              </div>
            )}
            
            <p className="text-xs text-muted-foreground mt-2">
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
    return <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded-sm">Dans la moyenne</span>;
  } else if (diff < 0) {
    return <span className="text-xs px-1.5 py-0.5 bg-green-100 text-green-800 rounded-sm">Bon achat ({diff.toFixed(0)}%)</span>;
  } else {
    return <span className="text-xs px-1.5 py-0.5 bg-yellow-100 text-yellow-800 rounded-sm">Prix élevé (+{diff.toFixed(0)}%)</span>;
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
