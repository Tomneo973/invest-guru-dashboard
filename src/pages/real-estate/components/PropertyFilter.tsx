
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface PropertyFilterProps {
  filter: "all" | "rented" | "not_rented" | "sold";
  onFilterChange: (value: "all" | "rented" | "not_rented" | "sold") => void;
}

export function PropertyFilter({ filter, onFilterChange }: PropertyFilterProps) {
  return (
    <Tabs value={filter} onValueChange={(v) => onFilterChange(v as any)} className="w-full">
      <TabsList className="w-full md:w-auto grid grid-cols-4 h-9">
        <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
        <TabsTrigger value="rented" className="text-xs md:text-sm">Loués</TabsTrigger>
        <TabsTrigger value="not_rented" className="text-xs md:text-sm">Non loués</TabsTrigger>
        <TabsTrigger value="sold" className="text-xs md:text-sm">Vendus</TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
