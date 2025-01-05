import { TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { SortField } from "../types/portfolio";

interface PortfolioTableHeaderProps {
  onSort: (field: SortField) => void;
}

export function PortfolioTableHeader({ onSort }: PortfolioTableHeaderProps) {
  return (
    <TableHeader>
      <TableRow>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('symbol')}>
            Symbol <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('name')}>
            Nom <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('shares')}>
            Total Shares <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('avgPrice')}>
            Avg. Price <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('invested')}>
            Total Invested <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('currentValue')}>
            Current Value <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('return')}>
            Return <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('currency')}>
            Currency <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
        <TableHead>
          <Button variant="ghost" onClick={() => onSort('sector')}>
            Sector <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        </TableHead>
      </TableRow>
    </TableHeader>
  );
}