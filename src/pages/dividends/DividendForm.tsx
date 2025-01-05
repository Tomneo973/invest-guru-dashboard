import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { DividendFormValues, dividendFormSchema, currencies } from "./schema";

interface DividendFormProps {
  initialData?: {
    id: string;
    symbol: string;
    amount: number;
    currency: string;
    date: string;
    withheld_taxes: number;
  };
  onSuccess?: () => void;
}

export function DividendForm({ initialData, onSuccess }: DividendFormProps) {
  const queryClient = useQueryClient();
  const form = useForm<DividendFormValues>({
    resolver: zodResolver(dividendFormSchema),
    defaultValues: initialData ? {
      symbol: initialData.symbol,
      amount: initialData.amount,
      currency: initialData.currency,
      date: initialData.date,
      withheld_taxes: initialData.withheld_taxes,
    } : {
      symbol: "",
      amount: 0,
      currency: "EUR",
      date: new Date().toISOString().split("T")[0],
      withheld_taxes: 0,
    },
  });

  const onSubmit = async (values: DividendFormValues) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast.error("Vous devez être connecté pour ajouter un dividende");
        return;
      }

      const dividend = {
        user_id: user.user.id,
        symbol: values.symbol,
        amount: values.amount,
        currency: values.currency,
        date: values.date,
        withheld_taxes: values.withheld_taxes,
      };

      const { error } = initialData 
        ? await supabase
            .from("dividends")
            .update(dividend)
            .eq('id', initialData.id)
        : await supabase
            .from("dividends")
            .insert(dividend);

      if (error) throw error;

      toast.success(initialData ? "Dividende modifié avec succès" : "Dividende ajouté avec succès");
      queryClient.invalidateQueries({ queryKey: ["dividends"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding/updating dividend:", error);
      toast.error("Erreur lors de l'ajout/modification du dividende");
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de versement</FormLabel>
              <FormControl>
                <Input type="date" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbole</FormLabel>
              <FormControl>
                <Input placeholder="AAPL" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Montant brut</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="withheld_taxes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Taxes retenues</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  value={field.value}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="currency"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Devise</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner la devise" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {currencies.map((currency) => (
                    <SelectItem key={currency} value={currency}>
                      {currency}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          {initialData ? "Modifier" : "Ajouter"} le dividende
        </Button>
      </form>
    </Form>
  );
}