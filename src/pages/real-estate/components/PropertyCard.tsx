
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RealEstateProperty } from "../types";
import { Badge } from "@/components/ui/badge";
import { Euro } from "lucide-react";

interface PropertyCardProps {
  property: RealEstateProperty;
  onClick: (property: RealEstateProperty) => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  // Calcul du cash-flow mensuel
  const monthlyPayment = property.monthly_payment || 0;
  const monthlyRent = property.is_rented ? (property.monthly_rent || 0) : 0;
  
  // Calcul des taxes mensuelles
  const monthlyTaxes = ((property.property_tax || 0) + 
                        (property.housing_tax || 0) + 
                        (property.other_taxes || 0)) / 12;
  
  const cashflow = monthlyRent - monthlyPayment - monthlyTaxes;
  
  // Calcul de la rentabilité brute (avant impôts)
  const annualRent = monthlyRent * 12;
  const grossYield = property.purchase_price > 0 ? (annualRent / property.purchase_price) * 100 : 0;
  
  // Calcul de la rentabilité nette (après impôts)
  const annualCashflow = cashflow * 12;
  const netYield = property.purchase_price > 0 ? (annualCashflow / property.purchase_price) * 100 : 0;

  // Calcul du prix au mètre carré
  const pricePerSqm = property.surface_area && property.surface_area > 0 
    ? property.purchase_price / property.surface_area 
    : null;

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-3 pt-4 px-4">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{property.name}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{property.address}</p>
          </div>
          <Badge
            variant={
              property.is_sold
                ? "destructive"
                : property.is_rented
                ? "default"
                : "outline"
            }
          >
            {property.is_sold
              ? "Vendu"
              : property.is_rented
              ? "Loué"
              : "Non loué"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pb-4 px-4">
        <div className="grid grid-cols-2 gap-2">
          <div>
            <p className="text-xs text-muted-foreground">Prix d'achat</p>
            <p className="text-sm font-semibold">{formatter.format(property.purchase_price)}</p>
          </div>
          
          {property.is_sold && property.sale_price ? (
            <div>
              <p className="text-xs text-muted-foreground">Prix de vente</p>
              <p className="text-sm font-semibold">{formatter.format(property.sale_price)}</p>
            </div>
          ) : (
            <>
              {property.is_rented && property.monthly_rent ? (
                <div>
                  <p className="text-xs text-muted-foreground">Loyer mensuel</p>
                  <p className="text-sm font-semibold">{formatter.format(property.monthly_rent)}</p>
                </div>
              ) : null}
            </>
          )}
        </div>

        {property.surface_area && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Surface</p>
              <p className="text-sm font-semibold">{property.surface_area} m²</p>
            </div>
            {pricePerSqm && (
              <div>
                <p className="text-xs text-muted-foreground">Prix au m²</p>
                <p className="text-sm font-semibold">{formatter.format(pricePerSqm)}/m²</p>
              </div>
            )}
          </div>
        )}

        {property.is_rented && !property.is_sold && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Cash-flow mensuel</p>
              <p className={`text-sm font-semibold ${cashflow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatter.format(cashflow)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Taxes mensuelles</p>
              <p className="text-sm font-semibold text-red-600">
                {formatter.format(monthlyTaxes)}
              </p>
            </div>
          </div>
        )}
        
        {property.is_rented && !property.is_sold && (
          <div className="mt-3 grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Rentabilité brute</p>
              <p className={`text-sm font-semibold ${grossYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {grossYield.toFixed(2)}%
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Rentabilité nette</p>
              <p className={`text-sm font-semibold ${netYield >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {netYield.toFixed(2)}%
              </p>
            </div>
          </div>
        )}
        
        <Button onClick={() => onClick(property)} className="w-full mt-4" variant="outline" size="sm">
          <Euro className="mr-2 h-4 w-4" />
          {property.is_sold ? "Voir le détail" : "Gérer le bien"}
        </Button>
      </CardContent>
    </Card>
  );
}
