
import { Card, CardContent } from "@/components/ui/card";
import { RealEstateProperty } from "../types";
import { Building } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

interface PropertyCardProps {
  property: RealEstateProperty;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

  return (
    <Card 
      className="cursor-pointer transition-all hover:shadow-lg"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-semibold text-lg">{property.name}</h3>
            <p className="text-sm text-gray-500">{property.address}</p>
          </div>
          <Building className="h-5 w-5 text-gray-400" />
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Prix d'achat:</span>
            <span className="font-medium">{formatter.format(property.purchase_price)}</span>
          </div>

          {property.is_rented && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Loyer mensuel:</span>
              <span className="font-medium">{formatter.format(property.monthly_rent || 0)}</span>
            </div>
          )}

          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date d'acquisition:</span>
            <span className="font-medium">
              {format(new Date(property.acquisition_date), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
