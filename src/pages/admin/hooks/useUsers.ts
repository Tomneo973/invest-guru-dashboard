
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

export const useUsers = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

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

  useEffect(() => {
    fetchUsers();
  }, []);

  return { users, loading, fetchUsers };
};
