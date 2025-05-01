
import { Button } from "@/components/ui/button";
import { Home, Plus } from "lucide-react";

interface EmptyStateProps {
  filter: "all" | "rented" | "not_rented" | "sold";
  onAddNew: () => void;
}

export function EmptyState({ filter, onAddNew }: EmptyStateProps) {
  return (
    <div className="text-center py-12">
      <Home className="h-12 w-12 mx-auto text-gray-300" />
      <h3 className="mt-4 text-lg font-medium">
        {filter === "all" 
          ? "Aucun bien immobilier" 
          : filter === "rented" 
          ? "Aucun bien en location" 
          : filter === "sold" 
          ? "Aucun bien vendu" 
          : "Aucun bien non loué"}
      </h3>
      <p className="mt-2 text-sm text-gray-500">
        {filter === "all" 
          ? "Commencez par ajouter un bien immobilier" 
          : "Changez de filtre pour voir d'autres biens"}
      </p>
      {filter === "all" && (
        <Button onClick={onAddNew} className="mt-4">
          <Plus className="h-4 w-4 mr-2" />
          Ajouter un bien
        </Button>
      )}
    </div>
  );
}
