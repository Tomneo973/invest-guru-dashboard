
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
  Area,
  AreaChart,
  ReferenceLine,
} from 'recharts';
import { useTheme } from 'next-themes';

interface PortfolioValue {
  date: string;
  value: number;
}

interface PortfolioValueChartProps {
  data: PortfolioValue[];
}

const formatAxisTick = (tick: string | number): string => {
  if (typeof tick === 'string') {
    const date = new Date(tick);
    return date.toLocaleDateString(undefined, { month: 'short', day: '2-digit' });
  }
  return String(tick);
};

// Modified to explicitly return a string
const formatYAxisTick = (value: number): string => {
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M`;
  } else if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}k`;
  }
  return value.toString(); // Explicitly convert to string
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

  // Modern color palette
  const textColor = isDarkTheme ? '#fff' : '#444';
  const gridColor = isDarkTheme ? '#333' : '#eaeaea';
  const areaColor = isDarkTheme ? 'rgba(138, 93, 245, 0.2)' : 'rgba(138, 93, 245, 0.1)';
  const lineColor = isDarkTheme ? '#9c27b0' : '#8a5df5';
  const backgroundFill = isDarkTheme ? '#1f1f23' : '#ffffff';
  const tooltipBackground = isDarkTheme ? '#333' : '#fff';
  const tooltipBorder = isDarkTheme ? '#444' : '#e8e8e8';

  // Calculate min and max values for the Y axis
  const values = data.map(item => item.value);
  const minValue = Math.min(...values) * 0.95;
  const maxValue = Math.max(...values) * 1.05;

  return (
    <div className="bg-white dark:bg-background rounded-xl p-4 shadow-sm border border-gray-100 dark:border-gray-800">
      <h3 className="text-lg font-medium mb-4 text-left pl-4">Évolution du portefeuille</h3>
      <ResponsiveContainer width="100%" height={400}>
        <AreaChart 
          data={data} 
          margin={{ top: 10, right: 30, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={lineColor} stopOpacity={0.8}/>
              <stop offset="95%" stopColor={lineColor} stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid 
            stroke={gridColor} 
            strokeDasharray="3 3" 
            vertical={false} 
          />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatAxisTick}
            style={{ fontSize: '12px', fill: textColor }}
            tick={{ fill: textColor }}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            tickMargin={10}
            padding={{ left: 0, right: 0 }}
          />
          <YAxis 
            style={{ fontSize: '12px', fill: textColor }} 
            tick={{ fill: textColor }}
            tickFormatter={formatYAxisTick}
            axisLine={{ stroke: gridColor }}
            tickLine={{ stroke: gridColor }}
            tickMargin={10}
            domain={[minValue, maxValue]}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: tooltipBackground, 
              border: `1px solid ${tooltipBorder}`,
              borderRadius: '8px',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              fontSize: '12px',
              color: textColor,
              padding: '10px'
            }}
            labelStyle={{ color: textColor, fontWeight: 'bold', marginBottom: '5px' }}
            formatter={(value: number) => [`${value.toLocaleString()} CHF`, 'Valeur']}
            labelFormatter={(label) => {
              const date = new Date(label);
              return date.toLocaleDateString(undefined, { 
                day: 'numeric', 
                month: 'long', 
                year: 'numeric' 
              });
            }}
          />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke={lineColor} 
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
            animationEasing="ease-in-out"
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px', color: textColor }}
            formatter={(value: string) => ['Valeur du portefeuille', '']}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
