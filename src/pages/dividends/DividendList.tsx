import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { DividendForm } from "./DividendForm";

type Dividend = {
  id: string;
  symbol: string;
  amount: number;
  currency: string;
  date: string;
};

export function DividendList() {
  const [editingDividend, setEditingDividend] = useState<Dividend | null>(null);

  const { data: dividends = [], isLoading } = useQuery({
    queryKey: ["dividends"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("dividends")
        .select("*")
        .order("date", { ascending: false });

      if (error) throw error;
      return data as Dividend[];
    },
  });

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
              <TableHead>Action</TableHead>
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
                  <TableCell>{dividend.amount}</TableCell>
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

      <Dialog open={!!editingDividend} onOpenChange={() => setEditingDividend(null)}>
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