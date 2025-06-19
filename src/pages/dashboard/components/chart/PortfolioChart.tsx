
import React from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import { PortfolioChartTooltip } from "../PortfolioChartTooltip";

interface PortfolioChartProps {
  data: any[];
  showPortfolioValue: boolean;
  showInvestedValue: boolean;
  showDividends: boolean;
}

export function PortfolioChart({ 
  data, 
  showPortfolioValue, 
  showInvestedValue, 
  showDividends 
}: PortfolioChartProps) {
  // Calculer la valeur maximale pour l'échelle Y en fonction des courbes sélectionnées
  const getMaxValue = () => {
    let maxValue = 0;
    
    data.forEach(item => {
      if (showPortfolioValue && item.portfolioValue > maxValue) {
        maxValue = item.portfolioValue;
      }
      if (showInvestedValue && item.investedValue > maxValue) {
        maxValue = item.investedValue;
      }
      if (showDividends && item.cumulativeDividends > maxValue) {
        maxValue = item.cumulativeDividends;
      }
    });
    
    return maxValue;
  };

  const maxValue = getMaxValue();
  const yAxisDomain = maxValue > 0 ? [0, Math.ceil(maxValue * 1.1)] : [0, 'auto'];

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data}>
        <defs>
          <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#eab308" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#eab308" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
        <XAxis
          dataKey="date"
          tickFormatter={(value) =>
            format(parseISO(value), "dd MMM", { locale: fr })
          }
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
        />
        <YAxis
          domain={yAxisDomain}
          tickFormatter={(value) => `${(value / 1000).toFixed(0)}k €`}
          stroke="#6B7280"
          tick={{ fill: '#6B7280' }}
          axisLine={{ stroke: '#374151', opacity: 0.2 }}
        />
        <Tooltip content={<PortfolioChartTooltip />} />
        
        {showInvestedValue && (
          <Area
            type="monotone"
            dataKey="investedValue"
            stroke="#22c55e"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInvested)"
            name="Montant investi"
            isAnimationActive={false}
          />
        )}
        
        {showPortfolioValue && (
          <Area
            type="monotone"
            dataKey="portfolioValue"
            stroke="#3b82f6"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorPortfolio)"
            name="Valeur du portfolio"
            isAnimationActive={false}
          />
        )}
        
        {showDividends && (
          <Area
            type="monotone"
            dataKey="cumulativeDividends"
            stroke="#eab308"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorDividends)"
            name="Dividendes cumulés"
            isAnimationActive={false}
          />
        )}
      </AreaChart>
    </ResponsiveContainer>
  );
}
