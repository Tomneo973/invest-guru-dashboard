
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { Plus, Home, LineChart, Filter } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { PropertyCard } from "./components/PropertyCard";
import { PropertyDialog } from "./components/PropertyDialog";
import { RealEstateProperty } from "./types";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

  const filteredProperties = properties?.filter((property) => {
    switch (filter) {
      case "rented":
        return property.is_rented && !property.is_sold;
      case "not_rented":
        return !property.is_rented && !property.is_sold;
      case "sold":
        return property.is_sold;
      default:
        return true;
    }
  });

  const handlePropertyClick = (property: RealEstateProperty) => {
    setSelectedProperty(property);
    setIsDialogOpen(true);
  };

  const handleAddNew = () => {
    setSelectedProperty(null);
    setIsDialogOpen(true);
  };

  // Calcul des statistiques globales
  const calculateStats = () => {
    if (!properties || properties.length === 0) return {
      totalProperties: 0,
      totalValue: 0,
      totalRented: 0,
      totalSold: 0,
      totalInvested: 0,
      totalMonthlyRent: 0,
      totalCapitalGain: 0,
      totalRentsCollected: 0,
      monthlyRevenue: 0,
      monthlyExpenses: 0,
    };

    const stats = properties.reduce(
      (acc, property) => {
        // Comptage par statut
        if (property.is_sold) {
          acc.totalSold += 1;
        } else {
          if (property.is_rented) acc.totalRented += 1;
        }

        // Valeurs financières
        acc.totalInvested += property.purchase_price;
        
        // Pour les biens vendus
        if (property.is_sold && property.sale_price) {
          acc.totalCapitalGain += property.sale_price - property.purchase_price;
        }
        
        // Loyers
        if (property.is_rented && property.monthly_rent) {
          acc.totalMonthlyRent += property.monthly_rent;
        }
        
        acc.totalRentsCollected += property.total_rents_collected || 0;
        
        // Mensualités
        if (!property.is_sold && property.monthly_payment) {
          acc.monthlyExpenses += property.monthly_payment;
        }

        return acc;
      },
      {
        totalProperties: properties.length,
        totalValue: 0,
        totalRented: 0,
        totalSold: 0,
        totalInvested: 0,
        totalMonthlyRent: 0,
        totalCapitalGain: 0,
        totalRentsCollected: 0,
        monthlyRevenue: 0,
        monthlyExpenses: 0,
      }
    );
    
    // Calcul des valeurs dérivées
    stats.monthlyRevenue = stats.totalMonthlyRent;
    stats.totalValue = stats.totalInvested - stats.totalCapitalGain;
    
    return stats;
  };

  const stats = calculateStats();
  
  // Formatter pour les montants en euros
  const formatter = new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  });

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
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Patrimoine total
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(stats.totalInvested)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalProperties} bien{stats.totalProperties > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Cash-flow mensuel
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.monthlyRevenue - stats.monthlyExpenses >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatter.format(stats.monthlyRevenue - stats.monthlyExpenses)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {formatter.format(stats.monthlyRevenue)} revenus / {formatter.format(stats.monthlyExpenses)} charges
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total loyers perçus
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatter.format(stats.totalRentsCollected)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalRented} bien{stats.totalRented > 1 ? "s" : ""} en location
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Plus-value réalisée
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${stats.totalCapitalGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {formatter.format(stats.totalCapitalGain)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.totalSold} bien{stats.totalSold > 1 ? "s" : ""} vendu{stats.totalSold > 1 ? "s" : ""}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filtres */}
      <div>
        <Tabs value={filter} onValueChange={(v) => setFilter(v as any)} className="w-full">
          <TabsList className="w-full md:w-auto grid grid-cols-4 h-9">
            <TabsTrigger value="all" className="text-xs md:text-sm">Tous</TabsTrigger>
            <TabsTrigger value="rented" className="text-xs md:text-sm">Loués</TabsTrigger>
            <TabsTrigger value="not_rented" className="text-xs md:text-sm">Non loués</TabsTrigger>
            <TabsTrigger value="sold" className="text-xs md:text-sm">Vendus</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-48 animate-pulse bg-gray-200 rounded-lg" />
          ))}
        </div>
      ) : filteredProperties && filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onClick={() => handlePropertyClick(property)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <Home className="h-12 w-12 mx-auto text-gray-300" />
          <h3 className="mt-4 text-lg font-medium">
            {filter === "all" ? "Aucun bien immobilier" : filter === "rented" ? "Aucun bien en location" : filter === "sold" ? "Aucun bien vendu" : "Aucun bien non loué"}
          </h3>
          <p className="mt-2 text-sm text-gray-500">
            {filter === "all" ? "Commencez par ajouter un bien immobilier" : "Changez de filtre pour voir d'autres biens"}
          </p>
          {filter === "all" && (
            <Button onClick={handleAddNew} className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Ajouter un bien
            </Button>
          )}
        </div>
      )}

      <PropertyDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        property={selectedProperty}
      />
    </div>
  );
}
