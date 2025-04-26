
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface PropertyFormData {
  name: string;
  address: string;
  purchase_price: string | number;
  acquisition_date: string;
  loan_amount: string | number;
  loan_rate: string | number;
  loan_duration_months: string | number;
  loan_start_date: string;
  monthly_rent: string | number;
  repaid_capital: string | number;
  total_rents_collected: string | number;
  is_rented: boolean;
  is_sold: boolean;
  sale_date?: string;
  sale_price?: string | number;
}

export function usePropertyMutation(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PropertyFormData) => {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Utilisateur non authentifié");
      
      const payload = {
        name: data.name,
        address: data.address,
        purchase_price: parseFloat(data.purchase_price.toString()),
        acquisition_date: data.acquisition_date,
        loan_amount: data.loan_amount ? parseFloat(data.loan_amount.toString()) : null,
        loan_rate: data.loan_rate ? parseFloat(data.loan_rate.toString()) : null,
        loan_duration_months: data.loan_duration_months
          ? parseInt(data.loan_duration_months.toString())
          : null,
        loan_start_date: data.loan_start_date || null,
        loan_end_date: data.loan_start_date && data.loan_duration_months
          ? new Date(
              new Date(data.loan_start_date).setMonth(
                new Date(data.loan_start_date).getMonth() +
                  parseInt(data.loan_duration_months.toString())
              )
            )
              .toISOString()
              .split("T")[0]
          : null,
        is_rented: data.is_rented,
        monthly_rent: data.is_rented && data.monthly_rent ? parseFloat(data.monthly_rent.toString()) : null,
        repaid_capital: data.repaid_capital ? parseFloat(data.repaid_capital.toString()) : 0,
        total_rents_collected: data.total_rents_collected
          ? parseFloat(data.total_rents_collected.toString())
          : 0,
        is_sold: data.is_sold,
        sale_date: data.is_sold && data.sale_date ? data.sale_date : null,
        sale_price: data.is_sold && data.sale_price ? parseFloat(data.sale_price.toString()) : null,
        user_id: user.id
      };

      const { error } = await supabase
        .from("real_estate")
        .insert(payload);
        
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["real-estate"] });
      toast({
        title: "Bien ajouté",
        description: "Le bien a été ajouté avec succès",
      });
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Une erreur est survenue: " + error.message,
        variant: "destructive",
      });
    },
  });
}
