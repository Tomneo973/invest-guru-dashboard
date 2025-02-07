import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

type Holding = {
  symbol: string;
  shares: number;
  total_invested: number;
  current_value: number;
};

type StockTreemapChartProps = {
  holdings: Holding[];
};

type TreemapData = {
  name: string;
  size: number;
  value: number;
  shares: number;
  gainLoss: number;
  gainLossPercentage: number;
  portfolioPercentage: number;
  averagePurchasePrice: number;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(value);
};

const calculatePerformanceColor = (gainLoss: number, gainLossPercentage: number): string => {
  // Normalize based on 50% gain/loss for more intense colors
  const intensity = Math.min(Math.abs(gainLossPercentage) / 50, 1);
  
  if (gainLoss > 0) {
    // Green gradient for gains
    const g = Math.floor(200 + (255 - 200) * intensity);
    return `rgb(34, ${g}, 94, 0.9)`;
  } else {
    // Red gradient for losses
    const r = Math.floor(220 + (255 - 220) * intensity);
    return `rgb(${r}, 56, 76, 0.9)`;
  }
};

const CustomTreemapContent = ({ x, y, width, height, name, gainLoss, gainLossPercentage, portfolioPercentage }: any) => {
  if (!width || !height || width < 0 || height < 0) return null;

  const bgColor = calculatePerformanceColor(gainLoss, gainLossPercentage);
  const textColor = 'rgb(255, 255, 255)';

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        fill={bgColor}
        stroke="rgba(255, 255, 255, 0.5)"
        strokeWidth={2}
      />
      {width > 50 && height > 50 && (
        <>
          <text
            x={x + width / 2}
            y={y + height / 2 - 12}
            textAnchor="middle"
            fill={textColor}
            fontSize={14}
            fontWeight="normal"
          >
            {name}
          </text>
          <text
            x={x + width / 2}
            y={y + height / 2 + 12}
            textAnchor="middle"
            fill={textColor}
            fontSize={12}
            fontWeight="normal"
          >
            {`${portfolioPercentage.toFixed(1)}% (${gainLoss >= 0 ? '+' : ''}${gainLossPercentage.toFixed(1)}%)`}
          </text>
        </>
      )}
    </g>
  );
};

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload || !payload[0]) return null;

  const data = payload[0].payload;
  
  return (
    <div className="bg-white/95 p-3 rounded-lg shadow-lg border border-gray-200">
      <p className="font-semibold mb-2">{data.name}</p>
      <div className="space-y-1 text-sm">
        <p>Valeur totale: {formatCurrency(data.value)}</p>
        <p className={data.gainLoss >= 0 ? "text-green-600" : "text-red-600"}>
          Plus/Moins value: {formatCurrency(data.gainLoss)} ({data.gainLoss >= 0 ? '+' : ''}
          {data.gainLossPercentage.toFixed(2)}%)
        </p>
        <p>Part du portfolio: {data.portfolioPercentage.toFixed(1)}%</p>
        <p>PRU: {data.averagePurchasePrice.toFixed(2)} €</p>
        <p>Quantité: {data.shares}</p>
      </div>
    </div>
  );
};

export function StockTreemapChart({ holdings }: StockTreemapChartProps) {
  const totalPortfolioValue = holdings.reduce((sum, holding) => sum + holding.current_value, 0);

  const data: TreemapData[] = holdings
    .map((holding) => {
      const gainLoss = holding.current_value - holding.total_invested;
      const gainLossPercentage = (gainLoss / holding.total_invested) * 100;
      const portfolioPercentage = (holding.current_value / totalPortfolioValue) * 100;
      const averagePurchasePrice = holding.shares > 0 ? holding.total_invested / holding.shares : 0;

      return {
        name: holding.symbol,
        size: holding.current_value,
        value: holding.current_value,
        shares: holding.shares,
        gainLoss,
        gainLossPercentage,
        portfolioPercentage,
        averagePurchasePrice,
      };
    })
    .sort((a, b) => b.value - a.value);

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="size"
        stroke="#fff"
        content={<CustomTreemapContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}