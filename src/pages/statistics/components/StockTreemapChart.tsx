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
  const data = holdings
    .map((holding) => ({
      name: holding.symbol,
      size: holding.current_value,
      value: holding.current_value,
      percentChange: ((holding.current_value - holding.current_value) / holding.current_value * 100).toFixed(2)
    }))
    .sort((a, b) => b.value - a.value);

  const CustomizedContent = (props: any) => {
    const { root, x, y, width, height, name, value } = props;

    const percentage = ((value / root.value) * 100).toFixed(1);
    const bgColor = 'rgb(34, 197, 94, 0.9)';
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