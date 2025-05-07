export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      dividends: {
        Row: {
          amount: number
          created_at: string
          currency: string
          date: string
          id: string
          symbol: string
          user_id: string
          withheld_taxes: number
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          date: string
          id?: string
          symbol: string
          user_id: string
          withheld_taxes?: number
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          date?: string
          id?: string
          symbol?: string
          user_id?: string
          withheld_taxes?: number
        }
        Relationships: [
          {
            foreignKeyName: "dividends_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_daily_dividends: {
        Row: {
          created_at: string
          date: string
          id: string
          total_dividends: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_dividends: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_dividends?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_daily_holdings: {
        Row: {
          created_at: string
          date: string
          id: string
          shares: number
          symbol: string
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          shares: number
          symbol: string
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          shares?: number
          symbol?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_daily_holdings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_daily_invested: {
        Row: {
          created_at: string
          date: string
          id: string
          total_invested: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_invested: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_invested?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_daily_values: {
        Row: {
          created_at: string
          date: string
          id: string
          total_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_value?: number
          user_id?: string
        }
        Relationships: []
      }
      portfolio_history: {
        Row: {
          created_at: string
          date: string
          id: string
          total_value: number
          user_id: string
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          total_value: number
          user_id: string
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          total_value?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "portfolio_history_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          birthday: string | null
          country: string | null
          created_at: string
          id: string
          premium_until: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id: string
          premium_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id?: string
          premium_until?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      real_estate: {
        Row: {
          acquisition_date: string
          address: string
          created_at: string
          housing_tax: number | null
          id: string
          income_tax_rate: number | null
          is_rented: boolean | null
          is_sold: boolean | null
          loan_amount: number | null
          loan_duration_months: number | null
          loan_end_date: string | null
          loan_rate: number | null
          loan_start_date: string | null
          monthly_payment: number | null
          monthly_rent: number | null
          name: string
          other_taxes: number | null
          property_tax: number | null
          purchase_price: number
          repaid_capital: number | null
          sale_date: string | null
          sale_price: number | null
          surface_area: number | null
          total_rents_collected: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          acquisition_date: string
          address: string
          created_at?: string
          housing_tax?: number | null
          id?: string
          income_tax_rate?: number | null
          is_rented?: boolean | null
          is_sold?: boolean | null
          loan_amount?: number | null
          loan_duration_months?: number | null
          loan_end_date?: string | null
          loan_rate?: number | null
          loan_start_date?: string | null
          monthly_payment?: number | null
          monthly_rent?: number | null
          name: string
          other_taxes?: number | null
          property_tax?: number | null
          purchase_price: number
          repaid_capital?: number | null
          sale_date?: string | null
          sale_price?: number | null
          surface_area?: number | null
          total_rents_collected?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          acquisition_date?: string
          address?: string
          created_at?: string
          housing_tax?: number | null
          id?: string
          income_tax_rate?: number | null
          is_rented?: boolean | null
          is_sold?: boolean | null
          loan_amount?: number | null
          loan_duration_months?: number | null
          loan_end_date?: string | null
          loan_rate?: number | null
          loan_start_date?: string | null
          monthly_payment?: number | null
          monthly_rent?: number | null
          name?: string
          other_taxes?: number | null
          property_tax?: number | null
          purchase_price?: number
          repaid_capital?: number | null
          sale_date?: string | null
          sale_price?: number | null
          surface_area?: number | null
          total_rents_collected?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      real_estate_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string | null
          id: string
          property_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description?: string | null
          id?: string
          property_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          property_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "real_estate_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "real_estate"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_prices: {
        Row: {
          closing_price: number
          created_at: string
          currency: string
          date: string
          symbol: string
        }
        Insert: {
          closing_price: number
          created_at?: string
          currency: string
          date: string
          symbol: string
        }
        Update: {
          closing_price?: number
          created_at?: string
          currency?: string
          date?: string
          symbol?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          amount: number
          created_at: string
          currency: string
          end_date: string
          id: string
          payment_id: string | null
          payment_status: string
          plan_type: string
          start_date: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency: string
          end_date: string
          id?: string
          payment_id?: string | null
          payment_status?: string
          plan_type: string
          start_date?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          end_date?: string
          id?: string
          payment_id?: string | null
          payment_status?: string
          plan_type?: string
          start_date?: string
          user_id?: string
        }
        Relationships: []
      }
      transactions: {
        Row: {
          created_at: string
          currency: string
          date: string
          id: string
          platform: string
          price: number
          sector: string
          shares: number
          symbol: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          currency: string
          date: string
          id?: string
          platform: string
          price: number
          sector: string
          shares: number
          symbol: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          currency?: string
          date?: string
          id?: string
          platform?: string
          price?: number
          sector?: string
          shares?: number
          symbol?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_portfolio_holdings: {
        Args: Record<PropertyKey, never>
        Returns: {
          symbol: string
          shares: number
          total_invested: number
          current_value: number
          sector: string
          currency: string
        }[]
      }
      is_admin: {
        Args: { user_id: string }
        Returns: boolean
      }
      is_market_holiday: {
        Args: { check_date: string }
        Returns: boolean
      }
      is_premium_user: {
        Args: { user_id: string }
        Returns: boolean
      }
      update_daily_dividends: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_invested: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_daily_portfolio_values: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_portfolio_daily_holdings: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_portfolio_history: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      user_role: "user" | "premium" | "admin"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: ["user", "premium", "admin"],
    },
  },
} as const
