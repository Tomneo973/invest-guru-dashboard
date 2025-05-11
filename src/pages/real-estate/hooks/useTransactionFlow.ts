
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, subMonths } from "date-fns";
import { fr } from "date-fns/locale";
import { RealEstateTransaction } from "../types";
import { useToast } from "@/components/ui/use-toast";

interface FlowDataPoint {
  date: string;
  income: number;
  expense: number;
  balance: number;
  cumulativeBalance: number;
}

export function useTransactionFlow(propertyId: string) {
  const { toast } = useToast();
  
  return useQuery({
    queryKey: ["property-transaction-flow", propertyId],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from("real_estate_transactions")
          .select("*")
          .eq("property_id", propertyId)
          .order("date", { ascending: true });

        if (error) throw error;
        
        const transactions = data as RealEstateTransaction[];
        
        if (transactions.length === 0) {
          return [];
        }

        // Créer un tableau pour stocker le flux de trésorerie
        const flowByDate = new Map<string, FlowDataPoint>();
        let cumulativeBalance = 0;

        // Agréger les transactions par date
        transactions.forEach((transaction) => {
          const dateKey = transaction.date;
          const amount = transaction.amount;
          
          if (!flowByDate.has(dateKey)) {
            flowByDate.set(dateKey, {
              date: format(parseISO(dateKey), 'dd/MM/yyyy', { locale: fr }),
              income: 0,
              expense: 0,
              balance: 0,
              cumulativeBalance: 0
            });
          }
          
          const currentFlow = flowByDate.get(dateKey)!;
          
          if (transaction.type === 'income') {
            currentFlow.income += amount;
          } else {
            currentFlow.expense += Math.abs(amount);
          }
          
          currentFlow.balance += amount;
          flowByDate.set(dateKey, currentFlow);
        });

        // Convertir la Map en tableau et ajouter le solde cumulatif
        const flowData = Array.from(flowByDate.entries())
          .sort(([dateA], [dateB]) => dateA.localeCompare(dateB))
          .map(([_, value]) => {
            cumulativeBalance += value.balance;
            return {
              ...value,
              cumulativeBalance
            };
          });
        
        return flowData;
      } catch (error) {
        console.error("Error fetching transaction flow:", error);
        toast({
          title: "Erreur",
          description: "Impossible de récupérer le flux de trésorerie.",
          variant: "destructive",
        });
        return [];
      }
    },
  });
}
