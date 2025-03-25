
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
import { Shield, Edit, Search } from "lucide-react";

interface User {
  id: string;
  email: string;
  created_at: string;
  profile?: {
    id: string;
    created_at: string;
    birthday: string | null;
    country: string | null;
    avatar_url: string | null;
    role: string;
  };
}

const UserManagement = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
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

      // Récupérer les utilisateurs de Supabase Auth (nécessite l'accès service_role)
      // Note: Dans une implémentation réelle, cela devrait être fait via une fonction Edge ou un backend sécurisé
      const { data: authUsers, error: authError } = await supabase.auth.admin.listUsers();
      
      if (authError) {
        console.error("Erreur lors de la récupération des utilisateurs:", authError);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs.",
          variant: "destructive",
        });
        return;
      }

      // Récupérer les profils des utilisateurs
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*");

      if (profilesError) {
        console.error("Erreur lors de la récupération des profils:", profilesError);
      }

      // Associer les profils aux utilisateurs
      const usersWithProfiles = authUsers.users.map((user: any) => {
        const profile = profiles?.find((p) => p.id === user.id);
        return {
          ...user,
          profile: profile || null
        };
      });

      setUsers(usersWithProfiles);
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
        if (user.id === userId && user.profile) {
          return {
            ...user,
            profile: {
              ...user.profile,
              role: newRole
            }
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
      user.email?.toLowerCase().includes(searchLower) ||
      user.id?.toLowerCase().includes(searchLower) ||
      user.profile?.country?.toLowerCase().includes(searchLower)
    );
  });

  return (
    <div>
      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Rechercher un utilisateur..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Button onClick={fetchUsers} variant="outline">
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
                <TableHead>Email</TableHead>
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
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString("fr-FR")}
                    </TableCell>
                    <TableCell>{user.profile?.country || "Non spécifié"}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        user.profile?.role === "admin" 
                          ? "bg-purple-100 text-purple-800" 
                          : "bg-gray-100 text-gray-800"
                      }`}>
                        {user.profile?.role || "user"}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Détails de l'utilisateur</DialogTitle>
                              <DialogDescription>
                                Informations détaillées sur {user.email}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4 py-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <p className="text-sm font-medium">ID</p>
                                    <p className="text-sm text-gray-500">{selectedUser.id}</p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Email</p>
                                    <p className="text-sm text-gray-500">{selectedUser.email}</p>
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
                                      {selectedUser.profile?.country || "Non spécifié"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Date de naissance</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedUser.profile?.birthday 
                                        ? new Date(selectedUser.profile.birthday).toLocaleDateString("fr-FR") 
                                        : "Non spécifiée"}
                                    </p>
                                  </div>
                                  <div>
                                    <p className="text-sm font-medium">Rôle</p>
                                    <p className="text-sm text-gray-500">
                                      {selectedUser.profile?.role || "user"}
                                    </p>
                                  </div>
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
                          onClick={() => toggleAdminRole(user.id, user.profile?.role || "user")}
                          title={user.profile?.role === "admin" ? "Retirer les droits admin" : "Promouvoir en admin"}
                        >
                          <Shield className={`h-4 w-4 ${
                            user.profile?.role === "admin" ? "text-purple-600" : "text-gray-400"
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
