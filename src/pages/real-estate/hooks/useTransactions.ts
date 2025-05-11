
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RealEstateTransaction } from "../types";
import { useToast } from "@/components/ui/use-toast";

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
