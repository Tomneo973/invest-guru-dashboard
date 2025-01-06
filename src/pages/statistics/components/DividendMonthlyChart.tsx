import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, subYears, startOfYear, endOfYear } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, CartesianGrid, LabelList } from "recharts";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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

const periods = [
  { value: "1", label: "1 an" },
  { value: "3", label: "3 ans" },
  { value: "5", label: "5 ans" },
];

export function DividendMonthlyChart() {
  const [selectedPeriod, setSelectedPeriod] = useState("1");
  const currentDate = new Date();
  const startDate = subYears(startOfYear(currentDate), parseInt(selectedPeriod) - 1);
  const endDate = endOfYear(currentDate);

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

  const monthlyDividends = dividends
    ?.filter(dividend => {
      const dividendDate = new Date(dividend.date);
      return dividendDate >= startDate && dividendDate <= endDate;
    })
    .reduce((acc: any, dividend) => {
      const month = format(new Date(dividend.date), "MMM yyyy", { locale: fr });
      const netAmount = dividend.amount - dividend.withheld_taxes;

      if (!acc[month]) {
        acc[month] = { month, total: 0 };
        Object.keys(colors).forEach(currency => {
          acc[month][currency] = 0;
        });
      }
      acc[month][dividend.currency] += netAmount;
      acc[month].total += netAmount;
      return acc;
    }, {});

  const monthlyChartData = Object.values(monthlyDividends || {});
  const currencies = Array.from(new Set(dividends?.map(d => d.currency) || []));

  // Calculer la valeur maximale pour les graduations
  const maxValue = Math.max(...(monthlyChartData as any[]).map(d => d.total));
  const gridStep = maxValue / 50; // Une ligne tous les 2%
  const majorGridStep = maxValue / 10; // Une ligne plus épaisse tous les 10%

  return (
    <div className="space-y-4">
      <div className="w-[200px]">
        <Select
          value={selectedPeriod}
          onValueChange={setSelectedPeriod}
        >
          <SelectTrigger>
            <SelectValue placeholder="Sélectionner une période" />
          </SelectTrigger>
          <SelectContent>
            {periods.map((period) => (
              <SelectItem key={period.value} value={period.value}>
                {period.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyChartData}>
            <CartesianGrid 
              strokeDasharray="3 3" 
              vertical={false}
              stroke="#e0e0e0"
            />
            <XAxis 
              dataKey="month"
              axisLine={{ stroke: '#666' }}
              tickLine={{ stroke: '#666' }}
            />
            <YAxis 
              axisLine={{ stroke: '#666' }}
              tickLine={{ stroke: '#666' }}
              ticks={Array.from({ length: 51 }, (_, i) => i * gridStep)}
              tickFormatter={(value) => {
                if (value % majorGridStep < 0.01) {
                  return value.toFixed(2);
                }
                return '';
              }}
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
    </div>
  );
}