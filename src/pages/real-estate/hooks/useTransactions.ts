
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { RealEstateTransaction } from "../types";

export function useTransactions(propertyId: string) {
  return useQuery({
    queryKey: ["property-transactions", propertyId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("real_estate_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as RealEstateTransaction[];
    },
  });
}
