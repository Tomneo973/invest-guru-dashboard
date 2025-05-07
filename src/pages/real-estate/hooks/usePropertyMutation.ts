
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
  // Nouveaux champs pour les impôts
  property_tax?: string | number;
  housing_tax?: string | number;
  income_tax_rate?: string | number;
  other_taxes?: string | number;
  // Surface area field
  surface_area?: string | number;
}

export function usePropertyMutation(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: PropertyFormData & { id?: string }) => {
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
        user_id: user.id,
        monthly_payment: calculateMonthlyPayment(
          data.loan_amount ? parseFloat(data.loan_amount.toString()) : 0,
          data.loan_rate ? parseFloat(data.loan_rate.toString()) : 0,
          data.loan_duration_months ? parseInt(data.loan_duration_months.toString()) : 0
        ),
        // Nouveaux champs pour les impôts
        property_tax: data.property_tax ? parseFloat(data.property_tax.toString()) : null,
        housing_tax: data.housing_tax ? parseFloat(data.housing_tax.toString()) : null,
        income_tax_rate: data.income_tax_rate ? parseFloat(data.income_tax_rate.toString()) : null,
        other_taxes: data.other_taxes ? parseFloat(data.other_taxes.toString()) : null,
        // Fix: Add surface_area to payload
        surface_area: data.surface_area ? parseFloat(data.surface_area.toString()) : null,
      };

      if (data.id) {
        // Mise à jour d'un bien existant
        const { error } = await supabase
          .from("real_estate")
          .update(payload)
          .eq("id", data.id);
          
        if (error) throw error;
      } else {
        // Ajout d'un nouveau bien
        const { error } = await supabase
          .from("real_estate")
          .insert(payload);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["real-estate"] });
      toast({
        title: "Opération réussie",
        description: "Le bien a été enregistré avec succès",
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

export function usePropertyDeletion(onSuccess: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (propertyId: string) => {
      const { error } = await supabase
        .from("real_estate")
        .delete()
        .eq("id", propertyId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["real-estate"] });
      toast({
        title: "Bien supprimé",
        description: "Le bien a été supprimé avec succès",
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

// Fonction utilitaire pour calculer la mensualité
function calculateMonthlyPayment(loanAmount: number, loanRate: number, loanDuration: number): number | null {
  if (isNaN(loanAmount) || isNaN(loanRate) || isNaN(loanDuration) || 
      loanAmount <= 0 || loanRate <= 0 || loanDuration <= 0) {
    return null;
  }
  
  const monthlyRate = loanRate / 100 / 12;
  const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanDuration) / 
                       (Math.pow(1 + monthlyRate, loanDuration) - 1);
  
  return Math.round(monthlyPayment * 100) / 100;
}
