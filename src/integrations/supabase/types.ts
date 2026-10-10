export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      addresses: {
        Row: {
          city: string
          created_at: string
          governorate: string
          id: string
          notes: string
          phone: string
          recipient: string
          street: string
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          governorate: string
          id?: string
          notes?: string
          phone: string
          recipient: string
          street: string
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          governorate?: string
          id?: string
          notes?: string
          phone?: string
          recipient?: string
          street?: string
          user_id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          active: boolean
          created_at: string
          id: string
          image_url: string
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: string
          image_url?: string
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      order_items: {
        Row: {
          id: string
          name: string
          order_id: string
          product_id: string | null
          quantity: number
          unit_price: number
        }
        Insert: {
          id?: string
          name: string
          order_id: string
          product_id?: string | null
          quantity: number
          unit_price: number
        }
        Update: {
          id?: string
          name?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          city: string
          created_at: string
          deposit_amount: number
          governorate: string
          id: string
          notes: string
          order_number: number
          payment_method: string
          payment_reference: string
          payment_status: string
          phone: string
          recipient: string
          remaining_amount: number
          shipping_fee: number
          shipping_zone: string
          status: string
          street: string
          subtotal: number
          total: number
          user_id: string
        }
        Insert: {
          city: string
          created_at?: string
          deposit_amount?: number
          governorate: string
          id?: string
          notes?: string
          order_number?: never
          payment_method: string
          payment_reference?: string
          payment_status?: string
          phone: string
          recipient: string
          remaining_amount?: number
          shipping_fee: number
          shipping_zone: string
          status?: string
          street: string
          subtotal: number
          total: number
          user_id: string
        }
        Update: {
          city?: string
          created_at?: string
          deposit_amount?: number
          governorate?: string
          id?: string
          notes?: string
          order_number?: never
          payment_method?: string
          payment_reference?: string
          payment_status?: string
          phone?: string
          recipient?: string
          remaining_amount?: number
          shipping_fee?: number
          shipping_zone?: string
          status?: string
          street?: string
          subtotal?: number
          total?: number
          user_id?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          active: boolean
          category_id: string | null
          compare_price: number | null
          created_at: string
          description: string
          id: string
          image_url: string
          is_demo: boolean
          name: string
          price: number
          stock: number
        }
        Insert: {
          active?: boolean
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_demo?: boolean
          name: string
          price: number
          stock?: number
        }
        Update: {
          active?: boolean
          category_id?: string | null
          compare_price?: number | null
          created_at?: string
          description?: string
          id?: string
          image_url?: string
          is_demo?: boolean
          name?: string
          price?: number
          stock?: number
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string
          id: string
          phone: string
        }
        Insert: {
          created_at?: string
          full_name?: string
          id: string
          phone?: string
        }
        Update: {
          created_at?: string
          full_name?: string
          id?: string
          phone?: string
        }
        Relationships: []
      }
      shipping_zones: {
        Row: {
          active: boolean
          fee: number
          id: string
          name: string
          sort_order: number
        }
        Insert: {
          active?: boolean
          fee?: number
          id?: string
          name: string
          sort_order?: number
        }
        Update: {
          active?: boolean
          fee?: number
          id?: string
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      store_settings: {
        Row: {
          cod_deposit_type: string
          cod_deposit_value: number
          cod_enabled: boolean
          id: number
          updated_at: string
          visa_enabled: boolean
          vodafone_enabled: boolean
          vodafone_number: string
        }
        Insert: {
          cod_deposit_type?: string
          cod_deposit_value?: number
          cod_enabled?: boolean
          id?: number
          updated_at?: string
          visa_enabled?: boolean
          vodafone_enabled?: boolean
          vodafone_number?: string
        }
        Update: {
          cod_deposit_type?: string
          cod_deposit_value?: number
          cod_enabled?: boolean
          id?: number
          updated_at?: string
          visa_enabled?: boolean
          vodafone_enabled?: boolean
          vodafone_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      place_order: {
        Args: {
          _address_id: string
          _items: Json
          _payment_method: string
          _payment_reference?: string
          _zone_id: string
        }
        Returns: string
      }
      submit_payment_reference: {
        Args: { _order_id: string; _ref: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "customer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "customer"],
    },
  },
} as const
