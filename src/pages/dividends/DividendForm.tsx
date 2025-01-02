import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { dividendFormSchema } from "./schema";
import type { z } from "zod";

type FormData = z.infer<typeof dividendFormSchema>;

interface DividendFormProps {
  onSuccess?: () => void;
}

export function DividendForm({ onSuccess }: DividendFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(dividendFormSchema),
    defaultValues: {
      symbol: "",
      amount: 0,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
    },
  });

  const onSubmit = async (data: FormData) => {
    try {
      const { data: user } = await supabase.auth.getUser();
      if (!user.user) {
        toast({
          title: "Vous devez être connecté pour ajouter un dividende",
          variant: "destructive",
        });
        return;
      }

      const { error } = await supabase.from("dividends").insert({
        user_id: user.user.id,
        symbol: data.symbol,
        amount: data.amount,
        currency: data.currency,
        date: data.date,
      });

      if (error) throw error;

      toast({
        title: "Dividende ajouté avec succès",
      });

      queryClient.invalidateQueries({ queryKey: ["dividends"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding dividend:", error);
      toast({
        title: "Erreur lors de l'ajout du dividende",
        variant: "destructive",
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Symbole</FormLabel>
              <FormControl>
                <Input {...field} placeholder="AAPL" />
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
              <FormLabel>Montant</FormLabel>
              <FormControl>
                <Input {...field} type="number" step="0.01" placeholder="0.00" />
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
              <FormControl>
                <Input {...field} placeholder="USD" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date de versement</FormLabel>
              <FormControl>
                <Input {...field} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" className="w-full">
          Ajouter le dividende
        </Button>
      </form>
    </Form>
  );
}