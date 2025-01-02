import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";

export function DividendList() {
  const { data: dividends, isLoading } = useQuery({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <Skeleton className="w-full h-[200px]" />;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Symbole</TableHead>
            <TableHead>Montant</TableHead>
            <TableHead>Devise</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {dividends?.map((dividend) => (
            <TableRow key={dividend.id}>
              <TableCell>{format(new Date(dividend.date), "dd/MM/yyyy")}</TableCell>
              <TableCell>{dividend.symbol}</TableCell>
              <TableCell>{dividend.amount.toFixed(2)}</TableCell>
              <TableCell>{dividend.currency}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}