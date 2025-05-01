
import { TabsContent } from "@/components/ui/tabs";
import { RealEstateProperty } from "../../types";
import { PropertyPerformanceChart } from "../PropertyPerformanceChart";
import { LoanRepaymentSchedule } from "../LoanRepaymentSchedule";
import { RentalIncomeSchedule } from "../RentalIncomeSchedule";
import { PropertyForm } from "./PropertyForm";

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
            <PropertyPerformanceChart property={property} />
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
