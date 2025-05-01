
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
}: StatsProps) {
  // Formatter pour les montants en euros
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  const monthlyRevenue = totalMonthlyRent;

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
          <div className={`text-2xl font-bold ${monthlyRevenue - monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatter.format(monthlyRevenue - monthlyExpenses)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {formatter.format(monthlyRevenue)} revenus / {formatter.format(monthlyExpenses)} charges
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
            Plus-value réalisée
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${totalCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatter.format(totalCapitalGain)}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {totalSold} bien{totalSold > 1 ? "s" : ""} vendu{totalSold > 1 ? "s" : ""}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
