
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

export const useAdminActions = () => {
  const { toast } = useToast();

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

      toast({
        title: "Succès",
        description: `Rôle modifié avec succès: ${newRole}`,
      });

      return { success: true, newRole };
    } catch (error) {
      console.error("Erreur lors de la modification du rôle:", error);
      toast({
        title: "Erreur",
        description: "Impossible de modifier le rôle de l'utilisateur.",
        variant: "destructive",
      });
      return { success: false };
    }
  };

  // Nouvelle fonction pour vérifier si l'utilisateur actuel est admin
  const checkAdminStatus = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return false;
      }

      const { data: userProfile, error } = await supabase
        .from("profiles")
        .select("role")
        .eq("id", session.user.id)
        .single();

      if (error || !userProfile) {
        return false;
      }

      return userProfile.role === "admin";
    } catch (error) {
      console.error("Erreur lors de la vérification du statut admin:", error);
      return false;
    }
  };

  return {
    toggleAdminRole,
    checkAdminStatus
  };
};
