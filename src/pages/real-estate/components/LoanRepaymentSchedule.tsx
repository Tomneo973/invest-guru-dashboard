
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

interface LoanRepaymentScheduleProps {
  property: RealEstateProperty;
}

interface PaymentRow {
  date: Date;
  remainingPrincipal: number;
  payment: number;
  interestPayment: number;
  principalPayment: number;
}

export function LoanRepaymentSchedule({ property }: LoanRepaymentScheduleProps) {
  const [displayMonths, setDisplayMonths] = useState(12);
  
  if (!property.loan_amount || !property.loan_rate || !property.loan_duration_months || !property.loan_start_date) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Plan de remboursement du prêt</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Les informations de prêt ne sont pas complètes pour générer un échéancier.</p>
        </CardContent>
      </Card>
    );
  }
  
  const generateRepaymentSchedule = (): PaymentRow[] => {
    const startDate = new Date(property.loan_start_date as string);
    const monthlyRate = property.loan_rate / 100 / 12;
    const loanAmount = property.loan_amount;
    const duration = property.loan_duration_months;
    const monthlyPayment = property.monthly_payment || 
      (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, duration)) / 
      (Math.pow(1 + monthlyRate, duration) - 1);
    
    let remainingPrincipal = loanAmount;
    const schedule: PaymentRow[] = [];
    
    for (let i = 0; i < Math.min(duration, displayMonths); i++) {
      const paymentDate = addMonths(startDate, i);
      const interestPayment = remainingPrincipal * monthlyRate;
      const principalPayment = monthlyPayment - interestPayment;
      remainingPrincipal -= principalPayment;
      
      schedule.push({
        date: paymentDate,
        remainingPrincipal: Math.max(0, remainingPrincipal),
        payment: monthlyPayment,
        interestPayment,
        principalPayment
      });
    }
    
    return schedule;
  };
  
  const schedule = generateRepaymentSchedule();
  
  // Formatter pour les montants en euros
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });
  
  return (
    <Card className="mt-6">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Plan de remboursement du prêt</CardTitle>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">Afficher</span>
          <Input 
            type="number" 
            value={displayMonths} 
            onChange={(e) => setDisplayMonths(parseInt(e.target.value) || 12)}
            className="w-20" 
            min="1"
            max={property.loan_duration_months}
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
                <TableHead>Mensualité</TableHead>
                <TableHead>Intérêts</TableHead>
                <TableHead>Capital</TableHead>
                <TableHead>Capital restant</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {schedule.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{format(row.date, 'MMMM yyyy', { locale: fr })}</TableCell>
                  <TableCell>{formatter.format(row.payment)}</TableCell>
                  <TableCell>{formatter.format(row.interestPayment)}</TableCell>
                  <TableCell>{formatter.format(row.principalPayment)}</TableCell>
                  <TableCell>{formatter.format(row.remainingPrincipal)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
}
