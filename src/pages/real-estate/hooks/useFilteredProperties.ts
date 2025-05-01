
import { RealEstateProperty } from "../types";
import { useMemo } from "react";

export function useFilteredProperties(
  properties: RealEstateProperty[] | undefined,
  filter: "all" | "rented" | "not_rented" | "sold"
) {
  return useMemo(() => {
    if (!properties) return [];
    
    return properties.filter((property) => {
      switch (filter) {
        case "rented":
          return property.is_rented && !property.is_sold;
        case "not_rented":
          return !property.is_rented && !property.is_sold;
        case "sold":
          return property.is_sold;
        default:
          return true;
      }
    });
  }, [properties, filter]);
}

// Fonction utilitaire pour calculer la rentabilité nette avec impôts
export function calculateNetYield(property: RealEstateProperty): number {
  if (!property.is_rented || property.is_sold || !property.monthly_rent || property.purchase_price <= 0) {
    return 0;
  }
  
  const monthlyPayment = property.monthly_payment || 0;
  
  // Calcul des taxes mensuelles
  const monthlyTaxes = ((property.property_tax || 0) + 
                        (property.housing_tax || 0) + 
                        (property.other_taxes || 0)) / 12;
  
  const monthlyNetIncome = property.monthly_rent - monthlyPayment - monthlyTaxes;
  const annualNetIncome = monthlyNetIncome * 12;
  
  return (annualNetIncome / property.purchase_price) * 100;
}

// Fonction utilitaire pour calculer la rentabilité brute
export function calculateGrossYield(property: RealEstateProperty): number {
  if (!property.is_rented || property.is_sold || !property.monthly_rent || property.purchase_price <= 0) {
    return 0;
  }
  
  const annualRent = property.monthly_rent * 12;
  return (annualRent / property.purchase_price) * 100;
}
