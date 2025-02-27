
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";

const formSchema = z.object({
  symbol: z.string().min(1, "Le symbole est requis").max(20),
});

type FormValues = z.infer<typeof formSchema>;

interface StockSearchFormProps {
  onSubmit: (symbol: string) => void;
  isLoading: boolean;
}

export function StockSearchForm({ onSubmit, isLoading }: StockSearchFormProps) {
  const [stockSymbol, setStockSymbol] = useState("");

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      symbol: "",
    },
  });

  const handleSubmit = (values: FormValues) => {
    const symbol = values.symbol.trim().toUpperCase();
    setStockSymbol(symbol);
    onSubmit(symbol);
    toast({
      title: "Recherche en cours",
      description: `Récupération des données pour ${symbol}...`,
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Analyse d'action</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="flex items-center space-x-2">
            <FormField
              control={form.control}
              name="symbol"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormControl>
                    <Input
                      {...field}
                      placeholder="Entrez le symbole boursier (ex: AAPL, MSFT)"
                      disabled={isLoading}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading}>
              <Search className="h-4 w-4 mr-2" />
              Analyser
            </Button>
          </form>
        </Form>
        <div className="mt-4 text-sm text-gray-500">
          <p>Entrez un symbole boursier pour analyser les données financières de l'entreprise et calculer un prix juste basé sur le ratio P/E et le BPA (EPS).</p>
          <p className="mt-1">Exemples: AAPL (Apple), MSFT (Microsoft), AMZN (Amazon), GOOGL (Alphabet), FB (Meta)</p>
        </div>
      </CardContent>
    </Card>
  );
}
