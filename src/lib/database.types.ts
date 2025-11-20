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
      pricing_config: {
        Row: {
          id: string
          key: string
          value: number
          description: string
          updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          key: string
          value: number
          description?: string
          updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: number
          description?: string
          updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      pricing_seasons: {
        Row: {
          id: string
          name: string
          start_month: number
          end_month: number
          start_day: number
          end_day: number
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          start_month: number
          end_month: number
          start_day: number
          end_day: number
          color?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          start_month?: number
          end_month?: number
          start_day?: number
          end_day?: number
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      pricing_rules: {
        Row: {
          id: string
          season_id: string
          min_guests: number
          max_guests: number
          price_per_night: number
          created_at: string
        }
        Insert: {
          id?: string
          season_id: string
          min_guests: number
          max_guests: number
          price_per_night: number
          created_at?: string
        }
        Update: {
          id?: string
          season_id?: string
          min_guests?: number
          max_guests?: number
          price_per_night?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pricing_rules_season_id_fkey"
            columns: ["season_id"]
            isOneToOne: false
            referencedRelation: "pricing_seasons"
            referencedColumns: ["id"]
          }
        ]
      }
      blocked_dates: {
        Row: {
          id: string
          blocked_date: string
          reason: string | null
          created_at: string
        }
        Insert: {
          id?: string
          blocked_date: string
          reason?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          blocked_date?: string
          reason?: string | null
          created_at?: string
        }
        Relationships: []
      }
      booking_inquiries: {
        Row: {
          id: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          num_guests: number
          num_nights: number
          calculated_price: number
          discount_applied: boolean
          status: string
          is_large_group: boolean
          notes: string | null
          admin_notes: string | null
          confirmed_at: string | null
          cancelled_at: string | null
          total_paid: number
          last_updated_at: string
          created_at: string
        }
        Insert: {
          id?: string
          guest_name: string
          guest_email: string
          guest_phone: string
          check_in: string
          check_out: string
          num_guests: number
          num_nights: number
          calculated_price: number
          discount_applied?: boolean
          status?: string
          is_large_group?: boolean
          notes?: string | null
          admin_notes?: string | null
          confirmed_at?: string | null
          cancelled_at?: string | null
          total_paid?: number
          last_updated_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          guest_name?: string
          guest_email?: string
          guest_phone?: string
          check_in?: string
          check_out?: string
          num_guests?: number
          num_nights?: number
          calculated_price?: number
          discount_applied?: boolean
          status?: string
          is_large_group?: boolean
          notes?: string | null
          admin_notes?: string | null
          confirmed_at?: string | null
          cancelled_at?: string | null
          total_paid?: number
          last_updated_at?: string
          created_at?: string
        }
        Relationships: []
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string
          message: string
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone: string
          message: string
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string
          message?: string
          status?: string
          created_at?: string
        }
        Relationships: []
      }
      admin_users: {
        Row: {
          id: string
          email: string
          created_at: string
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
        }
        Relationships: []
      }
      payments: {
        Row: {
          id: string
          booking_id: string
          amount: number
          payment_method: string
          payment_status: string
          payment_date: string
          transaction_id: string | null
          notes: string | null
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          booking_id: string
          amount: number
          payment_method: string
          payment_status?: string
          payment_date?: string
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Update: {
          id?: string
          booking_id?: string
          amount?: number
          payment_method?: string
          payment_status?: string
          payment_date?: string
          transaction_id?: string | null
          notes?: string | null
          created_at?: string
          created_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "booking_inquiries"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (Database["public"]["Tables"] & Database["public"]["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (Database["public"]["Tables"] &
      Database["public"]["Views"])
  ? (Database["public"]["Tables"] &
      Database["public"]["Views"])[PublicTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database["public"]["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database["public"]["Tables"]
  ? Database["public"]["Tables"][PublicTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database["public"]["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof Database["public"]["Enums"]
  ? Database["public"]["Enums"][PublicEnumNameOrOptions]
  : never
