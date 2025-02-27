
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

interface ReturnCardProps {
  totalReturn: number;
  totalReturnPercentage: number;
  currency: string;
}

export function ReturnCard({ totalReturn, totalReturnPercentage, currency }: ReturnCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Retour Total</CardTitle>
        {totalReturn > 0 ? (
          <TrendingUp className="h-4 w-4 text-green-500" />
        ) : (
          <TrendingDown className="h-4 w-4 text-red-500" />
        )}
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${totalReturn > 0 ? "text-green-500" : "text-red-500"}`}>
          {totalReturn.toLocaleString()} {currency} ({totalReturnPercentage.toFixed(2)}%)
        </div>
      </CardContent>
    </Card>
  );
}
