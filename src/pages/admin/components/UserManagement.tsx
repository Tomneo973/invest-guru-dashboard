
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
import { Shield, Edit, Search, RefreshCw, UserCheck, Eye } from "lucide-react";

interface User {
  id: string;
  email?: string;
  created_at: string;
  role: string;
  avatar_url?: string | null;
  birthday?: string | null;
  country?: string | null;
  premium_until?: string | null;
}

interface UserTransactions {
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

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userTransactions, setUserTransactions] = useState<UserTransactions[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
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

      // Récupérer les profils des utilisateurs depuis la table profiles
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs.",
          variant: "destructive",
        });
        return;
      }

      // Convertir les profils au format attendu
      const usersData = profiles.map((profile: any) => ({
        id: profile.id,
        created_at: profile.created_at,
        role: profile.role,
        avatar_url: profile.avatar_url,
        birthday: profile.birthday,
        country: profile.country,
        premium_until: profile.premium_until
      }));

      setUsers(usersData);
    } catch (error) {
      console.error("Erreur:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la récupération des données.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchUserTransactions = async (userId: string) => {
    try {
      setLoadingTransactions(true);
      
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId);

      if (error) {
        throw error;
      }

      setUserTransactions(data || []);
    } catch (error) {
      console.error("Erreur lors de la récupération des transactions:", error);
      toast({
        title: "Erreur",
        description: "Impossible de récupérer les transactions de l'utilisateur.",
        variant: "destructive",
      });
      setUserTransactions([]);
    } finally {
      setLoadingTransactions(false);
    }
  };

  const toggleAdminRole = async (userId: string, currentRole: string) => {
    try {
      const newRole = currentRole === "admin" ? "user" : "admin";
      
      const { error } = await supabase
        .from("profiles")
        .update({ role: newRole })
        .eq("id", userId);

      if (error) {
        throw error;
      }

      // Mettre à jour l'état local
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: newRole
          };
        }
        return user;
      }));

      toast({
        title: "Succès",
        description: `Rôle modifié avec succès: ${newRole}`,
      });
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur.",
        variant: "destructive",
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const searchLower = searchTerm.toLowerCase();
    return (
      user.id?.toLowerCase().includes(searchLower) ||
      user.country?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher par ID, pays..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline" className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4" />
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
                <TableHead>ID</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Pays</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-mono text-xs">{user.id}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{user.country || "Non spécifié"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => {
                                setSelectedUser(user);
                                fetchUserTransactions(user.id);
                              }}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-4xl">
                            <DialogHeader>
                              <DialogTitle>Détails de l'utilisateur</DialogTitle>
                              <DialogDescription>
                                Informations détaillées sur l'utilisateur {user.id}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-6 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">ID</p>
                                    <p className="text-sm text-gray-500 font-mono">{selectedUser.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date d'inscription</p>
                                    <p className="text-sm text-gray-500">
                                      {new Date(selectedUser.created_at).toLocaleDateString("fr-FR")}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Pays</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedUser.country || "Non spécifié"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date de naissance</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedUser.birthday 
                                        ? new Date(selectedUser.birthday).toLocaleDateString("fr-FR") 
                                        : "Non spécifiée"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Rôle</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedUser.role || "user"}
                                    </p>
                                  </div>
                                </div>

                                <div className="mt-6">
                                  <h3 className="text-lg font-medium mb-2">Transactions</h3>
                                  {loadingTransactions ? (
                                    <div className="flex justify-center my-4">
                                      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-gray-900"></div>
                                    </div>
                                  ) : userTransactions.length === 0 ? (
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
                                          {userTransactions.map((transaction) => (
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
                            )}
                            <DialogFooter>
                              <Button variant="outline" onClick={() => setSelectedUser(null)}>
                                Fermer
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                        
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleAdminRole(user.id, user.role || "user")}
                          title={user.role === "admin" ? "Retirer les droits admin" : "Promouvoir en admin"}
                        >
                          <Shield className={`h-4 w-4 ${
                            user.role === "admin" ? "text-purple-600" : "text-gray-400"
                          }`} />
                        </Button>
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

export default UserManagement;
