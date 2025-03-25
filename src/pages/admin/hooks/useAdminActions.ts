
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

  return {
    toggleAdminRole,
  };
};
