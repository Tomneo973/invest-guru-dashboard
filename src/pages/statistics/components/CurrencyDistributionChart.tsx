import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Holding = {
  symbol: string;
  shares: number;
  current_value: number;
  currency: string;
};

type CurrencyDistributionChartProps = {
  holdings: Holding[];
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function CurrencyDistributionChart({ holdings }: CurrencyDistributionChartProps) {
  const currencyData = holdings.reduce((acc, holding) => {
    const existingCurrency = acc.find(item => item.name === holding.currency);
    if (existingCurrency) {
      existingCurrency.value += holding.current_value;
    } else {
      acc.push({
        name: holding.currency,
        value: holding.current_value
      });
    }
    return acc;
  }, [] as { name: string; value: number }[]);

  const total = currencyData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={currencyData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {currencyData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${((value / total) * 100).toFixed(1)}% (${value.toLocaleString()})`,
            "Valeur"
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}