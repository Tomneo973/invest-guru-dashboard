
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useState } from "react";
import { RealEstateProperty } from "../types";
import { Trash2 } from "lucide-react";
import { usePropertyMutation, usePropertyDeletion } from "../hooks/usePropertyMutation";
import { PropertyDialogTabs } from "./property-dialog/PropertyDialogTabs";
import { DeletePropertyDialog } from "./property-dialog/DeletePropertyDialog";

interface PropertyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  property?: RealEstateProperty | null;
}

export function PropertyDialog({
  open,
  onOpenChange,
  property,
}: PropertyDialogProps) {
  const isEditing = !!property;
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("general");

  const handleCloseDialog = () => {
    onOpenChange(false);
    setActiveTab("general");
  };

  const mutation = usePropertyMutation(() => {
    handleCloseDialog();
  });

  const deleteMutation = usePropertyDeletion(() => {
    handleCloseDialog();
  });

  const handleSubmit = (e: React.FormEvent, formData: any, isRented: boolean, isSold: boolean) => {
    e.preventDefault();
    mutation.mutate({
      ...formData,
      is_rented: isRented,
      is_sold: isSold,
    });
  };

  const handleDelete = () => {
    if (property?.id) {
      deleteMutation.mutate(property.id);
      setIsDeleteDialogOpen(false);
    }
  };

  const tabOptions = [
    { id: "general", label: "Informations générales" },
    { id: "performance", label: "Performance & Analyse" },
  ];

  if (isEditing && property) {
    // Onglet pour les transactions
    tabOptions.push({ id: "transactions", label: "Transactions" });
    
    if (property.loan_amount && property.loan_rate && property.loan_duration_months) {
      tabOptions.push({ id: "loan", label: "Plan de remboursement" });
    }
    
    if (property.is_rented && property.monthly_rent) {
      tabOptions.push({ id: "rental", label: "Plan des loyers" });
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl overflow-y-auto max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex justify-between items-center">
              <span>{isEditing ? "Modifier le bien" : "Ajouter un bien"}</span>
              {isEditing && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => setIsDeleteDialogOpen(true)}
                >
                  <Trash2 className="h-4 w-4" />
                  Supprimer
                </Button>
              )}
            </DialogTitle>
          </DialogHeader>

          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-5 mb-4">
              {tabOptions.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <PropertyDialogTabs
              activeTab={activeTab}
              property={property || null}
              handleSubmit={handleSubmit}
              handleCloseDialog={handleCloseDialog}
              isPending={mutation.isPending}
            />
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <DeletePropertyDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onDelete={handleDelete}
        isPending={deleteMutation.isPending}
      />
    </>
  );
}
