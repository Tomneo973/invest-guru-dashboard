
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerTrigger } from "@/components/ui/drawer";
import { DividendForm } from "./DividendForm";
import { DividendList } from "./DividendList";
import { useIsMobile } from "@/hooks/use-mobile";

export default function DividendsPage() {
  const [open, setOpen] = useState(false);
  const isMobile = useIsMobile();

  // Utilise Dialog pour desktop et Drawer pour mobile
  const DividendModal = isMobile ? (
    <Drawer open={open} onOpenChange={setOpen}>
      <DrawerTrigger asChild>
        <Button size={isMobile ? "sm" : "default"}>
          <Plus className="mr-2 h-4 w-4" />
          {isMobile ? "Ajouter" : "Nouveau dividende"}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>Ajouter un dividende</DrawerTitle>
        </DrawerHeader>
        <div className="px-4 pb-4">
          <DividendForm onSuccess={() => setOpen(false)} />
        </div>
      </DrawerContent>
    </Drawer>
  ) : (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nouveau dividende
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Ajouter un dividende</DialogTitle>
        </DialogHeader>
        <DividendForm onSuccess={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Dividendes</h1>
        {DividendModal}
      </div>
      <DividendList />
    </div>
  );
}
