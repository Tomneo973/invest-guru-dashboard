
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { format } from "date-fns";
import { useState } from "react";
import { RealEstateProperty } from "../types";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { PropertyPerformanceChart } from "./PropertyPerformanceChart";
import { usePropertyMutation, usePropertyDeletion } from "../hooks/usePropertyMutation";
import { Trash2 } from "lucide-react";
import { LoanRepaymentSchedule } from "./LoanRepaymentSchedule";
import { RentalIncomeSchedule } from "./RentalIncomeSchedule";

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
  const [isRented, setIsRented] = useState(property?.is_rented ?? false);
  const [isSold, setIsSold] = useState(property?.is_sold ?? false);
  const [activeTab, setActiveTab] = useState("general");

  const [formData, setFormData] = useState({
    id: property?.id ?? "",
    name: property?.name ?? "",
    address: property?.address ?? "",
    purchase_price: property?.purchase_price ?? "",
    acquisition_date: property?.acquisition_date
      ? format(new Date(property.acquisition_date), "yyyy-MM-dd")
      : "",
    loan_amount: property?.loan_amount ?? "",
    loan_rate: property?.loan_rate ?? "",
    loan_duration_months: property?.loan_duration_months ?? "",
    loan_start_date: property?.loan_start_date
      ? format(new Date(property.loan_start_date), "yyyy-MM-dd")
      : "",
    monthly_rent: property?.monthly_rent ?? "",
    repaid_capital: property?.repaid_capital ?? "",
    total_rents_collected: property?.total_rents_collected ?? "",
    sale_price: property?.sale_price ?? "",
    sale_date: property?.sale_date 
      ? format(new Date(property.sale_date), "yyyy-MM-dd")
      : "",
  });

  const calculateMonthlyPayment = (): number | null => {
    const loanAmount = parseFloat(formData.loan_amount.toString());
    const loanRate = parseFloat(formData.loan_rate.toString());
    const loanDuration = parseInt(formData.loan_duration_months.toString());
    
    if (isNaN(loanAmount) || isNaN(loanRate) || isNaN(loanDuration) || loanAmount <= 0 || loanRate <= 0 || loanDuration <= 0) {
      return null;
    }
    
    const monthlyRate = loanRate / 100 / 12;
    const monthlyPayment = loanAmount * monthlyRate * Math.pow(1 + monthlyRate, loanDuration) / 
                         (Math.pow(1 + monthlyRate, loanDuration) - 1);
    
    return Math.round(monthlyPayment * 100) / 100;
  };

  const monthlyPayment = calculateMonthlyPayment();
  
  const calculateCapitalGain = (): number | null => {
    const purchasePrice = parseFloat(formData.purchase_price.toString());
    const salePrice = parseFloat(formData.sale_price.toString());
    
    if (isNaN(purchasePrice) || isNaN(salePrice)) {
      return null;
    }
    
    return salePrice - purchasePrice;
  };
  
  const capitalGain = isSold ? calculateCapitalGain() : null;

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

  const handleSubmit = (e: React.FormEvent) => {
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
            <TabsList className="w-full grid grid-cols-2 md:grid-cols-4 mb-4">
              {tabOptions.map((tab) => (
                <TabsTrigger key={tab.id} value={tab.id}>
                  {tab.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <TabsContent value="general">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nom du bien</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, name: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Input
                      id="address"
                      value={formData.address}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, address: e.target.value }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="purchase_price">Prix d'achat (€)</Label>
                    <Input
                      id="purchase_price"
                      type="number"
                      value={formData.purchase_price}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          purchase_price: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="acquisition_date">Date d'acquisition</Label>
                    <Input
                      id="acquisition_date"
                      type="date"
                      value={formData.acquisition_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          acquisition_date: e.target.value,
                        }))
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_sold">Bien vendu</Label>
                      <Switch
                        id="is_sold"
                        checked={isSold}
                        onCheckedChange={setIsSold}
                      />
                    </div>
                  </div>

                  {isSold && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="sale_price">Prix de vente (€)</Label>
                        <Input
                          id="sale_price"
                          type="number"
                          value={formData.sale_price}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              sale_price: e.target.value,
                            }))
                          }
                          required={isSold}
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="sale_date">Date de vente</Label>
                        <Input
                          id="sale_date"
                          type="date"
                          value={formData.sale_date}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              sale_date: e.target.value,
                            }))
                          }
                          required={isSold}
                        />
                      </div>

                      {capitalGain !== null && (
                        <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
                          <p className="text-sm font-medium">
                            Plus/moins value: 
                            <span className={capitalGain >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                              {(capitalGain >= 0 ? "+" : "") + capitalGain.toLocaleString("fr-FR")} €
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <h3 className="text-lg font-medium">Informations sur le prêt</h3>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan_amount">Montant du prêt (€)</Label>
                    <Input
                      id="loan_amount"
                      type="number"
                      value={formData.loan_amount}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          loan_amount: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan_rate">Taux du prêt (%)</Label>
                    <Input
                      id="loan_rate"
                      type="number"
                      step="0.01"
                      value={formData.loan_rate}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          loan_rate: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan_duration_months">
                      Durée du prêt (en mois)
                    </Label>
                    <Input
                      id="loan_duration_months"
                      type="number"
                      value={formData.loan_duration_months}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          loan_duration_months: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loan_start_date">
                      Date de début du remboursement
                    </Label>
                    <Input
                      id="loan_start_date"
                      type="date"
                      value={formData.loan_start_date}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          loan_start_date: e.target.value,
                        }))
                      }
                    />
                  </div>

                  {monthlyPayment !== null && (
                    <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
                      <p className="text-sm font-medium">
                        Mensualité estimée: <span className="font-bold">{monthlyPayment.toLocaleString("fr-FR")} €</span>
                      </p>
                    </div>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="repaid_capital">Capital remboursé (€)</Label>
                    <Input
                      id="repaid_capital"
                      type="number"
                      value={formData.repaid_capital}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          repaid_capital: e.target.value,
                        }))
                      }
                    />
                  </div>

                  <div className="space-y-2 col-span-1 md:col-span-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="is_rented">Bien en location</Label>
                      <Switch
                        id="is_rented"
                        checked={isRented}
                        onCheckedChange={setIsRented}
                      />
                    </div>
                  </div>

                  {isRented && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor="monthly_rent">Loyer mensuel (€)</Label>
                        <Input
                          id="monthly_rent"
                          type="number"
                          value={formData.monthly_rent}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              monthly_rent: e.target.value,
                            }))
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="total_rents_collected">
                          Total des loyers perçus (€)
                        </Label>
                        <Input
                          id="total_rents_collected"
                          type="number"
                          value={formData.total_rents_collected}
                          onChange={(e) =>
                            setFormData((prev) => ({
                              ...prev,
                              total_rents_collected: e.target.value,
                            }))
                          }
                        />
                      </div>

                      {monthlyPayment !== null && isRented && formData.monthly_rent && (
                        <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
                          <p className="text-sm font-medium">
                            Cash-flow mensuel: 
                            <span className={parseFloat(formData.monthly_rent.toString()) - monthlyPayment >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                              {(parseFloat(formData.monthly_rent.toString()) - monthlyPayment).toLocaleString("fr-FR")} €
                            </span>
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>

                <DialogFooter>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenChange(false)}
                  >
                    Annuler
                  </Button>
                  <Button type="submit" disabled={mutation.isPending}>
                    {isEditing ? "Mettre à jour" : "Ajouter"}
                  </Button>
                </DialogFooter>
              </form>
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
          </Tabs>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Êtes-vous sûr de vouloir supprimer ce bien ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action est irréversible. Toutes les informations associées à ce bien seront définitivement supprimées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive">
              {deleteMutation.isPending ? "Suppression..." : "Supprimer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
