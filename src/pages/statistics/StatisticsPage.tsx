import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyDistributionChart } from "./components/CurrencyDistributionChart";
import { SectorDistributionChart } from "./components/SectorDistributionChart";
import { StockDistributionChart } from "./components/StockDistributionChart";

type PortfolioHolding = {
  symbol: string;
  shares: number;
  total_invested: number;
  current_value: number;
  sector: string;
  currency: string;
}

export default function StatisticsPage() {
  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_portfolio_holdings');
      if (error) throw error;
      return data as PortfolioHolding[];
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[500px]" />;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Statistiques</h1>
      </div>
      <div className="flex flex-col gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Répartition par devise</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <CurrencyDistributionChart holdings={holdings} />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <TopFlop data={holdings} type="currency" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par secteur</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <SectorDistributionChart holdings={holdings} />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <TopFlop data={holdings} type="sector" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Répartition par action</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row gap-6">
            <div className="w-full md:w-1/2">
              <StockDistributionChart holdings={holdings} />
            </div>
            <div className="w-full md:w-1/2 flex flex-col gap-6">
              <TopFlop data={holdings} type="stock" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

type TopFlopProps = {
  data: PortfolioHolding[] | undefined;
  type: 'currency' | 'sector' | 'stock';
}

function TopFlop({ data, type }: TopFlopProps) {
  if (!data?.length) return null;

  const getKey = (item: PortfolioHolding): string => {
    switch (type) {
      case 'currency':
        return item.currency;
      case 'sector':
        return item.sector;
      case 'stock':
        return item.symbol;
    }
  };

  const aggregatedData = data.reduce((acc: Record<string, number>, item) => {
    const key = getKey(item);
    if (key) {
      acc[key] = (acc[key] || 0) + item.current_value;
    }
    return acc;
  }, {});

  const total = Object.values(aggregatedData).reduce((sum, value) => sum + value, 0);
  
  const sortedData = Object.entries(aggregatedData)
    .map(([key, value]) => ({
      name: key,
      value,
      percentage: (value / total) * 100
    }))
    .sort((a, b) => b.percentage - a.percentage);

  const top3 = sortedData.slice(0, 3);
  const flop3 = sortedData.slice(-3).reverse();

  return (
    <div className="grid grid-cols-2 gap-6">
      <div>
        <h3 className="font-semibold mb-2">Top 3</h3>
        <ul className="space-y-2">
          {top3.map((item) => (
            <li key={item.name} className="flex justify-between items-center text-sm">
              <span className="font-medium truncate mr-2">{item.name}</span>
              <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Flop 3</h3>
        <ul className="space-y-2">
          {flop3.map((item) => (
            <li key={item.name} className="flex justify-between items-center text-sm">
              <span className="font-medium truncate mr-2">{item.name}</span>
              <span className="text-muted-foreground">{item.percentage.toFixed(1)}%</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}