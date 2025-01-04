import * as z from "zod";

export const dividendFormSchema = z.object({
  date: z.string().min(1, "La date est requise"),
  symbol: z.string().min(1, "Le symbole est requis"),
  amount: z.number().min(0, "Le montant doit être positif"),
  currency: z.string().min(1, "La devise est requise"),
});