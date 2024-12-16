import * as z from "zod";

export const dividendSchema = z.object({
  symbol: z.string().min(1, "L'action est requise"),
  amount: z.string().min(1, "Le montant est requis"),
  currency: z.string().min(1, "La devise est requise"),
  date: z.string(),
});

export type DividendFormValues = z.infer<typeof dividendSchema>;