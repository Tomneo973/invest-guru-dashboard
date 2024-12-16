import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Skeleton } from "@/components/ui/skeleton";

export function PortfolioChart() {
  const { data: transactions, isLoading } = useQuery({
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

  if (isLoading) {
    return <Skeleton className="w-full h-[400px] rounded-lg" />;
  }

  // Calculate portfolio value over time
  const portfolioData = transactions?.reduce((acc: any[], transaction) => {
    const lastValue = acc.length > 0 ? acc[acc.length - 1].value : 0;
    const transactionValue = 
      transaction.type === "buy" 
        ? lastValue + (transaction.shares * transaction.price)
        : lastValue - (transaction.shares * transaction.price);

    return [...acc, {
      date: transaction.date,
      value: transactionValue,
    }];
  }, []);

  const chartConfig = {
    portfolio: {
      label: "Portfolio Value",
      theme: {
        light: "rgb(34 197 94)", // green-500
        dark: "rgb(34 197 94)",
      },
    },
  };

  return (
    <div className="w-full h-[400px] bg-white rounded-lg p-4 border">
      <h2 className="text-xl font-semibold mb-4">Portfolio Evolution</h2>
      <ChartContainer config={chartConfig} className="h-[300px]">
        <AreaChart data={portfolioData}>
          <defs>
            <linearGradient id="gradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
              <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <XAxis
            dataKey="date"
            tickFormatter={(value) => format(new Date(value), "MMM dd")}
          />
          <YAxis />
          <ChartTooltip>
            <ChartTooltipContent />
          </ChartTooltip>
          <Area
            type="monotone"
            dataKey="value"
            name="portfolio"
            stroke="rgb(34 197 94)"
            fill="url(#gradient)"
          />
        </AreaChart>
      </ChartContainer>
    </div>
  );
}