import React from "react";
import { useQuery } from "@tanstack/react-query";
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
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

interface Transaction {
  id: string;
  user_id: string;
  type: 'buy' | 'sell';
  symbol: string;
  shares: number;
  price: number;
  date: string;
  platform: string;
  currency: string;
  sector: string;
  created_at: string;
}

interface Dividend {
  id: string;
  user_id: string;
  symbol: string;
  amount: number;
  currency: string;
  date: string;
  created_at: string;
  withheld_taxes: number;
}

interface HistoricalPrice {
  symbol: string;
  date: string;
  closing_price: number;
  currency: string;
}

interface ChartDataPoint {
  date: string;
  portfolioValue: number;
  investedValue: number;
  cumulativeDividends: number;
}

export function PortfolioValueChart() {
  // Fetch transactions
  const { data: transactions } = useQuery<Transaction[]>({
    queryKey: ["transactions"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Transaction[];
    },
  });

  // Fetch dividends
  const { data: dividends } = useQuery<Dividend[]>({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: true });

      if (error) throw error;
      return data as Dividend[];
    },
  });

  // Get unique symbols and start date
  const startDate = transactions?.[0]?.date;
  const symbols = [...new Set(transactions?.map(t => t.symbol) || [])];

  // Fetch historical prices
  const { data: historicalPrices } = useQuery<HistoricalPrice[]>({
    queryKey: ["historical-prices", symbols, startDate],
    queryFn: async () => {
      if (!symbols.length || !startDate) return [];
      
      const { data, error } = await supabase.functions.invoke("get-historical-prices", {
        body: { symbols, startDate },
      });

      if (error) throw error;
      return data as HistoricalPrice[];
    },
    enabled: !!symbols.length && !!startDate,
  });

  // Calculate chart data
  const chartData = React.useMemo(() => {
    if (!transactions || !historicalPrices || !dividends) return [];

    const dateMap = new Map<string, ChartDataPoint>();
    let currentHoldings = new Map<string, number>();
    let totalInvested = 0;
    let cumulativeDividends = 0;

    // Sort all dates from transactions, prices, and dividends
    const allDates = [...new Set([
      ...(transactions?.map(t => t.date) || []),
      ...(historicalPrices?.map(p => p.date) || []),
      ...(dividends?.map(d => d.date) || [])
    ])].sort();

    allDates.forEach(date => {
      // Update holdings based on transactions for this date
      const dayTransactions = transactions.filter(t => t.date === date);
      dayTransactions.forEach(transaction => {
        const shares = transaction.type === 'buy' ? transaction.shares : -transaction.shares;
        const currentShares = currentHoldings.get(transaction.symbol) || 0;
        currentHoldings.set(transaction.symbol, currentShares + shares);
        
        if (transaction.type === 'buy') {
          totalInvested += transaction.shares * transaction.price;
        }
      });

      // Add dividends for this date
      const dayDividends = dividends.filter(d => d.date === date);
      dayDividends.forEach(dividend => {
        cumulativeDividends += dividend.amount;
      });

      // Calculate portfolio value for this date
      let portfolioValue = 0;
      const dayPrices = historicalPrices.filter(p => p.date === date);
      dayPrices.forEach(price => {
        const shares = currentHoldings.get(price.symbol) || 0;
        portfolioValue += shares * price.closing_price;
      });

      dateMap.set(date, {
        date,
        portfolioValue,
        investedValue: totalInvested,
        cumulativeDividends,
      });
    });

    return Array.from(dateMap.values());
  }, [transactions, historicalPrices, dividends]);

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Évolution du Portfolio</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="colorPortfolio" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(34 197 94)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(34 197 94)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(59 130 246)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(59 130 246)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="colorDividends" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="rgb(245 158 11)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="rgb(245 158 11)" stopOpacity={0} />
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
                        Valeur: {Number(payload[0].value).toLocaleString()} €
                      </p>
                      <p className="text-md text-blue-500">
                        Investi: {Number(payload[1].value).toLocaleString()} €
                      </p>
                      <p className="text-md text-amber-500">
                        Dividendes: {Number(payload[2].value).toLocaleString()} €
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="portfolioValue"
                stroke="rgb(34 197 94)"
                fillOpacity={1}
                fill="url(#colorPortfolio)"
                name="Valeur du portfolio"
              />
              <Area
                type="monotone"
                dataKey="investedValue"
                stroke="rgb(59 130 246)"
                fillOpacity={1}
                fill="url(#colorInvested)"
                name="Montant investi"
              />
              <Area
                type="monotone"
                dataKey="cumulativeDividends"
                stroke="rgb(245 158 11)"
                fillOpacity={1}
                fill="url(#colorDividends)"
                name="Dividendes cumulés"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}