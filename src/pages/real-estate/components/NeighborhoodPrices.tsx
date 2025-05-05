
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { NeighborhoodPriceInfo } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface NeighborhoodPricesProps {
  propertyAddress: string;
  propertyPricePerSqm: number | null;
}

export function NeighborhoodPrices({ propertyAddress, propertyPricePerSqm }: NeighborhoodPricesProps) {
  const [priceInfo, setPriceInfo] = useState<NeighborhoodPriceInfo | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchNeighborhoodPrices = async () => {
    if (!propertyAddress) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase.functions.invoke("get-neighborhood-prices", {
        body: { address: propertyAddress }
      });
      
      if (error) throw error;
      
      setPriceInfo(data as NeighborhoodPriceInfo);
    } catch (err) {
      setError("Impossible de récupérer les prix du quartier");
      console.error("Erreur lors de la récupération des prix du quartier:", err);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les prix du quartier",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (propertyAddress) {
      fetchNeighborhoodPrices();
    }
  }, [propertyAddress]);

  const getPriceComparisonLabel = () => {
    if (!propertyPricePerSqm || !priceInfo) return null;
    
    const diff = ((propertyPricePerSqm - priceInfo.averagePrice) / priceInfo.averagePrice) * 100;
    
    if (Math.abs(diff) < 5) {
      return "Dans la moyenne du marché";
    } else if (diff < 0) {
      return `${Math.abs(diff).toFixed(1)}% moins cher que le marché`;
    } else {
      return `${diff.toFixed(1)}% plus cher que le marché`;
    }
  };

  const priceComparisonLabel = getPriceComparisonLabel();
  const priceComparisonClass = priceComparisonLabel && propertyPricePerSqm && priceInfo
    ? propertyPricePerSqm < priceInfo.averagePrice 
      ? "text-green-600"
      : propertyPricePerSqm > priceInfo.averagePrice
        ? "text-amber-600" 
        : "text-gray-600"
    : "";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center">
          <MapPin className="mr-2 h-5 w-5" />
          Prix au m² dans le quartier
        </CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-4">
            <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
          </div>
        ) : error ? (
          <div className="space-y-4">
            <p className="text-sm text-red-500">{error}</p>
            <Button 
              variant="outline" 
              size="sm"
              onClick={fetchNeighborhoodPrices}
            >
              Réessayer
            </Button>
          </div>
        ) : priceInfo ? (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-2">
              <div className="text-center">
                <p className="text-sm text-gray-500">Min</p>
                <p className="font-semibold">{priceInfo.minPrice.toLocaleString('fr-FR')} €/m²</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Moyen</p>
                <p className="font-semibold">{priceInfo.averagePrice.toLocaleString('fr-FR')} €/m²</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-500">Max</p>
                <p className="font-semibold">{priceInfo.maxPrice.toLocaleString('fr-FR')} €/m²</p>
              </div>
            </div>
            
            {propertyPricePerSqm && (
              <div className="p-3 bg-gray-50 rounded-md">
                <div className="flex justify-between items-center">
                  <span className="text-sm">Votre bien</span>
                  <span className="font-semibold">{propertyPricePerSqm.toLocaleString('fr-FR')} €/m²</span>
                </div>
                {priceComparisonLabel && (
                  <p className={`text-xs mt-1 ${priceComparisonClass}`}>
                    {priceComparisonLabel}
                  </p>
                )}
              </div>
            )}
            
            <div className="text-xs text-gray-500 flex justify-between items-center mt-2">
              <span>Source: {priceInfo.source}</span>
              <span>Mise à jour: {new Date(priceInfo.lastUpdated).toLocaleDateString('fr-FR')}</span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-sm text-gray-500">
              Aucun prix disponible pour cette adresse
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={fetchNeighborhoodPrices}
            >
              Actualiser
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
