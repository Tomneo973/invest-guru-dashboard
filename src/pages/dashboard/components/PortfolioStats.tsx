import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Database, ListFilter, Trophy, Skull } from "lucide-react";

interface PortfolioStatsProps {
  totalInvested: number;
  totalCurrentValue: number;
  totalReturn: number;
  totalReturnPercentage: number;
  numberOfPositions: number;
  top5Returns: Array<{ symbol: string; returnPercentage: number }>;
  flop5Returns: Array<{ symbol: string; returnPercentage: number }>;
}

export function PortfolioStats({
  totalInvested,
  totalCurrentValue,
  totalReturn,
  totalReturnPercentage,
  numberOfPositions,
  top5Returns,
  flop5Returns,
}: PortfolioStatsProps) {
  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Investi</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInvested.toLocaleString()} €</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Valeur Actuelle</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCurrentValue.toLocaleString()} €</div>
          </CardContent>
        </Card>
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
              {totalReturn.toLocaleString()} € ({totalReturnPercentage.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Nombre de Positions</CardTitle>
            <ListFilter className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{numberOfPositions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top 5 Retours</CardTitle>
            <Trophy className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {top5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-green-500">+{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flop 5 Retours</CardTitle>
            <Skull className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {flop5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-red-500">{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}