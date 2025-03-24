
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatisticsCardsProps {
  userCount: number;
  premiumCount: number;
}

export function StatisticsCards({ userCount, premiumCount }: StatisticsCardsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{userCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{premiumCount}</div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {userCount > 0 ? `${((premiumCount / userCount) * 100).toFixed(1)}%` : "0%"}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
