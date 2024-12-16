import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

type Transaction = {
  id: string;
  type: string;
  symbol: string;
  shares: number;
  price: number;
  date: string;
  platform: string;
  currency: string;
  sector: string;
};

async function fetchTransactions() {
  const { data, error } = await supabase
    .from("transactions")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data as Transaction[];
}

export function TransactionList() {
  const { data: transactions = [], isLoading, error } = useQuery({
    queryKey: ["transactions"],
    queryFn: fetchTransactions,
  });

  if (error) {
    console.error("Error fetching transactions:", error);
    return <div>Erreur lors du chargement des transactions</div>;
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Symbole</TableHead>
            <TableHead>Quantité</TableHead>
            <TableHead>Prix</TableHead>
            <TableHead>Total</TableHead>
            <TableHead>Plateforme</TableHead>
            <TableHead>Devise</TableHead>
            <TableHead>Secteur</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Chargement...
              </TableCell>
            </TableRow>
          ) : transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Aucune transaction
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>
                  {format(new Date(transaction.date), "dd MMM yyyy", {
                    locale: fr,
                  })}
                </TableCell>
                <TableCell>
                  {transaction.type === "buy" ? "Achat" : "Vente"}
                </TableCell>
                <TableCell>{transaction.symbol}</TableCell>
                <TableCell>{transaction.shares}</TableCell>
                <TableCell>
                  {transaction.price.toLocaleString()} {transaction.currency}
                </TableCell>
                <TableCell>
                  {(transaction.shares * transaction.price).toLocaleString()}{" "}
                  {transaction.currency}
                </TableCell>
                <TableCell>{transaction.platform}</TableCell>
                <TableCell>{transaction.currency}</TableCell>
                <TableCell>{transaction.sector}</TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}