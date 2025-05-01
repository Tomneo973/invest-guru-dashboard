
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { RealEstateProperty } from "../types";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { format, addMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface RentalIncomeScheduleProps {
  property: RealEstateProperty;
}

interface RentalRow {
  date: Date;
  monthlyRent: number;
  cumulativeRent: number;
  cashFlow: number;
  cumulativeCashFlow: number;
}

export function RentalIncomeSchedule({ property }: RentalIncomeScheduleProps) {
  const [displayMonths, setDisplayMonths] = useState(12);
  
  if (!property.is_rented || !property.monthly_rent) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan des revenus locatifs</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Le bien n'est pas en location ou le loyer n'est pas défini.</p>
        </CardContent>
      </Card>
    );
  }
  
  const generateRentalSchedule = (): RentalRow[] => {
    const startDate = new Date();
    const monthlyRent = property.monthly_rent;
    const monthlyPayment = property.monthly_payment || 0;
    
    const schedule: RentalRow[] = [];
    let cumulativeRent = property.total_rents_collected || 0;
    let cumulativeCashFlow = (property.total_rents_collected || 0) - (property.loan_amount ? (property.loan_amount - (property.repaid_capital || 0)) : 0);
    
    for (let i = 0; i < displayMonths; i++) {
      const paymentDate = addMonths(startDate, i);
      cumulativeRent += monthlyRent;
      const cashFlow = monthlyRent - monthlyPayment;
      cumulativeCashFlow += cashFlow;
      
      schedule.push({
        date: paymentDate,
        monthlyRent,
        cumulativeRent,
        cashFlow,
        cumulativeCashFlow
      });
    }
    
    return schedule;
  };
  
  const schedule = generateRentalSchedule();
  
  // Formatter pour les montants en euros
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plan des revenus locatifs</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Afficher</span>
          <Input 
            type="number" 
            value={displayMonths} 
            onChange={(e) => setDisplayMonths(parseInt(e.target.value) || 12)}
            className="w-20" 
            min="1"
            max="120"
          />
          <span className="text-sm text-muted-foreground">mois</span>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Date</TableHead>
                <TableHead>Loyer mensuel</TableHead>
                <TableHead>Loyers cumulés</TableHead>
                <TableHead>Cash-flow</TableHead>
                <TableHead>Cash-flow cumulé</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{format(row.date, 'MMMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>{formatter.format(row.monthlyRent)}</TableCell>
                  <TableCell>{formatter.format(row.cumulativeRent)}</TableCell>
                  <TableCell className={row.cashFlow >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {formatter.format(row.cashFlow)}
                  </TableCell>
                  <TableCell className={row.cumulativeCashFlow >= 0 ? "text-green-600 font-medium" : "text-red-600 font-medium"}>
                    {formatter.format(row.cumulativeCashFlow)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
