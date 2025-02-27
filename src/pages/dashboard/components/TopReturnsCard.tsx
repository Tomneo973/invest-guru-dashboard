
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trophy } from "lucide-react";

interface TopReturnsCardProps {
  returns: Array<{ symbol: string; returnPercentage: number }>;
}

export function TopReturnsCard({ returns }: TopReturnsCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Top 5 Retours</CardTitle>
        <Trophy className="h-4 w-4 text-green-500" />
      </CardHeader>
      <CardContent>
        <div className="space-y-1">
          {returns.map(({ symbol, returnPercentage }) => (
            <div key={symbol} className="flex justify-between text-sm">
              <span>{symbol}</span>
              <span className="text-green-500">+{returnPercentage.toFixed(2)}%</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
