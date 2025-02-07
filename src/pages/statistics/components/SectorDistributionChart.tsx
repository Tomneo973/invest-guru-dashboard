import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

type Holding = {
  symbol: string;
  shares: number;
  current_value: number;
  sector: string;
};

type SectorDistributionChartProps = {
  holdings: Holding[];
};

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6'];

export function SectorDistributionChart({ holdings }: SectorDistributionChartProps) {
  const sectorData = holdings
    .reduce((acc, holding) => {
      const existingSector = acc.find(item => item.name === holding.sector);
      if (existingSector) {
        existingSector.value += holding.current_value;
      } else {
        acc.push({
          name: holding.sector,
          value: holding.current_value
        });
      }
      return acc;
    }, [] as { name: string; value: number }[])
    .sort((a, b) => b.value - a.value);

  const total = sectorData.reduce((sum, item) => sum + item.value, 0);

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={sectorData}
          cx="50%"
          cy="50%"
          labelLine={false}
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          outerRadius={100}
          fill="#8884d8"
          dataKey="value"
        >
          {sectorData.map((_, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[index % COLORS.length]} 
              stroke="rgba(255, 255, 255, 0.5)"
              strokeWidth={2}
            />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number) => [
            `${((value / total) * 100).toFixed(1)}% (${value.toLocaleString()})`,
            "Valeur"
          ]}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            borderRadius: '8px',
            border: 'none',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)'
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}