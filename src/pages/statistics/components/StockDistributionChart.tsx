import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Holding = {
  symbol: string;
  shares: number;
  current_value: number;
};

type StockDistributionChartProps = {
  holdings: Holding[];
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f43f5e', '#06b6d4', '#a855f7'];

export function StockDistributionChart({ holdings }: StockDistributionChartProps) {
  const stockData = holdings.map(holding => ({
    name: holding.symbol,
    value: holding.current_value
  }));

  const total = stockData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={stockData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {stockData.map((_, index) => (
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