
import { Card, CardContent } from "@/components/ui/card";
import { RealEstateProperty } from "../types";
import { Building, Home, TrendingUp, ChevronDown } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";

interface PropertyCardProps {
  property: RealEstateProperty;
  onClick: () => void;
}

export function PropertyCard({ property, onClick }: PropertyCardProps) {
  const [expanded, setExpanded] = useState(false);
  
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  // Calculer le cash-flow mensuel
  const calculateMonthlyFlow = (): number => {
    const monthlyRent = property.is_rented ? (property.monthly_rent || 0) : 0;
    const monthlyPayment = property.monthly_payment || 0;
    return monthlyRent - monthlyPayment;
  };
  
  const monthlyFlow = calculateMonthlyFlow();
  
  // Calculer la rentabilité mensuelle
  const calculateMonthlyReturn = (): number => {
    if (property.purchase_price <= 0) return 0;
    
    const annualReturn = calculateMonthlyFlow() * 12;
    return (annualReturn / property.purchase_price) * 100;
  };
  
  const monthlyReturn = calculateMonthlyReturn();
  
  // Calculer la plus-value en cas de vente
  const calculateCapitalGain = (): number | null => {
    if (!property.is_sold || !property.sale_price) return null;
    return property.sale_price - property.purchase_price;
  };
  
  const capitalGain = calculateCapitalGain();
  
  const handleExpandClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setExpanded(!expanded);
  };
  
  const statusIcon = property.is_sold 
    ? <Home className="h-5 w-5 text-orange-400" /> 
    : property.is_rented 
      ? <TrendingUp className="h-5 w-5 text-green-500" /> 
      : <Building className="h-5 w-5 text-gray-400" />;
  
  const statusText = property.is_sold 
    ? "Vendu" 
    : property.is_rented 
      ? "Loué" 
      : "Non loué";
      
  const statusColor = property.is_sold 
    ? "text-orange-400" 
    : property.is_rented 
      ? "text-green-500" 
      : "text-gray-400";

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
          {statusIcon}
        </div>
        
        <div className="mt-4 space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Prix d'achat:</span>
            <span className="font-medium">{formatter.format(property.purchase_price)}</span>
          </div>

          {property.is_sold && property.sale_price && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Prix de vente:</span>
              <span className="font-medium">{formatter.format(property.sale_price)}</span>
            </div>
          )}

          {property.is_rented && property.monthly_rent && (
            <div className="flex justify-between">
              <span className="text-sm text-gray-500">Loyer mensuel:</span>
              <span className="font-medium">{formatter.format(property.monthly_rent)}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Date d'acquisition:</span>
            <span className="font-medium">
              {format(new Date(property.acquisition_date), 'dd MMM yyyy', { locale: fr })}
            </span>
          </div>
          
          <div className="flex justify-between items-center mt-1 pt-1 border-t border-gray-100">
            <span className={`text-sm ${statusColor}`}>
              {statusText}
            </span>
            
            {!property.is_sold && property.is_rented && (
              <span className={`text-sm font-medium ${monthlyFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {monthlyFlow >= 0 ? '+' : ''}{formatter.format(monthlyFlow)}/mois
              </span>
            )}
            
            {property.is_sold && capitalGain !== null && (
              <span className={`text-sm font-medium ${capitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {capitalGain >= 0 ? '+' : ''}{formatter.format(capitalGain)}
              </span>
            )}
          </div>
        </div>
        
        <button 
          className="w-full flex items-center justify-center mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          onClick={handleExpandClick}
        >
          {expanded ? "Moins d'infos" : "Plus d'infos"}
          <ChevronDown className={`ml-1 h-4 w-4 transition-transform ${expanded ? 'transform rotate-180' : ''}`} />
        </button>
        
        {expanded && (
          <div className="mt-4 pt-4 border-t border-gray-100 space-y-2">
            {property.loan_amount && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Montant du prêt:</span>
                <span className="font-medium">{formatter.format(property.loan_amount)}</span>
              </div>
            )}
            
            {property.repaid_capital > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Capital remboursé:</span>
                <span className="font-medium">{formatter.format(property.repaid_capital)}</span>
              </div>
            )}
            
            {property.loan_rate && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Taux d'emprunt:</span>
                <span className="font-medium">{property.loan_rate}%</span>
              </div>
            )}
            
            {property.monthly_payment && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Mensualité:</span>
                <span className="font-medium">{formatter.format(property.monthly_payment)}</span>
              </div>
            )}
            
            {property.is_rented && property.total_rents_collected > 0 && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Total loyers perçus:</span>
                <span className="font-medium">{formatter.format(property.total_rents_collected)}</span>
              </div>
            )}
            
            {!property.is_sold && property.is_rented && (
              <div className="flex justify-between">
                <span className="text-sm text-gray-500">Rentabilité:</span>
                <span className={`font-medium ${monthlyReturn >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyReturn.toFixed(2)}%
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
