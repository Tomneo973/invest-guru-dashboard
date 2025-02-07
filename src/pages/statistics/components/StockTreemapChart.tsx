import { ResponsiveContainer, Treemap } from "recharts";

type Holding = {
  symbol: string;
  shares: number;
  current_value: number;
};

type StockTreemapChartProps = {
  holdings: Holding[];
};

export function StockTreemapChart({ holdings }: StockTreemapChartProps) {
  const data = holdings.map((holding) => ({
    name: holding.symbol,
    size: holding.current_value,
    value: holding.current_value,
    percentChange: ((holding.current_value - holding.current_value) / holding.current_value * 100).toFixed(2)
  }));

  const CustomizedContent = (props: any) => {
    const { root, depth, x, y, width, height, name, value, percentChange } = props;

    const percentage = ((value / root.value) * 100).toFixed(1);
    const isGain = Number(percentChange) >= 0;
    const bgColor = isGain ? 'rgb(134, 239, 172, 0.8)' : 'rgb(252, 165, 165, 0.8)';
    const textColor = 'rgb(17, 24, 39)';

    return (
      <g>
        <rect
          x={x}
          y={y}
          width={width}
          height={height}
          fill={bgColor}
          stroke="#fff"
          strokeWidth={2}
        />
        {width > 50 && height > 50 && (
          <>
            <text
              x={x + width / 2}
              y={y + height / 2 - 12}
              textAnchor="middle"
              fill={textColor}
              fontSize={16}
              fontWeight="bold"
            >
              {name}
            </text>
            <text
              x={x + width / 2}
              y={y + height / 2 + 12}
              textAnchor="middle"
              fill={textColor}
              fontSize={14}
            >
              {`${percentage}%`}
            </text>
          </>
        )}
      </g>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={400}>
      <Treemap
        data={data}
        dataKey="size"
        stroke="#fff"
        fill="#8884d8"
        content={<CustomizedContent />}
      />
    </ResponsiveContainer>
  );
}