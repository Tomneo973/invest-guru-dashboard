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

export function StockTreemapChart({ holdings }: StockTreemapChartProps) {
  const data = holdings
    .map((holding) => {
      const gainLoss = holding.current_value - holding.total_invested;
      const gainLossPercentage = ((gainLoss / holding.total_invested) * 100).toFixed(2);
      const portfolioPercentage = ((holding.current_value / holdings.reduce((sum, h) => sum + h.current_value, 0)) * 100).toFixed(2);
      const averagePurchasePrice = (holding.total_invested / holding.shares).toFixed(2);

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

  const getColor = (gainLoss: number, gainLossPercentage: number) => {
    const intensity = Math.min(Math.abs(Number(gainLossPercentage)) / 20, 1); // Normalize based on 20% gain/loss
    if (gainLoss > 0) {
      // Vert pour les gains
      const g = Math.floor(197 + (255 - 197) * intensity);
      return `rgb(34, ${g}, 94, 0.9)`;
    } else {
      // Rouge pour les pertes
      const r = Math.floor(234 + (255 - 234) * intensity);
      return `rgb(${r}, 56, 76, 0.9)`;
    }
  };

  const CustomizedContent = (props: any) => {
    const { root, x, y, width, height, name, gainLoss, gainLossPercentage, portfolioPercentage } = props;

    const bgColor = getColor(gainLoss, gainLossPercentage);
    const textColor = 'rgb(255, 255, 255)';
    const strokeColor = 'rgba(255, 255, 255, 0.5)';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={bgColor}
          stroke={strokeColor}
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
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill={textColor}
              fontSize={12}
            >
              {`${portfolioPercentage}% (${gainLoss >= 0 ? '+' : ''}${gainLossPercentage}%)`}
            </text>
          </>
        )}
      </g>
    );
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (!active || !payload || !payload[0]) return null;

    const data = payload[0].payload;
    const formattedValue = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(data.value);

    const formattedGainLoss = new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(data.gainLoss);

    return (
      <div className="bg-white/95 p-3 rounded-lg shadow-lg border border-gray-200">
        <p className="font-semibold mb-2">{data.name}</p>
        <div className="space-y-1 text-sm">
          <p>Valeur totale: {formattedValue}</p>
          <p className={data.gainLoss >= 0 ? "text-success" : "text-danger"}>
            Plus/Moins value: {formattedGainLoss} ({data.gainLoss >= 0 ? '+' : ''}{data.gainLossPercentage}%)
          </p>
          <p>Part du portfolio: {data.portfolioPercentage}%</p>
          <p>PRU: {data.averagePurchasePrice} €</p>
          <p>Quantité: {data.shares}</p>
        </div>
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="size"
        stroke="#fff"
        content={<CustomizedContent />}
      >
        <Tooltip content={<CustomTooltip />} />
      </Treemap>
    </ResponsiveContainer>
  );
}