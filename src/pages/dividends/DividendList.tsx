import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { DividendForm } from "./DividendForm";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Dividend = {
  id: string;
  symbol: string;
  amount: number;
  currency: string;
  date: string;
};

async function fetchDividends() {
  const { data, error } = await supabase
    .from("dividends")
    .select("*")
    .order("date", { ascending: false });

  if (error) throw error;
  return data as Dividend[];
}

export function DividendList() {
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);
  const { data: dividends = [], isLoading, error } = useQuery({
    queryKey: ["dividends"],
    queryFn: fetchDividends,
  });

  if (error) {
    console.error("Error fetching dividends:", error);
    return <div>Erreur lors du chargement des dividendes</div>;
  }

  const handleEdit = (dividend: Dividend) => {
    setEditingDividend(dividend);
  };

  const handleEditComplete = () => {
    setEditingDividend(null);
  };

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Symbole</TableHead>
              <TableHead>Montant</TableHead>
              <TableHead>Devise</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Chargement...
                </TableCell>
              </TableRow>
            ) : dividends.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center">
                  Aucun dividende
                </TableCell>
              </TableRow>
            ) : (
              dividends.map((dividend) => (
                <TableRow key={dividend.id}>
                  <TableCell>
                    {format(new Date(dividend.date), "dd MMM yyyy", {
                      locale: fr,
                    })}
                  </TableCell>
                  <TableCell>{dividend.symbol}</TableCell>
                  <TableCell>
                    {dividend.amount.toLocaleString()} {dividend.currency}
                  </TableCell>
                  <TableCell>{dividend.currency}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleEdit(dividend)}
                    >
                      <Edit2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={!!editingDividend}
        onOpenChange={() => setEditingDividend(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Modifier le dividende</DialogTitle>
          </DialogHeader>
          {editingDividend && (
            <DividendForm
              initialData={editingDividend}
              onSuccess={handleEditComplete}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}