
import { RealEstateProperty } from "../types";
import { useMemo } from "react";

export function usePropertyStats(properties: RealEstateProperty[] | undefined) {
  return useMemo(() => {
    if (!properties || properties.length === 0) {
      return {
        totalProperties: 0,
        totalValue: 0,
        totalRented: 0,
        totalSold: 0,
        totalInvested: 0,
        totalMonthlyRent: 0,
        totalCapitalGain: 0,
        totalRentsCollected: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
      };
    }

    const stats = properties.reduce(
      (acc, property) => {
        // Comptage par statut
        if (property.is_sold) {
          acc.totalSold += 1;
        } else {
          if (property.is_rented) acc.totalRented += 1;
        }

        // Valeurs financières
        acc.totalInvested += property.purchase_price;
        
        // Pour les biens vendus
        if (property.is_sold && property.sale_price) {
          acc.totalCapitalGain += property.sale_price - property.purchase_price;
        }
        
        // Loyers
        if (property.is_rented && property.monthly_rent) {
          acc.totalMonthlyRent += property.monthly_rent;
        }
        
        acc.totalRentsCollected += property.total_rents_collected || 0;
        
        // Mensualités
        if (!property.is_sold && property.monthly_payment) {
          acc.monthlyExpenses += property.monthly_payment;
        }

        return acc;
      },
      {
        totalProperties: properties.length,
        totalValue: 0,
        totalRented: 0,
        totalSold: 0,
        totalInvested: 0,
        totalMonthlyRent: 0,
        totalCapitalGain: 0,
        totalRentsCollected: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
      }
    );
    
    // Calcul des valeurs dérivées
    stats.monthlyRevenue = stats.totalMonthlyRent;
    stats.totalValue = stats.totalInvested - stats.totalCapitalGain;
    
    return stats;
  }, [properties]);
}
