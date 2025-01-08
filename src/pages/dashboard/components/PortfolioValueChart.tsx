import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subYears } from "date-fns";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export function PortfolioValueChart() {
  // Fetch transactions to get the portfolio composition history
  const { data: transactions } = useQuery({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data;
    },
  });

  // Get unique symbols and start date
  const startDate = transactions?.[0]?.date;
  const symbols = [...new Set(transactions?.map(t => t.symbol) || [])];

  // Fetch historical prices
  const { data: historicalPrices } = useQuery({
    queryKey: ["historical-prices", symbols, startDate],
    queryFn: async () => {
      if (!symbols.length || !startDate) return [];
      
      const response = await supabase.functions.invoke("get-historical-prices", {
        body: { symbols, startDate },
      });

      if (response.error) throw response.error;
      return response.data;
    },
    enabled: !!symbols.length && !!startDate,
  });

  // Calculate daily portfolio values
  const portfolioValues = React.useMemo(() => {
    if (!transactions || !historicalPrices) return [];

    const dailyHoldings = new Map();
    const sortedTransactions = [...transactions].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    // Calculate holdings for each day
    sortedTransactions.forEach(transaction => {
      const date = transaction.date;
      const prevHoldings = new Map(dailyHoldings.get(date) || new Map());
      
      const symbol = transaction.symbol;
      const prevShares = prevHoldings.get(symbol) || 0;
      const newShares = transaction.type === 'buy' 
        ? prevShares + transaction.shares 
        : prevShares - transaction.shares;
      
      prevHoldings.set(symbol, newShares);
      dailyHoldings.set(date, prevHoldings);
    });

    // Calculate portfolio value for each day
    const values = [];
    let currentHoldings = new Map();

    historicalPrices.forEach(price => {
      // Update holdings if there were transactions on this day
      if (dailyHoldings.has(price.date)) {
        currentHoldings = new Map(dailyHoldings.get(price.date));
      }

      // Calculate portfolio value for this day
      const dayPrices = historicalPrices.filter(p => p.date === price.date);
      let portfolioValue = 0;

      dayPrices.forEach(price => {
        const shares = currentHoldings.get(price.symbol) || 0;
        portfolioValue += shares * price.closing_price;
      });

      if (portfolioValue > 0) {
        values.push({
          date: price.date,
          value: portfolioValue,
        });
      }
    });

    return values;
  }, [transactions, historicalPrices]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Évolution du Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={portfolioValues}>
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(34 197 94)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3"
                vertical={false}
                stroke="#374151"
              />
              <XAxis
                dataKey="date"
                tickFormatter={(value) => format(parseISO(value), "dd MMM", { locale: fr })}
                stroke="#6B7280"
              />
              <YAxis
                tickFormatter={(value) => `${value.toLocaleString()} €`}
                stroke="#6B7280"
              />
              <Tooltip
                content={({ active, payload, label }) => {
                  if (!active || !payload || !payload.length) return null;
                  return (
                    <div className="bg-white p-4 border rounded-lg shadow-lg">
                      <p className="text-sm text-gray-600">
                        {format(parseISO(label), "dd MMM yyyy", { locale: fr })}
                      </p>
                      <p className="text-lg font-semibold text-green-500">
                        {Number(payload[0].value).toLocaleString()} €
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="value"
                stroke="rgb(34 197 94)"
                fillOpacity={1}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}