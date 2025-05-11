
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RealEstateTransaction } from "../types";
import { useToast } from "@/components/ui/use-toast";

// Fonction utilitaire pour obtenir le dernier jour ouvrable (lundi-vendredi)
const getLastBusinessDay = () => {
  const today = new Date();
  const dayOfWeek = today.getDay(); // 0 = dimanche, 1 = lundi, ..., 6 = samedi
  
  // Si nous sommes un dimanche (0), retourner vendredi (moins 2 jours)
  // Si nous sommes un samedi (6), retourner vendredi (moins 1 jour)
  // Sinon, retourner aujourd'hui
  const daysToSubtract = dayOfWeek === 0 ? 2 : dayOfWeek === 6 ? 1 : 0;
  const lastBusinessDay = new Date(today);
  lastBusinessDay.setDate(today.getDate() - daysToSubtract);
  
  return lastBusinessDay;
};

export function useTransactions(propertyId: string) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["property-transactions", propertyId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("real_estate_transactions")
          .select("*")
          .eq("property_id", propertyId)
          .order("date", { ascending: false });

        if (error) throw error;
        return data as RealEstateTransaction[];
      } catch (error) {
        console.error("Error fetching property transactions:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer les transactions du bien immobilier.",
          variant: "destructive",
        });
        return [] as RealEstateTransaction[];
      }
    },
  });
}
