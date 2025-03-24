
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { TransactionForm } from "./TransactionForm";
import { TransactionList } from "./TransactionList";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { Plus } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function TransactionsPage() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Utilise Dialog pour desktop et Drawer pour mobile
  const TransactionModal = isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={isMobile ? "sm" : "default"}>
          <Plus className="mr-2 h-4 w-4" />
          {isMobile ? "Ajouter" : "Nouvelle transaction"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Ajouter une transaction</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <TransactionForm onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouvelle transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Ajouter une transaction</DialogTitle>
        </DialogHeader>
        <TransactionForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Transactions</h1>
        {TransactionModal}
      </div>
      <TransactionList />
    </div>
  );
}
