import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Table, TableBody } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { PortfolioTableHeader } from "./components/PortfolioTableHeader";
import { PortfolioTableRow } from "./components/PortfolioTableRow";
import { SortField, SortDirection, Holding } from "./types/portfolio";

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
        <PortfolioTableHeader onSort={handleSort} />
        <TableBody>
          {sortedHoldings?.map((holding: Holding) => (
            <PortfolioTableRow key={holding.symbol} holding={holding} />
          ))}
        </TableBody>
      </Table>
    </div>
  );
}