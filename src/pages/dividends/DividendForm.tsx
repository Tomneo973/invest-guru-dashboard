import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { dividendSchema, currencies } from "./schema";

type DividendFormProps = {
  onSuccess: () => void;
  initialData?: {
    id: string;
    symbol: string;
    amount: number;
    currency: string;
    date: string;
  };
};

export function DividendForm({ onSuccess, initialData }: DividendFormProps) {
  const form = useForm({
    resolver: zodResolver(dividendSchema),
    defaultValues: initialData ? {
      symbol: initialData.symbol,
      amount: initialData.amount,
      currency: initialData.currency,
      date: initialData.date,
    } : {
      symbol: "",
      amount: 0,
      currency: "USD",
      date: new Date().toISOString().split("T")[0],
    },
  });

  // Fetch user's stocks
  const { data: userStocks } = useQuery({
    queryKey: ["userStocks"],
    queryFn: async () => {
      const { data: transactions } = await supabase
        .from("transactions")
        .select("symbol")
        .eq("type", "buy");
      
      if (!transactions) return [];
      
      // Get unique symbols
      const symbols = [...new Set(transactions.map(t => t.symbol))];
      return symbols;
    },
  });

  async function onSubmit(values: any) {
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
      form.reset();
      onSuccess();
    } catch (error) {
      console.error("Error adding/updating dividend:", error);
      toast.error("Une erreur est survenue");
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="symbol"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Action</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une action" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {userStocks?.map((symbol) => (
                    <SelectItem key={symbol} value={symbol}>
                      {symbol}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Input type="number" step="0.01" {...field} />
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
                    <SelectValue placeholder="Sélectionnez une devise" />
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

        <Button type="submit" className="w-full">
          {initialData ? "Modifier le dividende" : "Ajouter le dividende"}
        </Button>
      </form>
    </Form>
  );
}