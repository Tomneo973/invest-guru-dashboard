
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PropertyPerformance, RealEstateProperty } from "../types";
import { format, addMonths, differenceInMonths } from "date-fns";
import { fr } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { ChartContainer, ChartTooltipContent } from "@/components/ui/chart";

interface PropertyPerformanceChartProps {
  property: RealEstateProperty;
}

export function PropertyPerformanceChart({ property }: PropertyPerformanceChartProps) {
  // Calculer le montant des mensualités si les données de prêt sont disponibles
  const calculateMonthlyPayment = (): number | null => {
    if (!property.loan_amount || !property.loan_rate || !property.loan_duration_months) {
      return null;
    }

    const principal = property.loan_amount;
    const monthlyRate = property.loan_rate / 100 / 12;
    const numberOfPayments = property.loan_duration_months;

    // Formule de calcul des mensualités: P * r * (1 + r)^n / ((1 + r)^n - 1)
    const monthlyPayment = principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments) / 
                           (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  };
  
  const monthlyPayment = calculateMonthlyPayment() || 0;

  // Calculer les charges mensuelles liées aux impôts
  const calculateMonthlyTaxes = (): number => {
    const propertyTax = property.property_tax || 0;
    const housingTax = property.housing_tax || 0;
    const otherTaxes = property.other_taxes || 0;
    
    // Convertir les montants annuels en montants mensuels
    return (propertyTax + housingTax + otherTaxes) / 12;
  };
  
  const monthlyTaxes = calculateMonthlyTaxes();
  
  // Générer les données de performance pour le graphique
  const generatePerformanceData = (): PropertyPerformance[] => {
    if (!property.loan_start_date) return [];
    
    const startDate = new Date(property.loan_start_date);
    const currentDate = new Date();
    const endDate = property.is_sold && property.sale_date 
      ? new Date(property.sale_date) 
      : property.loan_end_date 
        ? new Date(property.loan_end_date) 
        : currentDate;
    
    const months = differenceInMonths(endDate, startDate) + 1;
    const performanceData: PropertyPerformance[] = [];
    
    let cumulativeCashflow = 0;
    
    for (let i = 0; i < months; i++) {
      const currentMonth = addMonths(startDate, i);
      const monthlyRent = property.is_rented ? (property.monthly_rent || 0) : 0;
      // Inclure les taxes dans le calcul du cash-flow
      const cashflow = monthlyRent - monthlyPayment - monthlyTaxes;
      cumulativeCashflow += cashflow;
      
      performanceData.push({
        month: format(currentMonth, 'MMM yyyy', { locale: fr }),
        cashflow: cashflow,
        cumulativeCashflow: cumulativeCashflow
      });
    }
    
    return performanceData;
  };
  
  const performanceData = generatePerformanceData();
  
  // Formatter pour les montants en euros
  const formatEuro = (value: number) => `${value.toLocaleString('fr-FR')} €`;
  
  // Calculer la rentabilité globale
  const calculateOverallReturn = (): number => {
    const totalInvestment = property.purchase_price - (property.loan_amount || 0);
    const totalRents = property.total_rents_collected;
    const capitalGain = property.is_sold && property.sale_price 
      ? property.sale_price - property.purchase_price 
      : 0;
    
    // Déduire les impôts totaux de la rentabilité
    const monthsOwned = property.acquisition_date ? 
      differenceInMonths(
        property.sale_date ? new Date(property.sale_date) : new Date(),
        new Date(property.acquisition_date)
      ) : 0;
    
    const totalTaxesPaid = monthsOwned * monthlyTaxes;
    
    return totalRents + capitalGain - (totalInvestment - property.repaid_capital) - totalTaxesPaid;
  };
  
  const overallReturn = calculateOverallReturn();
  const returnRate = (overallReturn / property.purchase_price) * 100;
  
  return (
    <Card className="mt-6">
      <CardHeader>
        <CardTitle>Performance du bien</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Mensualité</p>
            <p className="text-2xl font-bold">{formatEuro(monthlyPayment)}</p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Taxes mensuelles</p>
            <p className="text-2xl font-bold text-red-600">
              {formatEuro(monthlyTaxes)}
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Cash-flow mensuel</p>
            <p className={`text-2xl font-bold ${(property.monthly_rent || 0) - monthlyPayment - monthlyTaxes >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatEuro((property.monthly_rent || 0) - monthlyPayment - monthlyTaxes)}
            </p>
          </div>
          
          <div className="bg-muted p-4 rounded-md">
            <p className="text-sm text-muted-foreground">Rentabilité globale</p>
            <p className={`text-2xl font-bold ${returnRate >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {returnRate.toFixed(2)}%
            </p>
          </div>
        </div>
        
        {performanceData.length > 0 && (
          <div className="h-80 mt-6">
            <ChartContainer 
              className="w-full" 
              config={{
                cashflow: { label: "Cash-flow mensuel", color: "#2563eb" },
                cumulativeCashflow: { label: "Cash-flow cumulé", color: "#10b981" }
              }}
            >
              <LineChart data={performanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis
                  tickFormatter={(value) => `${value} €`}
                />
                <Tooltip content={<ChartTooltipContent />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="cashflow"
                  name="Cash-flow mensuel"
                  stroke="var(--color-cashflow)"
                  activeDot={{ r: 8 }}
                />
                <Line
                  type="monotone"
                  dataKey="cumulativeCashflow"
                  name="Cash-flow cumulé"
                  stroke="var(--color-cumulativeCashflow)"
                />
              </LineChart>
            </ChartContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
