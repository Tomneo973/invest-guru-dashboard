
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subYears } from "date-fns";
import { fr } from "date-fns/locale";
import { RealEstateTransaction } from "../types";
import { RealEstateProperty } from "../types";

interface AnalysisData {
  summary: {
    totalIncome: number;
    totalExpenses: number;
    netProfit: number;
    yield: number;
  };
  expenseCategories: Array<{ name: string; value: number }>;
  incomeCategories: Array<{ name: string; value: number }>;
  monthlyData: Array<{
    month: string;
    income: number;
    expenses: number;
    profit: number;
  }>;
}

// Map des catégories pour l'affichage
const categoryLabels: Record<string, string> = {
  loan_payment: "Prêt",
  works: "Travaux",
  tax: "Taxes",
  insurance: "Assurance",
  maintenance: "Entretien",
  utilities: "Charges",
  rent: "Loyer",
  deposit: "Caution",
  subsidy: "Subvention",
  tax_refund: "Remboursement",
  other_expense: "Autre dépense",
  other_income: "Autre revenu"
};

export function useTransactionAnalysis(propertyId: string, timeframe: "1year" | "3years" | "5years" | "10years" | "all") {
  return useQuery({
    queryKey: ["property-transaction-analysis", propertyId, timeframe],
    queryFn: async () => {
      // Récupérer les transactions
      const { data: transactions, error: transactionsError } = await supabase
        .from("real_estate_transactions")
        .select("*")
        .eq("property_id", propertyId)
        .order("date", { ascending: true });

      if (transactionsError) throw transactionsError;

      // Récupérer les informations sur le bien immobilier
      const { data: propertyData, error: propertyError } = await supabase
        .from("real_estate")
        .select("*")
        .eq("id", propertyId)
        .single();

      if (propertyError) throw propertyError;

      const property = propertyData as RealEstateProperty;
      const allTransactions = transactions as RealEstateTransaction[];
      
      // Filtrer les transactions selon la période demandée
      const filteredTransactions = filterTransactionsByTimeframe(allTransactions, timeframe);
      
      if (filteredTransactions.length === 0) {
        return createEmptyAnalysis(property);
      }

      // Calculer le résumé
      const totalIncome = filteredTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const totalExpenses = filteredTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      const netProfit = totalIncome + totalExpenses; // totalExpenses est déjà négatif
      
      // Calculer le rendement (en fonction du prix d'achat)
      const purchasePrice = property.purchase_price || 1; // Éviter division par 0
      const years = getTimeframeYears(timeframe);
      const annualizedProfit = years ? netProfit / years : netProfit;
      const yield_ = (annualizedProfit / purchasePrice) * 100;

      // Agréger par catégories
      const expenseCategoriesMap = new Map<string, number>();
      const incomeCategoriesMap = new Map<string, number>();

      filteredTransactions.forEach((t) => {
        const map = t.type === 'income' ? incomeCategoriesMap : expenseCategoriesMap;
        const amount = t.type === 'income' ? t.amount : Math.abs(t.amount);
        const category = t.category;
        
        map.set(category, (map.get(category) || 0) + amount);
      });

      // Transformer les données pour les graphiques
      const expenseCategories = Array.from(expenseCategoriesMap.entries()).map(([key, value]) => ({
        name: categoryLabels[key] || key,
        value
      }));
      
      const incomeCategories = Array.from(incomeCategoriesMap.entries()).map(([key, value]) => ({
        name: categoryLabels[key] || key,
        value
      }));

      // Agréger par mois
      const monthlyDataMap = new Map<string, {
        income: number;
        expenses: number;
      }>();

      filteredTransactions.forEach((t) => {
        const monthKey = format(parseISO(t.date), 'MMM yyyy', { locale: fr });
        
        if (!monthlyDataMap.has(monthKey)) {
          monthlyDataMap.set(monthKey, { income: 0, expenses: 0 });
        }
        
        const current = monthlyDataMap.get(monthKey)!;
        
        if (t.type === 'income') {
          current.income += t.amount;
        } else {
          current.expenses += t.amount; // Les dépenses sont déjà négatives
        }
        
        monthlyDataMap.set(monthKey, current);
      });

      const monthlyData = Array.from(monthlyDataMap.entries())
        .map(([month, data]) => ({
          month,
          income: data.income,
          expenses: Math.abs(data.expenses), // Convertir en positif pour l'affichage
          profit: data.income + data.expenses // Les dépenses sont déjà négatives
        }));

      return {
        summary: {
          totalIncome,
          totalExpenses,
          netProfit,
          yield: yield_
        },
        expenseCategories,
        incomeCategories,
        monthlyData
      } as AnalysisData;
    },
  });
}

// Fonction pour filtrer les transactions selon la période
function filterTransactionsByTimeframe(
  transactions: RealEstateTransaction[],
  timeframe: "1year" | "3years" | "5years" | "10years" | "all"
): RealEstateTransaction[] {
  if (timeframe === "all" || transactions.length === 0) {
    return transactions;
  }

  const now = new Date();
  let startDate: Date;

  switch (timeframe) {
    case "1year":
      startDate = subYears(now, 1);
      break;
    case "3years":
      startDate = subYears(now, 3);
      break;
    case "5years":
      startDate = subYears(now, 5);
      break;
    case "10years":
      startDate = subYears(now, 10);
      break;
    default:
      return transactions;
  }

  return transactions.filter(t => 
    new Date(t.date) >= startDate
  );
}

// Fonction pour obtenir le nombre d'années d'une période
function getTimeframeYears(timeframe: "1year" | "3years" | "5years" | "10years" | "all"): number {
  switch (timeframe) {
    case "1year": return 1;
    case "3years": return 3;
    case "5years": return 5;
    case "10years": return 10;
    case "all": return 0; // On ne sait pas combien d'années au total
    default: return 0;
  }
}

// Créer une analyse vide
function createEmptyAnalysis(property: RealEstateProperty): AnalysisData {
  return {
    summary: {
      totalIncome: 0,
      totalExpenses: 0,
      netProfit: 0,
      yield: 0
    },
    expenseCategories: [],
    incomeCategories: [],
    monthlyData: []
  };
}
