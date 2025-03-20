
import React, { useState, useEffect } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';
import { useTheme } from 'next-themes';

interface PortfolioValue {
  date: string;
  value: number;
}

interface PortfolioValueChartProps {
  data: PortfolioValue[];
}

const formatAxisTick = (tick: string | number, index: number): string => {
  if (typeof tick === 'string') {
    const date = new Date(tick);
    return date.toLocaleDateString(undefined, { month: 'short', year: 'numeric' });
  }
  return String(tick);
};

export function PortfolioValueChart({ data }: PortfolioValueChartProps) {
  const [mounted, setMounted] = useState(false);
  const { theme } = useTheme();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const isDarkTheme = theme === 'dark';

  const textColor = isDarkTheme ? '#fff' : '#000';
  const gridColor = isDarkTheme ? '#444' : '#ccc';

  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid stroke={gridColor} strokeDasharray="3 3" />
        <XAxis 
          dataKey="date" 
          tickFormatter={formatAxisTick}
          style={{ fill: textColor }}
          interval="preserveStartEnd"
        />
        <YAxis style={{ fill: textColor }} />
        <Tooltip 
          contentStyle={{ backgroundColor: isDarkTheme ? '#333' : '#fff', color: textColor }}
          itemStyle={{ color: textColor }}
        />
        <Legend wrapperStyle={{ color: textColor }} />
        <Line type="monotone" dataKey="value" stroke={isDarkTheme ? '#9c27b0' : '#673ab7'} strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  );
}
