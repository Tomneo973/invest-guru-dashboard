
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Database } from "lucide-react";

interface InvestedCardProps {
  totalInvested: number;
  currency: string;
}

export function InvestedCard({ totalInvested, currency }: InvestedCardProps) {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Investi</CardTitle>
        <Database className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{totalInvested.toLocaleString()} {currency}</div>
      </CardContent>
    </Card>
  );
}
