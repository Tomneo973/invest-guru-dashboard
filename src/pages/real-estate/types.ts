
export interface RealEstateProperty {
  id: string;
  user_id: string;
  name: string;
  address: string;
  purchase_price: number;
  acquisition_date: string;
  loan_amount: number | null;
  loan_rate: number | null;
  loan_duration_months: number | null;
  loan_start_date: string | null;
  loan_end_date: string | null;
  is_rented: boolean;
  monthly_rent: number | null;
  repaid_capital: number;
  total_rents_collected: number;
  created_at: string;
  updated_at: string;
  // Nouvelles propriétés
  is_sold: boolean;
  sale_date: string | null;
  sale_price: number | null;
  monthly_payment: number | null;
}

export interface PropertyPerformance {
  month: string;
  cashflow: number;
  cumulativeCashflow: number;
}
