import * as z from "zod";

export const dividendSchema = z.object({
  symbol: z.string().min(1, "L'action est requise"),
  amount: z.coerce.number().min(0.01, "Le montant doit être supérieur à 0"),
  currency: z.string().min(1, "La devise est requise"),
  date: z.string().min(1, "La date est requise"),
});

export type DividendFormValues = z.infer<typeof dividendSchema>;

export const currencies = ["USD", "EUR", "GBP", "CHF"];