
import React from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Card } from "@/components/ui/card";

export interface ChartDataSelectorProps {
  showPortfolioValue: boolean;
  showInvestedValue: boolean;
  showDividends: boolean;
  onTogglePortfolioValue: (checked: boolean) => void;
  onToggleInvestedValue: (checked: boolean) => void;
  onToggleDividends: (checked: boolean) => void;
}

export function ChartDataSelector({
  showPortfolioValue,
  showInvestedValue,
  showDividends,
  onTogglePortfolioValue,
  onToggleInvestedValue,
  onToggleDividends,
}: ChartDataSelectorProps) {
  return (
    <Card className="p-4 mb-4">
      <h3 className="text-sm font-medium mb-3 text-gray-700">Courbes à afficher</h3>
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center space-x-2">
          <Checkbox
            id="portfolio-value"
            checked={showPortfolioValue}
            onCheckedChange={onTogglePortfolioValue}
          />
          <label
            htmlFor="portfolio-value"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            Valeur du portfolio
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="invested-value"
            checked={showInvestedValue}
            onCheckedChange={onToggleInvestedValue}
          />
          <label
            htmlFor="invested-value"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            Montant investi
          </label>
        </div>
        
        <div className="flex items-center space-x-2">
          <Checkbox
            id="dividends"
            checked={showDividends}
            onCheckedChange={onToggleDividends}
          />
          <label
            htmlFor="dividends"
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 flex items-center gap-2"
          >
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            Dividendes cumulés
          </label>
        </div>
      </div>
    </Card>
  );
}
