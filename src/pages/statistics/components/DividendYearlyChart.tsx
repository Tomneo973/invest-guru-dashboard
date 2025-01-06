import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer, LabelList } from "recharts";

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

  // Préparer les données pour le graphique annuel
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

  // Obtenir la liste unique des devises pour la légende
  const currencies = Object.keys(colors);

  return (
    <div className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={yearlyChartData}>
          <XAxis dataKey="year" />
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
                formatter={(value: number) => value.toFixed(2)}
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
  );
}