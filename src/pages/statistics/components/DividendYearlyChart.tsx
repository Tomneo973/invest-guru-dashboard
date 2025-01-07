import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";

type DividendData = {
  date: string;
  amount: number;
  currency: string;
  withheld_taxes: number;
};

const colors = {
  EUR: "#4CAF50",
  USD: "#2196F3",
  CHF: "#FF9800",
};

export function DividendYearlyChart() {
  const { data: dividends } = useQuery({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as DividendData[];
    },
  });

  const yearlyDividends = dividends?.reduce((acc: any, dividend) => {
    const year = new Date(dividend.date).getFullYear().toString();
    const netAmount = dividend.amount - dividend.withheld_taxes;

    if (!acc[year]) {
      acc[year] = { year, total: 0 };
      Object.keys(colors).forEach(currency => {
        acc[year][currency] = 0;
      });
    }
    acc[year][dividend.currency] += netAmount;
    acc[year].total += netAmount;
    return acc;
  }, {});

  const yearlyChartData = Object.values(yearlyDividends || {});
  const currencies = Array.from(new Set(dividends?.map(d => d.currency) || []));

  // Calculer la valeur maximale pour les graduations
  const maxValue = Math.max(...(yearlyChartData as any[]).map(d => d.total));
  const gridStep = maxValue / 10; // Une ligne tous les 10%
  const majorGridStep = maxValue / 4; // Une ligne plus épaisse tous les 25%

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyChartData}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            vertical={false}
            stroke="#e0e0e0"
            strokeWidth={1}
            className="[&>line]:stroke-[0.5] [&>line[stroke-width='2']]:stroke-1"
          />
          <XAxis 
            dataKey="year"
            axisLine={{ stroke: '#666' }}
            tickLine={{ stroke: '#666' }}
          />
          <YAxis 
            axisLine={{ stroke: '#666' }}
            tickLine={{ stroke: '#666' }}
            ticks={Array.from({ length: 11 }, (_, i) => i * gridStep)}
            tickFormatter={(value) => value.toFixed(2)}
          />
          <Tooltip 
            formatter={(value: number, name: string) => {
              if (name === "total") return null;
              return [`${value.toFixed(2)}`, `Dividendes (${name})`];
            }}
          />
          <Legend />
          {currencies.map((currency) => (
            <Bar
              key={currency}
              dataKey={currency}
              stackId="a"
              fill={colors[currency as keyof typeof colors]}
              name={`Dividendes (${currency})`}
            />
          ))}
          <Bar
            dataKey="total"
            stackId="b"
            fill="none"
            legendType="none"
          >
            <LabelList
              dataKey="total"
              position="top"
              formatter={(value: number) => value.toFixed(2)}
              style={{ fontWeight: 'bold' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}