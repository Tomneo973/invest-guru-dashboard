import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { TransactionFormFields } from "./TransactionFormFields";
import { TransactionFormValues, transactionSchema } from "./schema";

interface TransactionFormProps {
  onSuccess: () => void;
}

export function TransactionForm({ onSuccess }: TransactionFormProps) {
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

  const onSubmit = async (data: TransactionFormValues) => {
    try {
      console.log("Transaction data:", data);
      // TODO: Implement transaction submission
      toast.success("Transaction ajoutée avec succès");
      onSuccess();
    } catch (error) {
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