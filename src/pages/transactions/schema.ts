import * as z from "zod";

export const transactionSchema = z.object({
  type: z.enum(["buy", "sell"]),
  symbol: z.string().min(1, "Le symbole est requis"),
  shares: z.coerce.number().min(0.01, "Le nombre d'actions doit être supérieur à 0"),
  price: z.coerce.number().min(0.01, "Le prix doit être supérieur à 0"),
  date: z.string(),
  platform: z.string().min(1, "La plateforme est requise"),
  currency: z.string().min(1, "La devise est requise"),
  sector: z.string().min(1, "Le secteur est requis"),
});

export type TransactionFormValues = z.infer<typeof transactionSchema>;

export const currencies = ["USD", "EUR", "GBP", "CHF"];

export const sectors = [
  "Technology",
  "Healthcare",
  "Finance",
  "Consumer Discretionary",
  "Consumer Staples",
  "Industrials",
  "Energy",
  "Materials",
  "Utilities",
  "Real Estate",
  "Communication Services",
];