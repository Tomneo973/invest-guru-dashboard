
import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Edit2, Trash2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useTransactions } from "../../hooks/useTransactions";
import { useTransactionDeletion } from "../../hooks/useTransactionMutation";
import { TransactionForm } from "./TransactionForm";
import { RealEstateTransaction } from "../../types";

interface TransactionHistoryProps {
  propertyId: string;
}

export function TransactionHistory({ propertyId }: TransactionHistoryProps) {
  const [filterType, setFilterType] = useState<"all" | "expense" | "income">("all");
  const [editTransaction, setEditTransaction] = useState<RealEstateTransaction | null>(null);
  const [deleteTransaction, setDeleteTransaction] = useState<RealEstateTransaction | null>(null);

  const { data: transactions, isLoading } = useTransactions(propertyId);
  const { mutate: deleteTransactionMutation, isPending: isDeleting } = useTransactionDeletion();

  // Filtrer les transactions selon le type sélectionné
  const filteredTransactions = transactions?.filter((transaction) => {
    if (filterType === "all") return true;
    return transaction.type === filterType;
  }) || [];

  const handleDelete = () => {
    if (deleteTransaction) {
      deleteTransactionMutation(deleteTransaction.id, {
        onSuccess: () => setDeleteTransaction(null)
      });
    }
  };

  // Fonction pour obtenir le texte de la catégorie
  const getCategoryLabel = (category: string): string => {
    const categories: Record<string, string> = {
      loan_payment: "Remboursement de prêt",
      works: "Travaux",
      tax: "Impôts et taxes",
      insurance: "Assurance",
      maintenance: "Entretien",
      utilities: "Charges",
      rent: "Loyer",
      deposit: "Caution",
      subsidy: "Subvention",
      tax_refund: "Remboursement d'impôts",
      other_expense: "Autre dépense",
      other_income: "Autre revenu"
    };
    return categories[category] || category;
  };

  // Formateur de montant
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR'
    }).format(amount);
  };

  if (isLoading) {
    return <div className="py-10 text-center">Chargement des transactions...</div>;
  }

  return (
    <>
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Select
              value={filterType}
              onValueChange={(value: "all" | "expense" | "income") => setFilterType(value)}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer par" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="income">Revenus</SelectItem>
                <SelectItem value="expense">Dépenses</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <span className="text-sm text-muted-foreground">
            {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? "s" : ""}
          </span>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-muted-foreground">
              {transactions?.length === 0
                ? "Aucune transaction enregistrée"
                : "Aucune transaction correspondant au filtre"}
            </p>
          </div>
        ) : (
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Catégorie</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead className="text-right">Montant</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={transaction.type === "income" ? "outline" : "secondary"}
                        className={
                          transaction.type === "income"
                            ? "text-green-600 border-green-300 bg-green-50"
                            : "text-red-600 border-red-300 bg-red-50"
                        }
                      >
                        {getCategoryLabel(transaction.category)}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate">
                      {transaction.description || "-"}
                    </TableCell>
                    <TableCell
                      className={`text-right font-medium ${
                        transaction.type === "income" ? "text-green-600" : "text-red-600"
                      }`}
                    >
                      {formatAmount(transaction.amount)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditTransaction(transaction)}
                        >
                          <Edit2 size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setDeleteTransaction(transaction)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Dialog pour éditer une transaction */}
      <Dialog open={!!editTransaction} onOpenChange={(open) => !open && setEditTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier la transaction</DialogTitle>
          </DialogHeader>
          {editTransaction && (
            <TransactionForm
              propertyId={propertyId}
              initialData={{
                id: editTransaction.id,
                date: editTransaction.date,
                amount: Math.abs(editTransaction.amount),
                type: editTransaction.type,
                category: editTransaction.category,
                description: editTransaction.description
              }}
              onSuccess={() => setEditTransaction(null)}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Dialog de confirmation de suppression */}
      <Dialog open={!!deleteTransaction} onOpenChange={(open) => !open && setDeleteTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
          </DialogHeader>
          <Alert variant="destructive">
            <AlertTitle>Attention</AlertTitle>
            <AlertDescription>
              Êtes-vous sûr de vouloir supprimer cette transaction ? Cette action est irréversible.
            </AlertDescription>
          </Alert>
          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setDeleteTransaction(null)}>
              Annuler
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Suppression..." : "Supprimer"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
