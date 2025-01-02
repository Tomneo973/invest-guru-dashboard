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
import { getPortfolioCurrentValue } from "@/services/yahooFinance";

type SortField = 'symbol' | 'shares' | 'avgPrice' | 'invested' | 'currentValue' | 'return' | 'currency' | 'sector';
type SortDirection = 'asc' | 'desc';

export function PortfolioSummaryTable() {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const { data: holdings, isLoading } = useQuery({
    queryKey: ["portfolio-value"],
    queryFn: getPortfolioCurrentValue,
    refetchInterval: 300000, // Refresh every 5 minutes
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
      case 'shares':
        return multiplier * (a.shares - b.shares);
      case 'avgPrice':
        return multiplier * (a.price - b.price);
      case 'invested':
        return multiplier * ((a.shares * a.price) - (b.shares * b.price));
      case 'currentValue':
        if (!a.currentPrice || !b.currentPrice) return 0;
        return multiplier * ((a.shares * a.currentPrice) - (b.shares * b.currentPrice));
      case 'return':
        if (!a.currentPrice || !b.currentPrice) return 0;
        const returnA = (a.shares * a.currentPrice) - (a.shares * a.price);
        const returnB = (b.shares * b.currentPrice) - (b.shares * b.price);
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
            const invested = holding.shares * holding.price;
            const currentValue = holding.currentPrice ? holding.shares * holding.currentPrice : null;
            const returnValue = currentValue ? currentValue - invested : null;
            const returnPercentage = returnValue ? (returnValue / invested) * 100 : null;

            return (
              <TableRow key={holding.symbol}>
                <TableCell className="font-medium">{holding.symbol}</TableCell>
                <TableCell>{holding.shares.toLocaleString()}</TableCell>
                <TableCell>{holding.price.toFixed(2)}</TableCell>
                <TableCell>{invested.toLocaleString()}</TableCell>
                <TableCell>{currentValue?.toLocaleString() ?? "N/A"}</TableCell>
                <TableCell 
                  className={returnValue && returnValue > 0 ? "text-green-600" : "text-red-600"}
                >
                  {returnValue 
                    ? `${returnValue.toFixed(2)} (${returnPercentage?.toFixed(2)}%)`
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