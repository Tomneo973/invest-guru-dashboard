
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useTransactionMutation } from "../../hooks/useTransactionMutation";
import { format } from "date-fns";

interface TransactionFormProps {
  propertyId: string;
  initialData?: {
    id: string;
    date: string;
    amount: number;
    type: "expense" | "income";
    category: string;
    description?: string;
  };
  onSuccess: () => void;
}

export function TransactionForm({ 
  propertyId, 
  initialData, 
  onSuccess 
}: TransactionFormProps) {
  const [date, setDate] = useState(initialData?.date || format(new Date(), 'yyyy-MM-dd'));
  const [amount, setAmount] = useState(initialData?.amount?.toString() || "");
  const [type, setType] = useState<"expense" | "income">(initialData?.type || "expense");
  const [category, setCategory] = useState(initialData?.category || "");
  const [description, setDescription] = useState(initialData?.description || "");

  const { mutate, isPending } = useTransactionMutation(onSuccess);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount || !date || !category) return;

    mutate({
      id: initialData?.id,
      property_id: propertyId,
      date,
      amount: type === "expense" ? -Math.abs(parseFloat(amount)) : Math.abs(parseFloat(amount)),
      type,
      category,
      description
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="date">Date</Label>
          <Input 
            id="date" 
            type="date" 
            value={date} 
            onChange={(e) => setDate(e.target.value)} 
            required 
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="amount">Montant (€)</Label>
          <Input 
            id="amount" 
            type="number" 
            step="0.01"
            value={amount} 
            onChange={(e) => setAmount(e.target.value)} 
            required 
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Type</Label>
          <Select value={type} onValueChange={(value: "expense" | "income") => setType(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner un type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="expense">Dépense</SelectItem>
              <SelectItem value="income">Revenu</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="category">Catégorie</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Sélectionner une catégorie" />
            </SelectTrigger>
            <SelectContent>
              {type === "expense" ? (
                <>
                  <SelectItem value="loan_payment">Remboursement de prêt</SelectItem>
                  <SelectItem value="works">Travaux</SelectItem>
                  <SelectItem value="tax">Impôts et taxes</SelectItem>
                  <SelectItem value="insurance">Assurance</SelectItem>
                  <SelectItem value="maintenance">Entretien</SelectItem>
                  <SelectItem value="utilities">Charges</SelectItem>
                  <SelectItem value="other_expense">Autre dépense</SelectItem>
                </>
              ) : (
                <>
                  <SelectItem value="rent">Loyer</SelectItem>
                  <SelectItem value="deposit">Caution</SelectItem>
                  <SelectItem value="subsidy">Subvention</SelectItem>
                  <SelectItem value="tax_refund">Remboursement d'impôts</SelectItem>
                  <SelectItem value="other_income">Autre revenu</SelectItem>
                </>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description</Label>
        <Textarea 
          id="description" 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          placeholder="Description optionnelle..."
          rows={3}
        />
      </div>

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" type="button" onClick={onSuccess}>
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isPending ? "Enregistrement..." : initialData ? "Modifier" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
