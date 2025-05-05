
import { TabsContent } from "@/components/ui/tabs";
import { RealEstateProperty } from "../../types";
import { PropertyPerformanceChart } from "../PropertyPerformanceChart";
import { LoanRepaymentSchedule } from "../LoanRepaymentSchedule";
import { RentalIncomeSchedule } from "../RentalIncomeSchedule";
import { PropertyForm } from "./PropertyForm";
import { NeighborhoodPrices } from "../NeighborhoodPrices";

interface PropertyDialogTabsProps {
  activeTab: string;
  property: RealEstateProperty | null;
  handleSubmit: (e: React.FormEvent, formData: any, isRented: boolean, isSold: boolean) => void;
  handleCloseDialog: () => void;
  isPending: boolean;
}

export function PropertyDialogTabs({
  activeTab,
  property,
  handleSubmit,
  handleCloseDialog,
  isPending
}: PropertyDialogTabsProps) {
  const isEditing = !!property;

  // Calcul du prix au mètre carré pour le bien
  const pricePerSqm = property && property.surface_area && property.surface_area > 0 
    ? Math.round((property.purchase_price / property.surface_area) * 100) / 100
    : null;

  return (
    <>
      <TabsContent value="general">
        <PropertyForm 
          property={property}
          onSubmit={handleSubmit}
          onCancel={handleCloseDialog}
          isPending={isPending}
        />
      </TabsContent>
      
      {isEditing && property && (
        <>
          <TabsContent value="performance">
            <div className="space-y-6">
              <PropertyPerformanceChart property={property} />
              {property.address && (
                <NeighborhoodPrices 
                  propertyAddress={property.address} 
                  propertyPricePerSqm={pricePerSqm}
                />
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="loan">
            <LoanRepaymentSchedule property={property} />
          </TabsContent>
          
          <TabsContent value="rental">
            <RentalIncomeSchedule property={property} />
          </TabsContent>
        </>
      )}
    </>
  );
}
