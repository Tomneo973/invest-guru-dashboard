
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Loader2, UserX, Crown } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "premium" | "admin";
  premium_until: string | null;
  created_at: string;
}

interface SupabaseUser {
  id: string;
  email: string;
}

export default function AdminPage() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Rediriger si l'utilisateur n'est pas admin
    if (!isAdmin) {
      navigate("/dashboard");
      toast({
        title: "Accès refusé",
        description: "Vous n'avez pas les droits d'administration",
        variant: "destructive",
      });
    }
  }, [isAdmin, navigate, toast]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        // Récupérer tous les profils utilisateurs (seuls les admins peuvent faire cette requête grâce aux RLS)
        const { data: profilesData, error: profilesError } = await supabase
          .from("profiles")
          .select("*");

        if (profilesError) throw profilesError;

        // Récupérer les emails depuis la table des utilisateurs
        // Note: Dans un environnement réel, cette opération nécessiterait un accès service_role
        // Nous simulons ici le comportement pour démonstration
        const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
        
        if (authError) throw authError;
        
        // Créer un mapping des emails
        const emailMap = new Map<string, string>();
        
        // Vérifier que authData.users existe et est un tableau
        const authUsers = authData?.users || [];
        authUsers.forEach((user: SupabaseUser) => {
          if (user && typeof user.id === 'string' && typeof user.email === 'string') {
            emailMap.set(user.id, user.email);
          }
        });

        // Combiner les données
        const combinedUsers = profilesData.map(profile => ({
          ...profile,
          email: emailMap.get(profile.id) || "Email non disponible",
        }));

        setUsers(combinedUsers);
        setUserCount(combinedUsers.length);
        setPremiumCount(combinedUsers.filter(u => u.role === "premium" || (u.premium_until && new Date(u.premium_until) > new Date())).length);
      } catch (error) {
        console.error("Erreur lors de la récupération des utilisateurs:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer la liste des utilisateurs",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, [toast]);

  const handleTogglePremium = async (userId: string, currentRole: string, currentPremiumUntil: string | null) => {
    try {
      const newRole = currentRole === "premium" ? "user" : "premium";
      let premiumUntil = null;

      if (newRole === "premium") {
        // Si on donne le rôle premium, ajouter une date d'expiration dans 1 an
        const endDate = new Date();
        endDate.setFullYear(endDate.getFullYear() + 1);
        premiumUntil = endDate.toISOString();
      }

      const { error } = await supabase
        .from("profiles")
        .update({
          role: newRole,
          premium_until: premiumUntil,
        })
        .eq("id", userId);

      if (error) throw error;

      // Mettre à jour l'état local
      setUsers(users.map(user => {
        if (user.id === userId) {
          return {
            ...user,
            role: newRole as "user" | "premium" | "admin",
            premium_until: premiumUntil,
          };
        }
        return user;
      }));

      setPremiumCount(prevCount => 
        newRole === "premium" ? prevCount + 1 : prevCount - 1
      );

      toast({
        title: "Succès",
        description: `Statut premium ${newRole === "premium" ? "activé" : "désactivé"} pour l'utilisateur`,
      });
    } catch (error) {
      console.error("Erreur lors de la modification du statut premium:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le statut premium",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[80vh]">
        <Loader2 className="w-10 h-10 animate-spin text-gray-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Administration</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Total</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Utilisateurs Premium</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{premiumCount}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Taux de Conversion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {userCount > 0 ? `${((premiumCount / userCount) * 100).toFixed(1)}%` : "0%"}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestion des Utilisateurs</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Expiration Premium</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.email}</TableCell>
                  <TableCell>
                    {user.role === "admin" ? (
                      <Badge className="bg-purple-500 hover:bg-purple-600">Admin</Badge>
                    ) : user.role === "premium" || (user.premium_until && new Date(user.premium_until) > new Date()) ? (
                      <Badge className="bg-amber-500 hover:bg-amber-600">Premium</Badge>
                    ) : (
                      <Badge variant="outline">Standard</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {format(new Date(user.created_at), "dd MMMM yyyy", { locale: fr })}
                  </TableCell>
                  <TableCell>
                    {user.premium_until ? (
                      new Date(user.premium_until) > new Date() ? 
                        format(new Date(user.premium_until), "dd MMMM yyyy", { locale: fr }) : 
                        "Expiré"
                    ) : (
                      "N/A"
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    {user.role !== "admin" && (
                      <Button
                        variant={user.role === "premium" ? "outline" : "default"}
                        size="sm"
                        onClick={() => handleTogglePremium(user.id, user.role, user.premium_until)}
                      >
                        {user.role === "premium" ? (
                          <>
                            <UserX className="mr-2 h-4 w-4" />
                            Retirer Premium
                          </>
                        ) : (
                          <>
                            <Crown className="mr-2 h-4 w-4" />
                            Donner Premium
                          </>
                        )}
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
