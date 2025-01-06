import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, startOfYear, endOfYear, startOfMonth, endOfMonth } from "date-fns";
import { fr } from "date-fns/locale";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { DatePickerWithRange } from "@/components/ui/date-range-picker";
import { addDays } from "date-fns";

type DividendData = {
  date: string;
  amount: number;
  currency: string;
  withheld_taxes: number;
};

export function DividendStats() {
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

  // Préparer les données pour le graphique annuel
  const yearlyDividends = dividends?.reduce((acc: any, dividend) => {
    const year = format(new Date(dividend.date), "yyyy");
    const netAmount = dividend.amount - dividend.withheld_taxes;

    if (!acc[year]) {
      acc[year] = {};
    }
    if (!acc[year][dividend.currency]) {
      acc[year][dividend.currency] = 0;
    }
    acc[year][dividend.currency] += netAmount;
    return acc;
  }, {});

  const yearlyChartData = Object.entries(yearlyDividends || {}).map(([year, currencies]: [string, any]) => ({
    year,
    ...currencies,
  }));

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
        acc[month] = 0;
      }
      acc[month] += netAmount;
      return acc;
    }, {});

  const monthlyChartData = Object.entries(monthlyDividends || {}).map(([month, amount]) => ({
    month,
    amount,
  }));

  // Obtenir la liste unique des devises pour la légende
  const currencies = Array.from(
    new Set(dividends?.map(d => d.currency) || [])
  );

  const colors = {
    EUR: "#4CAF50",
    USD: "#2196F3",
    GBP: "#9C27B0",
    // Ajouter d'autres devises si nécessaire
  };

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Dividendes par année et devise</CardTitle>
        </CardHeader>
        <CardContent>
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
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Dividendes par mois</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
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
                <Bar
                  dataKey="amount"
                  fill="#4CAF50"
                  name="Dividendes"
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}