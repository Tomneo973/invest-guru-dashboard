import { TableCell, TableRow } from "@/components/ui/table";
import { Holding, companyNames } from "../types/portfolio";

interface PortfolioTableRowProps {
  holding: Holding;
}

export function PortfolioTableRow({ holding }: PortfolioTableRowProps) {
  const avgPrice = holding.shares > 0 ? holding.total_invested / holding.shares : 0;
  const returnValue = holding.current_value - holding.total_invested;
  const returnPercentage = holding.total_invested > 0 ? (returnValue / holding.total_invested) * 100 : 0;

  return (
    <TableRow>
      <TableCell className="font-medium">{holding.symbol}</TableCell>
      <TableCell>{companyNames[holding.symbol] || holding.symbol}</TableCell>
      <TableCell>{holding.shares.toLocaleString()}</TableCell>
      <TableCell>{avgPrice.toFixed(2)}</TableCell>
      <TableCell>{holding.total_invested.toLocaleString()}</TableCell>
      <TableCell>{holding.current_value?.toLocaleString() ?? "N/A"}</TableCell>
      <TableCell className={returnValue > 0 ? "text-green-600" : "text-red-600"}>
        {returnValue 
          ? `${returnValue.toFixed(2)} (${returnPercentage.toFixed(2)}%)`
          : "N/A"
        }
      </TableCell>
      <TableCell>{holding.currency}</TableCell>
      <TableCell>{holding.sector}</TableCell>
    </TableRow>
  );
}