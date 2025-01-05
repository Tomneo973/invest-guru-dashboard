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
import { useToast } from "@/hooks/use-toast";
import { dividendFormSchema } from "./schema";
import type { z } from "zod";

type FormData = z.infer<typeof dividendFormSchema>;

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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(dividendFormSchema),
    defaultValues: {
      symbol: initialData?.symbol ?? "",
      amount: initialData?.amount ?? 0,
      currency: initialData?.currency ?? "EUR",
      date: initialData?.date ?? new Date().toISOString().split("T")[0],
      withheld_taxes: initialData?.withheld_taxes ?? 0,
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

      if (initialData) {
        const { error } = await supabase
          .from("dividends")
          .update({
            symbol: data.symbol,
            amount: data.amount,
            currency: data.currency,
            date: data.date,
            withheld_taxes: data.withheld_taxes,
          })
          .eq("id", initialData.id);

        if (error) throw error;

        toast({
          title: "Dividende modifié avec succès",
        });
      } else {
        const { error } = await supabase.from("dividends").insert({
          user_id: user.user.id,
          symbol: data.symbol,
          amount: data.amount,
          currency: data.currency,
          date: data.date,
          withheld_taxes: data.withheld_taxes,
        });

        if (error) throw error;

        toast({
          title: "Dividende ajouté avec succès",
        });
      }

      queryClient.invalidateQueries({ queryKey: ["dividends"] });
      form.reset();
      onSuccess?.();
    } catch (error) {
      console.error("Error adding/updating dividend:", error);
      toast({
        title: "Erreur lors de l'ajout/modification du dividende",
        variant: "destructive",
      });
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
                <Input {...field} type="date" />
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
              <FormLabel>Montant brut</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  placeholder="0.00"
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
                  {...field}
                  type="number"
                  step="0.01"
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  placeholder="0.00"
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
              <FormControl>
                <Input {...field} placeholder="EUR" />
              </FormControl>
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