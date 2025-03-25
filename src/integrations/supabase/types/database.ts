
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
          role: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id: string
          premium_until?: string | null
          role?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          birthday?: string | null
          country?: string | null
          created_at?: string
          id?: string
          premium_until?: string | null
          role?: string
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
      is_admin: {
        Args: {
          user_id: string
        }
        Returns: boolean
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
