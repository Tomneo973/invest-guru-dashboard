
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealEstateProperty } from "../../types";

interface StatsProps {
  totalProperties: number;
  totalInvested: number;
  totalRented: number;
  totalSold: number;
  totalMonthlyRent: number;
  monthlyExpenses: number;
  totalRentsCollected: number;
  totalCapitalGain: number;
  totalTaxes?: number;
  monthlyTaxes?: number;
}

export function RealEstateStats({
  totalProperties,
  totalInvested,
  totalRented,
  totalSold,
  totalMonthlyRent,
  monthlyExpenses,
  totalRentsCollected,
  totalCapitalGain,
  totalTaxes = 0,
  monthlyTaxes = 0,
}: StatsProps) {
  // Formatter pour les montants en euros
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  const monthlyRevenue = totalMonthlyRent;
  // Les charges mensuelles incluent maintenant les taxes mensuelles
  const totalMonthlyExpenses = monthlyExpenses + monthlyTaxes;
  // Cash-flow total incluant les impôts
  const netCashFlow = monthlyRevenue - totalMonthlyExpenses;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Patrimoine total
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatter.format(totalInvested)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalProperties} bien{totalProperties > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Cash-flow mensuel
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatter.format(netCashFlow)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatter.format(monthlyRevenue)} revenus / {formatter.format(totalMonthlyExpenses)} charges
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Total loyers perçus
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{formatter.format(totalRentsCollected)}</div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalRented} bien{totalRented > 1 ? "s" : ""} en location
          </p>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            Charges fiscales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">{formatter.format(totalTaxes)}/an</div>
          <p className="text-xs text-muted-foreground mt-1">
            soit {formatter.format(monthlyTaxes)}/mois
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
