
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

interface UserProfile {
  id: string;
  email: string;
  role: "user" | "premium" | "admin";
  premium_until: string | null;
  created_at: string;
}

// Define a more flexible interface that matches what Supabase returns
interface SupabaseUser {
  id: string;
  email?: string; // Make email optional to match actual User type
}

export function useUsers() {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [userCount, setUserCount] = useState(0);
  const [premiumCount, setPremiumCount] = useState(0);
  const { toast } = useToast();

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
        
        // Use type assertion to resolve the type compatibility issue
        authUsers.forEach((user: any) => {
          if (user && typeof user.id === 'string') {
            // Use the email or a default value if it's not available
            const email = typeof user.email === 'string' ? user.email : "Email non disponible";
            emailMap.set(user.id, email);
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

  return {
    users,
    loading,
    userCount,
    premiumCount,
    handleTogglePremium
  };
}
