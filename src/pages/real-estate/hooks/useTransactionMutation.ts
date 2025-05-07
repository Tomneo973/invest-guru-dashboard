
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface TransactionFormData {
  id?: string;
  property_id: string;
  date: string;
  amount: number;
  type: "expense" | "income";
  category: string;
  description?: string;
}

export function useTransactionMutation(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TransactionFormData) => {
      // Récupérer l'utilisateur actuel
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error("Utilisateur non authentifié");
      
      const payload = {
        property_id: data.property_id,
        user_id: user.id,
        date: data.date,
        amount: data.amount,
        type: data.type,
        category: data.category,
        description: data.description || null
      };

      if (data.id) {
        // Mise à jour d'une transaction existante
        const { error } = await supabase
          .from("real_estate_transactions")
          .update(payload)
          .eq("id", data.id);
          
        if (error) throw error;
      } else {
        // Ajout d'une nouvelle transaction
        const { error } = await supabase
          .from("real_estate_transactions")
          .insert(payload);
          
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-transactions"] });
      toast({
        title: "Opération réussie",
        description: "La transaction a été enregistrée avec succès",
      });
      if (onSuccess) onSuccess();
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

export function useTransactionDeletion(onSuccess?: () => void) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (transactionId: string) => {
      const { error } = await supabase
        .from("real_estate_transactions")
        .delete()
        .eq("id", transactionId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["property-transactions"] });
      toast({
        title: "Transaction supprimée",
        description: "La transaction a été supprimée avec succès",
      });
      if (onSuccess) onSuccess();
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
