
import React from "react";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

interface User {
  id: string;
  created_at: string;
  role: string;
  avatar_url?: string | null;
  birthday?: string | null;
  country?: string | null;
  premium_until?: string | null;
}

interface UserTransaction {
  id: string;
  user_id: string;
  type: string;
  symbol: string;
  shares: number;
  price: number;
  date: string;
  platform: string;
  currency: string;
  sector: string;
}

interface UserDetailsDialogProps {
  user: User | null;
  transactions: UserTransaction[];
  loadingTransactions: boolean;
  onClose: () => void;
}

const UserDetailsDialog: React.FC<UserDetailsDialogProps> = ({
  user,
  transactions,
  loadingTransactions,
  onClose,
}) => {
  if (!user) return null;

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>Détails de l'utilisateur</DialogTitle>
        <DialogDescription>
          Informations détaillées sur l'utilisateur {user.id}
        </DialogDescription>
      </DialogHeader>
      <div className="space-y-6 py-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm font-medium">ID</p>
            <p className="text-sm text-gray-500 font-mono">{user.id}</p>
          </div>
          <div>
            <p className="text-sm font-medium">Date d'inscription</p>
            <p className="text-sm text-gray-500">
              {new Date(user.created_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Pays</p>
            <p className="text-sm text-gray-500">
              {user.country || "Non spécifié"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Date de naissance</p>
            <p className="text-sm text-gray-500">
              {user.birthday 
                ? new Date(user.birthday).toLocaleDateString("fr-FR") 
                : "Non spécifiée"}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Rôle</p>
            <p className="text-sm text-gray-500">
              {user.role || "user"}
            </p>
          </div>
        </div>

        <div className="mt-6">
          <h3 className="text-lg font-medium mb-2">Transactions</h3>
          {loadingTransactions ? (
            <div className="flex justify-center my-4">
              <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
            </div>
          ) : transactions.length === 0 ? (
            <p className="text-sm text-gray-500">Aucune transaction trouvée.</p>
          ) : (
            <div className="overflow-x-auto">
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
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {transactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {new Date(transaction.date).toLocaleDateString("fr-FR")}
                      </TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 rounded-full text-xs ${
                          transaction.type === "buy" 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {transaction.type === "buy" ? "Achat" : "Vente"}
                        </span>
                      </TableCell>
                      <TableCell>{transaction.symbol}</TableCell>
                      <TableCell>{transaction.shares}</TableCell>
                      <TableCell>
                        {transaction.price.toLocaleString()} {transaction.currency}
                      </TableCell>
                      <TableCell>
                        {(transaction.shares * transaction.price).toLocaleString()} {transaction.currency}
                      </TableCell>
                      <TableCell>{transaction.platform}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </div>
      </div>
      <DialogFooter>
        <Button variant="outline" onClick={onClose}>
          Fermer
        </Button>
      </DialogFooter>
    </DialogContent>
  );
};

export default UserDetailsDialog;
