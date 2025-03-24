
import { useMemo } from "react";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HistoricalPrice } from "@/services/stockAnalysis";
import { useIsMobile } from "@/hooks/use-mobile";

interface StockPriceChartProps {
  data: HistoricalPrice[];
  symbol: string;
  currency: string;
}

interface TooltipProps {
  active?: boolean;
  payload?: any[];
  label?: string;
}

const CustomTooltip = ({ active, payload, label }: TooltipProps) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-sm">
        <p className="font-medium">{format(parseISO(label), "dd MMM yyyy", { locale: fr })}</p>
        <p className="text-sm text-blue-600">
          <span className="font-medium">Prix: </span>
          {Number(payload[0].value).toFixed(2)}
        </p>
      </div>
    );
  }
  return null;
};

export function StockPriceChart({ data, symbol, currency }: StockPriceChartProps) {
  const isMobile = useIsMobile();
  const chartData = useMemo(() => {
    return data.map(item => ({
      date: item.date,
      price: item.close,
    }));
  }, [data]);

  if (chartData.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Historique des prix - {symbol}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[300px] md:h-[400px] flex items-center justify-center">
            Aucune donnée disponible
          </div>
        </CardContent>
      </Card>
    );
  }

  // Si on est sur mobile, on prend moins de points de données pour éviter la surcharge
  const displayData = isMobile && chartData.length > 30 
    ? chartData.filter((_, index) => index % 3 === 0) 
    : chartData;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base sm:text-lg">Historique des prix - {symbol}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px] md:h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={displayData} margin={{ top: 5, right: 5, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.1} />
              <XAxis
                dataKey="date"
                tickFormatter={(value) =>
                  format(parseISO(value), isMobile ? "MMM" : "MMM yyyy", { locale: fr })
                }
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
                tickCount={isMobile ? 4 : undefined}
              />
              <YAxis
                tickFormatter={(value) => `${value.toFixed(0)}`}
                stroke="#6B7280"
                tick={{ fill: '#6B7280' }}
                axisLine={{ stroke: '#374151', opacity: 0.2 }}
                domain={['auto', 'auto']}
                tickCount={5}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="price"
                stroke="#3b82f6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#colorPrice)"
                name="Prix"
                isAnimationActive={true}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
