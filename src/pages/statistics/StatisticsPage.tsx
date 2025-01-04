import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyDistributionChart } from "./components/CurrencyDistributionChart";
import { SectorDistributionChart } from "./components/SectorDistributionChart";
import { StockDistributionChart } from "./components/StockDistributionChart";

export default function StatisticsPage() {
  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_portfolio_holdings');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par devise</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrencyDistributionChart holdings={holdings} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition par secteur</CardTitle>
          </CardHeader>
          <CardContent>
            <SectorDistributionChart holdings={holdings} />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Répartition par action</CardTitle>
          </CardHeader>
          <CardContent>
            <StockDistributionChart holdings={holdings} />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}