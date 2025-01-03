import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis, Tooltip } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp, TrendingDown, Database, ListFilter, Trophy, Skull } from "lucide-react";

export function PortfolioChart() {
  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_portfolio_holdings');
      if (error) throw error;
      return data || [];
    },
  });

  const { data: transactions, isLoading: isLoadingTransactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  const { data: dividends, isLoading: isLoadingDividends } = useQuery({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data || [];
    },
  });

  if (isLoading || isLoadingTransactions || isLoadingDividends) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  // Calculate portfolio statistics
  const totalInvested = holdings?.reduce((sum, holding) => sum + holding.total_invested, 0) || 0;
  const totalCurrentValue = holdings?.reduce((sum, holding) => sum + holding.current_value, 0) || 0;
  const totalReturn = totalCurrentValue - totalInvested;
  const totalReturnPercentage = (totalReturn / totalInvested) * 100;
  const numberOfPositions = holdings?.length || 0;

  // Calculate returns for each position
  const positionReturns = holdings?.map(holding => ({
    symbol: holding.symbol,
    returnPercentage: ((holding.current_value - holding.total_invested) / holding.total_invested) * 100
  })) || [];

  // Get top and flop 5
  const top5Returns = [...positionReturns]
    .sort((a, b) => b.returnPercentage - a.returnPercentage)
    .slice(0, 5);

  const flop5Returns = [...positionReturns]
    .sort((a, b) => a.returnPercentage - b.returnPercentage)
    .slice(0, 5);

  // Aggregate transactions by date and calculate cumulative portfolio value
  const portfolioData = transactions?.reduce((acc: any[], transaction) => {
    const date = transaction.date;
    const existingEntry = acc.find(entry => entry.date === date);
    
    if (existingEntry) {
      const transactionValue = transaction.type === "buy" 
        ? transaction.shares * transaction.price
        : -(transaction.shares * transaction.price);
      existingEntry.value += transactionValue;
    } else {
      const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
      const transactionValue = transaction.type === "buy" 
        ? transaction.shares * transaction.price
        : -(transaction.shares * transaction.price);
      
      acc.push({
        date,
        value: lastValue + transactionValue,
        dividends: 0,
      });
    }
    return acc;
  }, []);

  // Add dividend data
  dividends?.forEach(dividend => {
    const existingEntry = portfolioData.find(entry => entry.date === dividend.date);
    if (existingEntry) {
      existingEntry.dividends = (existingEntry.dividends || 0) + dividend.amount;
    } else {
      const lastValue = portfolioData.length > 0 ? portfolioData[portfolioData.length - 1].value : 0;
      portfolioData.push({
        date: dividend.date,
        value: lastValue,
        dividends: dividend.amount,
      });
    }
  });

  // Sort data by date
  portfolioData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full space-y-4">
      {/* Statistics Grid */}
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
              <TrendingUp className="h-4 w-4 text-success" />
            ) : (
              <TrendingDown className="h-4 w-4 text-danger" />
            )}
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${totalReturn > 0 ? "text-success" : "text-danger"}`}>
              {totalReturn.toLocaleString()} € ({totalReturnPercentage.toFixed(2)}%)
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Second Row */}
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
            <Trophy className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {top5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-success">+{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Flop 5 Retours</CardTitle>
            <Skull className="h-4 w-4 text-danger" />
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {flop5Returns.map(({ symbol, returnPercentage }) => (
                <div key={symbol} className="flex justify-between text-sm">
                  <span>{symbol}</span>
                  <span className="text-danger">{returnPercentage.toFixed(2)}%</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Chart */}
      <Card className="p-4">
        <CardHeader>
          <CardTitle>Évolution du Portfolio et des Dividendes</CardTitle>
        </CardHeader>
        <CardContent>
          <ChartContainer
            config={{
              portfolio: {
                label: "Valeur du Portfolio",
                theme: {
                  light: "rgb(34 197 94)",
                  dark: "rgb(34 197 94)",
                },
              },
              dividends: {
                label: "Dividendes",
                theme: {
                  light: "rgb(59 130 246)",
                  dark: "rgb(59 130 246)",
                },
              },
            }}
            className="h-[300px]"
          >
            <AreaChart data={portfolioData}>
              <defs>
                <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="dividendsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity={0.3} />
                  <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis
                dataKey="date"
                type="category"
                tickFormatter={(value) => format(new Date(value), "dd MMM")}
              />
              <YAxis />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-4 border rounded-lg shadow-lg">
                        <p className="text-sm text-gray-600">
                          {format(parseISO(label), "dd MMM yyyy")}
                        </p>
                        <p className="text-lg font-semibold text-green-500">
                          Portfolio: {payload[0].value.toLocaleString()} €
                        </p>
                        {payload[1]?.value > 0 && (
                          <p className="text-lg font-semibold text-blue-500">
                            Dividendes: {payload[1].value.toLocaleString()} €
                          </p>
                        )}
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                name="portfolio"
                stroke="rgb(34 197 94)"
                fill="url(#portfolioGradient)"
                stackId="1"
              />
              <Area
                type="monotone"
                dataKey="dividends"
                name="dividends"
                stroke="rgb(59 130 246)"
                fill="url(#dividendsGradient)"
                stackId="2"
              />
            </AreaChart>
          </ChartContainer>
        </CardContent>
      </Card>
    </div>
  );
}