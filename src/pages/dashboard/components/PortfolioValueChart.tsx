import { format, parseISO } from "date-fns";
import {
  ChartContainer,
  ChartTooltip,
} from "@/components/ui/chart";
import { Area, AreaChart, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ChartDataPoint {
  date: string;
  portfolioValue: number | null;
  cumulativeDividends: number | null;
}

interface PortfolioValueChartProps {
  portfolioData: ChartDataPoint[];
}

export function PortfolioValueChart({ portfolioData }: PortfolioValueChartProps) {
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Évolution du Portfolio et des Dividendes</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={{
            portfolio: {
              label: "Valeur du Portfolio",
              theme: {
                light: "rgb(34 197 94)",
                dark: "rgb(34 197 94)",
              },
            },
            dividends: {
              label: "Dividendes Cumulés",
              theme: {
                light: "rgb(59 130 246)",
                dark: "rgb(59 130 246)",
              },
            },
          }}
          className="h-[300px] w-full"
        >
          <AreaChart data={portfolioData} width={800} height={300}>
            <defs>
              <linearGradient id="portfolioGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(34 197 94)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="dividendsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="rgb(59 130 246)" stopOpacity={0.3} />
                <stop offset="100%" stopColor="rgb(59 130 246)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              type="category"
              tickFormatter={(value) => format(new Date(value), "dd MMM")}
            />
            <YAxis />
            <ChartTooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg">
                      <p className="text-sm text-gray-600">
                        {format(parseISO(label), "dd MMM yyyy")}
                      </p>
                      {payload[0]?.value !== null && (
                        <p className="text-lg font-semibold text-green-500">
                          Portfolio: {Number(payload[0].value).toLocaleString()} €
                        </p>
                      )}
                      {payload[1]?.value !== null && (
                        <p className="text-lg font-semibold text-blue-500">
                          Dividendes cumulés: {Number(payload[1].value).toLocaleString()} €
                        </p>
                      )}
                    </div>
                  );
                }
                return null;
              }}
            />
            <Area
              type="stepAfter"
              dataKey="portfolioValue"
              name="portfolio"
              stroke="rgb(34 197 94)"
              fill="url(#portfolioGradient)"
              connectNulls
            />
            <Area
              type="stepAfter"
              dataKey="cumulativeDividends"
              name="dividends"
              stroke="rgb(59 130 246)"
              fill="url(#dividendsGradient)"
              connectNulls
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}