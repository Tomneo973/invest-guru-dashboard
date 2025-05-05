
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RealEstateProperty } from "../../types";
import { useState } from "react";

interface PropertyFormData {
  id: string;
  name: string;
  address: string;
  purchase_price: string | number;
  acquisition_date: string;
  loan_amount: string | number;
  loan_rate: string | number;
  loan_duration_months: string | number;
  loan_start_date: string;
  monthly_rent: string | number;
  repaid_capital: string | number;
  total_rents_collected: string | number;
  sale_price: string | number;
  sale_date: string;
  // Nouveaux champs pour les impôts
  property_tax: string | number;
  housing_tax: string | number;
  income_tax_rate: string | number;
  other_taxes: string | number;
  // Surface du bien
  surface_area: string | number;
}

interface PropertyFormProps {
  property?: RealEstateProperty | null;
  onSubmit: (e: React.FormEvent, formData: any, isRented: boolean, isSold: boolean) => void;
  onCancel: () => void;
  isPending: boolean;
}

export function PropertyForm({ property, onSubmit, onCancel, isPending }: PropertyFormProps) {
  const isEditing = !!property;
  const [isRented, setIsRented] = useState(property?.is_rented ?? false);
  const [isSold, setIsSold] = useState(property?.is_sold ?? false);

  const [formData, setFormData] = useState<PropertyFormData>({
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
    // Nouveaux champs pour les impôts
    property_tax: property?.property_tax ?? "",
    housing_tax: property?.housing_tax ?? "", 
    income_tax_rate: property?.income_tax_rate ?? "",
    other_taxes: property?.other_taxes ?? "",
    // Surface du bien
    surface_area: property?.surface_area ?? "",
  });

  // Fonction pour calculer le total des impôts
  const calculateTotalTaxes = (): number => {
    const propertyTax = parseFloat(formData.property_tax.toString()) || 0;
    const housingTax = parseFloat(formData.housing_tax.toString()) || 0;
    const otherTaxes = parseFloat(formData.other_taxes.toString()) || 0;
    
    return propertyTax + housingTax + otherTaxes;
  };

  // Fonction pour calculer le prix au mètre carré
  const calculatePricePerSquareMeter = (): number | null => {
    const purchasePrice = parseFloat(formData.purchase_price.toString());
    const surfaceArea = parseFloat(formData.surface_area.toString());
    
    if (isNaN(purchasePrice) || isNaN(surfaceArea) || surfaceArea <= 0) {
      return null;
    }
    
    return Math.round((purchasePrice / surfaceArea) * 100) / 100;
  };

  const totalAnnualTaxes = calculateTotalTaxes();
  const monthlyTaxes = totalAnnualTaxes / 12;
  const pricePerSquareMeter = calculatePricePerSquareMeter();
  
  // Import format from date-fns at the top
  function format(date: Date, format: string) {
    return new Intl.DateTimeFormat('fr-CA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit'
    }).format(date).split('/').join('-');
  }

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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(e, formData, isRented, isSold);
  };

  return (
    <form onSubmit={handleFormSubmit} className="space-y-6">
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
          <Label htmlFor="surface_area">Surface (m²)</Label>
          <Input
            id="surface_area"
            type="number"
            value={formData.surface_area}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                surface_area: e.target.value,
              }))
            }
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

        {pricePerSquareMeter !== null && (
          <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
            <p className="text-sm font-medium">
              Prix au mètre carré: <span className="font-bold">{pricePerSquareMeter.toLocaleString("fr-FR")} €/m²</span>
            </p>
          </div>
        )}

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
          </>
        )}

        {/* Section des impôts */}
        <div className="space-y-2 col-span-1 md:col-span-2">
          <h3 className="text-lg font-medium">Impôts et taxes</h3>
        </div>

        <div className="space-y-2">
          <Label htmlFor="property_tax">Taxe foncière annuelle (€)</Label>
          <Input
            id="property_tax"
            type="number"
            value={formData.property_tax}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                property_tax: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="housing_tax">Taxe d'habitation annuelle (€)</Label>
          <Input
            id="housing_tax"
            type="number"
            value={formData.housing_tax}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                housing_tax: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="income_tax_rate">Taux d'imposition sur les revenus locatifs (%)</Label>
          <Input
            id="income_tax_rate"
            type="number"
            step="0.01"
            value={formData.income_tax_rate}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                income_tax_rate: e.target.value,
              }))
            }
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_taxes">Autres taxes annuelles (€)</Label>
          <Input
            id="other_taxes"
            type="number"
            value={formData.other_taxes}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                other_taxes: e.target.value,
              }))
            }
          />
        </div>

        {totalAnnualTaxes > 0 && (
          <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
            <p className="text-sm font-medium">
              Total des taxes annuelles: <span className="font-bold">{totalAnnualTaxes.toLocaleString("fr-FR")} € / an</span>
            </p>
            <p className="text-sm text-muted-foreground mt-1">
              Soit <span className="font-semibold">{monthlyTaxes.toLocaleString("fr-FR")} € / mois</span>
            </p>
          </div>
        )}

        {monthlyPayment !== null && isRented && formData.monthly_rent && (
          <div className="col-span-1 md:col-span-2 p-4 rounded-lg border bg-muted">
            <p className="text-sm font-medium">
              Cash-flow mensuel (avec impôts): 
              <span className={parseFloat(formData.monthly_rent.toString()) - monthlyPayment - monthlyTaxes >= 0 ? "text-green-600 ml-2" : "text-red-600 ml-2"}>
                {(parseFloat(formData.monthly_rent.toString()) - monthlyPayment - monthlyTaxes).toLocaleString("fr-FR")} €
              </span>
            </p>
          </div>
        )}
      </div>

      <div className="flex justify-end space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
        >
          Annuler
        </Button>
        <Button type="submit" disabled={isPending}>
          {isEditing ? "Mettre à jour" : "Ajouter"}
        </Button>
      </div>
    </form>
  );
}
