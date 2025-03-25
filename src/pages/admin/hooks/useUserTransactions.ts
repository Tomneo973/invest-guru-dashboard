
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/components/ui/use-toast";

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

export const useUserTransactions = () => {
  const [userTransactions, setUserTransactions] = useState<UserTransactions[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);
  const { toast } = useToast();

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

  return {
    userTransactions,
    loadingTransactions,
    fetchUserTransactions,
  };
};
