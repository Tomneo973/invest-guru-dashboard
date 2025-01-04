import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";

type SortField = 'symbol' | 'name' | 'shares' | 'avgPrice' | 'invested' | 'currentValue' | 'return' | 'currency' | 'sector';
type SortDirection = 'asc' | 'desc';

// Mapping des symboles vers les noms complets
const companyNames: { [key: string]: string } = {
  'AAPL': 'Apple Inc.',
  'MSFT': 'Microsoft Corporation',
  'GOOGL': 'Alphabet Inc.',
  'AMZN': 'Amazon.com Inc.',
  'META': 'Meta Platforms Inc.',
  'NVDA': 'NVIDIA Corporation',
  'TSLA': 'Tesla Inc.',
  'ABBV': 'AbbVie Inc.',
  'JPM': 'JPMorgan Chase & Co.',
  'JNJ': 'Johnson & Johnson',
  'V': 'Visa Inc.',
  'PG': 'Procter & Gamble Co.',
  'MA': 'Mastercard Inc.',
  'UNH': 'UnitedHealth Group Inc.',
  'HD': 'The Home Depot Inc.',
  'BAC': 'Bank of America Corp.',
  'XOM': 'Exxon Mobil Corporation',
  'PFE': 'Pfizer Inc.',
  'DIS': 'The Walt Disney Co.',
  'CSCO': 'Cisco Systems Inc.',
};

export function PortfolioSummaryTable() {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-holdings"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc('get_portfolio_holdings');
      if (error) throw error;
      return data;
    },
  });

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedHoldings = holdings?.slice().sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'symbol':
        return multiplier * a.symbol.localeCompare(b.symbol);
      case 'name':
        const nameA = companyNames[a.symbol] || a.symbol;
        const nameB = companyNames[b.symbol] || b.symbol;
        return multiplier * nameA.localeCompare(nameB);
      case 'shares':
        return multiplier * (a.shares - b.shares);
      case 'avgPrice':
        return multiplier * (a.total_invested/a.shares - b.total_invested/b.shares);
      case 'invested':
        return multiplier * (a.total_invested - b.total_invested);
      case 'currentValue':
        return multiplier * (a.current_value - b.current_value);
      case 'return':
        const returnA = a.current_value - a.total_invested;
        const returnB = b.current_value - b.total_invested;
        return multiplier * (returnA - returnB);
      case 'currency':
        return multiplier * a.currency.localeCompare(b.currency);
      case 'sector':
        return multiplier * a.sector.localeCompare(b.sector);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  return (
    <div className="rounded-lg border bg-white mt-6">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('symbol')}>
                Symbol <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('name')}>
                Nom <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('shares')}>
                Total Shares <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('avgPrice')}>
                Avg. Price <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('invested')}>
                Total Invested <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('currentValue')}>
                Current Value <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('return')}>
                Return <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('currency')}>
                Currency <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('sector')}>
                Sector <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedHoldings?.map((holding) => {
            const avgPrice = holding.shares > 0 ? holding.total_invested / holding.shares : 0;
            const returnValue = holding.current_value - holding.total_invested;
            const returnPercentage = holding.total_invested > 0 ? (returnValue / holding.total_invested) * 100 : 0;

            return (
              <TableRow key={holding.symbol}>
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell>{companyNames[holding.symbol] || holding.symbol}</TableCell>
                <TableCell>{holding.shares.toLocaleString()}</TableCell>
                <TableCell>{avgPrice.toFixed(2)}</TableCell>
                <TableCell>{holding.total_invested.toLocaleString()}</TableCell>
                <TableCell>{holding.current_value?.toLocaleString() ?? "N/A"}</TableCell>
                <TableCell 
                  className={returnValue > 0 ? "text-green-600" : "text-red-600"}
                >
                  {returnValue 
                    ? `${returnValue.toFixed(2)} (${returnPercentage.toFixed(2)}%)`
                    : "N/A"
                  }
                </TableCell>
                <TableCell>{holding.currency}</TableCell>
                <TableCell>{holding.sector}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}