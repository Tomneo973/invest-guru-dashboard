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
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
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
      is_market_holiday: {
        Args: {
          check_date: string
        }
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
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
