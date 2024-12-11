import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

export function TransactionList() {
  // TODO: Implement transaction fetching
  const transactions = [];

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
          {transactions.length === 0 ? (
            <TableRow>
              <TableCell colSpan={9} className="text-center">
                Aucune transaction
              </TableCell>
            </TableRow>
          ) : (
            transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                {/* TODO: Add transaction data */}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}