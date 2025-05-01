
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyDialog } from "./components/PropertyDialog";
import { RealEstateProperty } from "./types";
import { RealEstateStats } from "./components/stats/RealEstateStats";
import { PropertyFilter } from "./components/PropertyFilter";
import { PropertyList } from "./components/PropertyList";
import { usePropertyStats } from "./hooks/usePropertyStats";
import { useFilteredProperties } from "./hooks/useFilteredProperties";

export default function RealEstatePage() {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<RealEstateProperty | null>(null);
  const [filter, setFilter] = useState<"all" | "rented" | "not_rented" | "sold">("all");

  const { data: properties, isLoading } = useQuery({
    queryKey: ["real-estate"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("real_estate")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as RealEstateProperty[];
    },
  });

  const filteredProperties = useFilteredProperties(properties, filter);
  const stats = usePropertyStats(properties);

  const handlePropertyClick = (property: RealEstateProperty) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProperty(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl sm:text-3xl font-bold">Patrimoine Immobilier</h1>
        <Button onClick={handleAddNew}>
          <Plus className="w-4 h-4 mr-2" />
          Ajouter un bien
        </Button>
      </div>

      {/* Statistiques globales */}
      <RealEstateStats
        totalProperties={stats.totalProperties}
        totalInvested={stats.totalInvested}
        totalRented={stats.totalRented}
        totalSold={stats.totalSold}
        totalMonthlyRent={stats.totalMonthlyRent}
        monthlyExpenses={stats.monthlyExpenses}
        totalRentsCollected={stats.totalRentsCollected}
        totalCapitalGain={stats.totalCapitalGain}
        totalTaxes={stats.totalTaxes}
        monthlyTaxes={stats.monthlyTaxes}
      />

      {/* Filtres */}
      <div>
        <PropertyFilter 
          filter={filter} 
          onFilterChange={(value) => setFilter(value)} 
        />
      </div>

      {/* Liste des propriétés */}
      <PropertyList
        properties={filteredProperties}
        isLoading={isLoading}
        filter={filter}
        onPropertyClick={handlePropertyClick}
        onAddNew={handleAddNew}
      />

      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={selectedProperty}
      />
    </div>
  );
}
