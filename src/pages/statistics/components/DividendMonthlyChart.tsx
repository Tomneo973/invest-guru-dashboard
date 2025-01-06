import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";

type DividendData = {
  date: string;
  amount: number;
  currency: string;
  withheld_taxes: number;
};

const colors = {
  EUR: "#4CAF50",
  USD: "#2196F3",
  GBP: "#9C27B0",
};

export function DividendMonthlyChart() {
  const [dateRange, setDateRange] = useState({
    from: startOfYear(new Date()),
    to: endOfYear(new Date()),
  });

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

  // Préparer les données pour le graphique mensuel
  const monthlyDividends = dividends
    ?.filter(dividend => {
      const dividendDate = new Date(dividend.date);
      return (
        (!dateRange.from || dividendDate >= dateRange.from) &&
        (!dateRange.to || dividendDate <= dateRange.to)
      );
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

  // Obtenir la liste unique des devises pour la légende
  const currencies = Object.keys(colors);

  return (
    <div className="space-y-4">
      <div>
        <DatePickerWithRange
          date={{
            from: dateRange.from,
            to: dateRange.to,
          }}
          onSelect={(range) => {
            if (range?.from) {
              setDateRange({
                from: startOfMonth(range.from),
                to: range.to ? endOfMonth(range.to) : endOfMonth(range.from),
              });
            }
          }}
        />
      </div>
      <div className="h-[400px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={monthlyChartData}>
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            {currencies.map((currency) => (
              <Bar
                key={currency}
                dataKey={currency}
                stackId="a"
                fill={colors[currency as keyof typeof colors]}
                name={`Dividendes (${currency})`}
              >
                <LabelList
                  dataKey={currency}
                  position="top"
                  formatter={(value: number) => value > 0 ? value.toFixed(2) : ''}
                />
              </Bar>
            ))}
            {/* Ajout d'une barre invisible pour afficher le total */}
            <Bar
              dataKey="total"
              stackId="b"
              fill="none"
              legendType="none"
            >
              <LabelList
                dataKey="total"
                position="top"
                formatter={(value: number) => `Total: ${value.toFixed(2)}`}
                style={{ fontWeight: 'bold' }}
              />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}