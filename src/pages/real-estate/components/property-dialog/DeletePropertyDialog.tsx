
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface DeletePropertyDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onDelete: () => void;
  isPending: boolean;
}

export function DeletePropertyDialog({
  isOpen,
  onOpenChange,
  onDelete,
  isPending,
}: DeletePropertyDialogProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce bien ?</AlertDialogTitle>
          <AlertDialogDescription>
            Cette action est irréversible. Toutes les informations associées à ce bien seront définitivement supprimées.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={onDelete} className="bg-destructive">
            {isPending ? "Suppression..." : "Supprimer"}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
