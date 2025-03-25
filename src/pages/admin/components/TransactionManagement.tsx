
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit, Search, Eye } from "lucide-react";

interface Transaction {
  id: string;
  user_id: string;
  type: string;
  symbol: string;
  shares: number;
  price: number;
  date: string;
  created_at: string;
  platform: string;
  currency: string;
  sector: string;
  user_email?: string;
}

const TransactionManagement = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchTransactions();
  }, []);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast({
          title: "Erreur",
          description: "Vous devez être connecté pour accéder à ces données.",
          variant: "destructive",
        });
        return;
      }

      // Vérifier d'abord si l'utilisateur est administrateur
      const { data: isAdmin, error: adminCheckError } = await supabase.rpc('is_admin', {
        user_id: session.user.id
      });

      if (adminCheckError || !isAdmin) {
        toast({
          title: "Accès refusé",
          description: "Vous n'avez pas les droits d'administrateur nécessaires.",
          variant: "destructive",
        });
        return;
      }

      // Récupérer toutes les transactions
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .order("date", { ascending: false });

      if (error) {
        throw error;
      }

      // Récupérer les emails des utilisateurs (nécessite l'accès service_role)
      // Note: Dans une implémentation réelle, cela devrait être fait via une fonction Edge ou un backend sécurisé
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Erreur lors de la récupération des utilisateurs:", authError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les détails des utilisateurs.",
          variant: "destructive",
        });
      }

      // Associer les emails aux transactions
      const transactionsWithEmails = data.map((transaction: Transaction) => {
        const user = authUsers.users.find((u: any) => u.id === transaction.user_id);
        return {
          ...transaction,
          user_email: user?.email || "Email inconnu"
        };
      });

      setTransactions(transactionsWithEmails);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des transactions.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredTransactions = transactions.filter(transaction => {
    const searchLower = searchTerm.toLowerCase();
    return (
      transaction.symbol?.toLowerCase().includes(searchLower) ||
      transaction.user_email?.toLowerCase().includes(searchLower) ||
      transaction.platform?.toLowerCase().includes(searchLower) ||
      transaction.sector?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher une transaction..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={fetchTransactions} variant="outline">
          Actualiser
        </Button>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gray-900"></div>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Utilisateur</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Symbole</TableHead>
                <TableHead>Quantité</TableHead>
                <TableHead>Prix</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTransactions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-4">
                    Aucune transaction trouvée
                  </TableCell>
                </TableRow>
              ) : (
                filteredTransactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>{transaction.user_email}</TableCell>
                    <TableCell>
                      {format(new Date(transaction.date), "dd MMM yyyy", { locale: fr })}
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
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedTransaction(transaction)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Détails de la transaction</DialogTitle>
                              <DialogDescription>
                                Transaction {transaction.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedTransaction && (
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">ID</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Utilisateur</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.user_email}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date</p>
                                    <p className="text-sm text-gray-500">
                                      {format(new Date(selectedTransaction.date), "dd MMMM yyyy", { locale: fr })}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Type</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedTransaction.type === "buy" ? "Achat" : "Vente"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Symbole</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.symbol}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Secteur</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.sector}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Quantité</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.shares}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Prix unitaire</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedTransaction.price.toLocaleString()} {selectedTransaction.currency}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Montant total</p>
                                    <p className="text-sm text-gray-500">
                                      {(selectedTransaction.shares * selectedTransaction.price).toLocaleString()} {selectedTransaction.currency}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Plateforme</p>
                                    <p className="text-sm text-gray-500">{selectedTransaction.platform}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date de création</p>
                                    <p className="text-sm text-gray-500">
                                      {format(new Date(selectedTransaction.created_at), "dd/MM/yyyy HH:mm", { locale: fr })}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedTransaction(null)}>
                                Fermer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default TransactionManagement;
