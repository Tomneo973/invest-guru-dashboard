import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { TransactionFormFields } from "./TransactionFormFields";
import { TransactionFormValues, transactionSchema } from "./schema";
import { supabase } from "@/integrations/supabase/client";
import { useQueryClient } from "@tanstack/react-query";

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      type: "buy",
      symbol: "",
      shares: 0,
      price: 0,
      date: new Date().toISOString().split("T")[0],
      platform: "",
      currency: "USD",
      sector: "",
    },
  });

  const onSubmit = async (values: TransactionFormValues) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Vous devez être connecté pour ajouter une transaction");
        return;
      }

      // Ensure all required fields are present and correctly typed
      const transaction = {
        user_id: user.user.id,
        type: values.type,
        symbol: values.symbol,
        shares: values.shares,
        price: values.price,
        date: values.date,
        platform: values.platform,
        currency: values.currency,
        sector: values.sector,
      };

      const { error } = await supabase
        .from("transactions")
        .insert(transaction);

      if (error) throw error;

      toast.success("Transaction ajoutée avec succès");
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error adding transaction:", error);
      toast.error("Erreur lors de l'ajout de la transaction");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <TransactionFormFields form={form} />
        <div className="flex justify-end space-x-2">
          <Button type="submit">Ajouter la transaction</Button>
        </div>
      </form>
    </Form>
  );
}