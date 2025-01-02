import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { useState } from "react";
import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PortfolioItem {
  symbol: string;
  shares: number;
  price: number;
  currentPrice: number | null;
  currentValue: number | null;
  currency: string;
  sector: string;
}

interface PortfolioSummaryProps {
  data?: PortfolioItem[];
  isLoading: boolean;
}

type SortField = 'symbol' | 'shares' | 'price' | 'currentValue' | 'sector';
type SortDirection = 'asc' | 'desc';

export function PortfolioSummary({ data, isLoading }: PortfolioSummaryProps) {
  const [sortField, setSortField] = useState<SortField>('symbol');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedData = data?.slice().sort((a, b) => {
    const multiplier = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'symbol':
        return multiplier * a.symbol.localeCompare(b.symbol);
      case 'shares':
        return multiplier * (a.shares - b.shares);
      case 'price':
        return multiplier * (a.price - b.price);
      case 'currentValue':
        if (a.currentValue === null || b.currentValue === null) return 0;
        return multiplier * (a.currentValue - b.currentValue);
      case 'sector':
        return multiplier * a.sector.localeCompare(b.sector);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[300px]" />;
  }

  const calculateAveragePrice = (symbol: string) => {
    const symbolTransactions = data?.filter(item => item.symbol === symbol);
    if (!symbolTransactions?.length) return 0;
    
    const totalCost = symbolTransactions.reduce((sum, item) => sum + (item.price * item.shares), 0);
    const totalShares = symbolTransactions.reduce((sum, item) => sum + item.shares, 0);
    
    return totalCost / totalShares;
  };

  return (
    <div className="rounded-lg border">
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
            <TableHead>Average Price</TableHead>
            <TableHead>Total Invested</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('currentValue')}>
                Current Value <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
            <TableHead>Return</TableHead>
            <TableHead>Currency</TableHead>
            <TableHead>
              <Button variant="ghost" onClick={() => handleSort('sector')}>
                Sector <ArrowUpDown className="ml-2 h-4 w-4" />
              </Button>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedData?.map((item) => {
            const averagePrice = calculateAveragePrice(item.symbol);
            const totalInvested = averagePrice * item.shares;
            const returnValue = item.currentValue ? item.currentValue - totalInvested : null;
            const returnPercentage = returnValue && totalInvested ? (returnValue / totalInvested) * 100 : null;

            return (
              <TableRow key={item.symbol}>
                <TableCell className="font-medium">{item.symbol}</TableCell>
                <TableCell>{item.shares}</TableCell>
                <TableCell>{averagePrice.toFixed(2)}</TableCell>
                <TableCell>{totalInvested.toFixed(2)}</TableCell>
                <TableCell>{item.currentValue?.toFixed(2) ?? "N/A"}</TableCell>
                <TableCell className={returnValue && returnValue > 0 ? "text-green-600" : "text-red-600"}>
                  {returnValue ? `${returnValue.toFixed(2)} (${returnPercentage?.toFixed(2)}%)` : "N/A"}
                </TableCell>
                <TableCell>{item.currency}</TableCell>
                <TableCell>{item.sector}</TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}