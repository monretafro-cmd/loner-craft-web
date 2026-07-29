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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          created_by: string | null
          email: string
          expires_at: string | null
          id: string
          revoked: boolean
          role: Database["public"]["Enums"]["app_role"]
          updated_at: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          email: string
          expires_at?: string | null
          id?: string
          revoked?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          created_by?: string | null
          email?: string
          expires_at?: string | null
          id?: string
          revoked?: boolean
          role?: Database["public"]["Enums"]["app_role"]
          updated_at?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          admin_id: string | null
          admin_name: string | null
          created_at: string
          id: string
          ip: string | null
          new_value: Json | null
          old_value: Json | null
          page: string | null
          record_id: string | null
          record_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          page?: string | null
          record_id?: string | null
          record_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          admin_name?: string | null
          created_at?: string
          id?: string
          ip?: string | null
          new_value?: Json | null
          old_value?: Json | null
          page?: string | null
          record_id?: string | null
          record_type?: string | null
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          name_fr: string | null
          slug: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          name_fr?: string | null
          slug: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          name_fr?: string | null
          slug?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      coupons: {
        Row: {
          active: boolean
          code: string
          created_at: string
          discount_type: string
          discount_value: number
          ends_at: string | null
          id: string
          max_uses: number | null
          min_order: number | null
          product_ids: string[] | null
          starts_at: string | null
          updated_at: string
          used_count: number
          uses_per_customer: number | null
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          discount_type?: string
          discount_value: number
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number | null
          product_ids?: string[] | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
          uses_per_customer?: number | null
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          discount_type?: string
          discount_value?: number
          ends_at?: string | null
          id?: string
          max_uses?: number | null
          min_order?: number | null
          product_ids?: string[] | null
          starts_at?: string | null
          updated_at?: string
          used_count?: number
          uses_per_customer?: number | null
        }
        Relationships: []
      }
      customer_addresses: {
        Row: {
          address: string
          city: string | null
          created_at: string
          customer_id: string
          id: string
          is_default: boolean
          label: string | null
          postal_code: string | null
          region: string | null
        }
        Insert: {
          address: string
          city?: string | null
          created_at?: string
          customer_id: string
          id?: string
          is_default?: boolean
          label?: string | null
          postal_code?: string | null
          region?: string | null
        }
        Update: {
          address?: string
          city?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          is_default?: boolean
          label?: string | null
          postal_code?: string | null
          region?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "customer_addresses_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_notes: {
        Row: {
          admin_id: string | null
          created_at: string
          customer_id: string
          id: string
          note: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          customer_id: string
          id?: string
          note: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string
          id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "customer_notes_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          blocked: boolean
          city: string | null
          created_at: string
          email: string | null
          id: string
          language: string | null
          last_order_at: string | null
          name: string
          orders_count: number
          phone: string
          source: string | null
          status: string
          total_spent: number
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          blocked?: boolean
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          last_order_at?: string | null
          name: string
          orders_count?: number
          phone: string
          source?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          blocked?: boolean
          city?: string | null
          created_at?: string
          email?: string | null
          id?: string
          language?: string | null
          last_order_at?: string | null
          name?: string
          orders_count?: number
          phone?: string
          source?: string | null
          status?: string
          total_spent?: number
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          active: boolean
          city: string
          created_at: string
          estimated_time: string | null
          fee: number
          id: string
          region: string | null
          surcharge: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          city: string
          created_at?: string
          estimated_time?: string | null
          fee?: number
          id?: string
          region?: string | null
          surcharge?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          city?: string
          created_at?: string
          estimated_time?: string | null
          fee?: number
          id?: string
          region?: string | null
          surcharge?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_content: {
        Row: {
          active: boolean
          content: Json
          display_order: number
          id: string
          section: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          content?: Json
          display_order?: number
          id?: string
          section: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          content?: Json
          display_order?: number
          id?: string
          section?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory_history: {
        Row: {
          admin_id: string | null
          change: number
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          reason: string
          resulting_stock: number | null
        }
        Insert: {
          admin_id?: string | null
          change: number
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          reason: string
          resulting_stock?: number | null
        }
        Update: {
          admin_id?: string | null
          change?: number
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          reason?: string
          resulting_stock?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_history_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      media: {
        Row: {
          alt_text: string | null
          created_at: string
          folder: string
          height: number | null
          id: string
          mime_type: string | null
          name: string
          size_bytes: number | null
          uploaded_by: string | null
          url: string
          usage_location: string | null
          width: number | null
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          name: string
          size_bytes?: number | null
          uploaded_by?: string | null
          url: string
          usage_location?: string | null
          width?: number | null
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          folder?: string
          height?: number | null
          id?: string
          mime_type?: string | null
          name?: string
          size_bytes?: number | null
          uploaded_by?: string | null
          url?: string
          usage_location?: string | null
          width?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          assigned_admin: string | null
          created_at: string
          email: string | null
          id: string
          message: string
          name: string
          phone: string | null
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_admin?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message: string
          name: string
          phone?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_admin?: string | null
          created_at?: string
          email?: string | null
          id?: string
          message?: string
          name?: string
          phone?: string | null
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
        }
        Relationships: []
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total: number
          order_id: string
          product_id: string | null
          product_image: string | null
          product_name: string
          quantity: number
          unit_price: number
          variant: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          line_total: number
          order_id: string
          product_id?: string | null
          product_image?: string | null
          product_name: string
          quantity?: number
          unit_price: number
          variant?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          line_total?: number
          order_id?: string
          product_id?: string | null
          product_image?: string | null
          product_name?: string
          quantity?: number
          unit_price?: number
          variant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      order_status_history: {
        Row: {
          admin_id: string | null
          created_at: string
          from_status: string | null
          id: string
          note: string | null
          order_id: string
          to_status: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id: string
          to_status: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          from_status?: string | null
          id?: string
          note?: string | null
          order_id?: string
          to_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_status_history_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string
          admin_notes: string | null
          assigned_admin: string | null
          city: string
          coupon_code: string | null
          created_at: string
          customer_id: string | null
          customer_name: string
          customer_notes: string | null
          delivery_fee: number
          discount: number
          email: string | null
          id: string
          language: string
          last_whatsapp_at: string | null
          order_number: string
          payment_method: string
          phone: string
          region: string | null
          source: string
          status: string
          stock_applied: boolean
          subtotal: number
          total: number
          updated_at: string
          whatsapp: string | null
          whatsapp_attempts: number
          whatsapp_status: string
        }
        Insert: {
          address: string
          admin_notes?: string | null
          assigned_admin?: string | null
          city: string
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name: string
          customer_notes?: string | null
          delivery_fee?: number
          discount?: number
          email?: string | null
          id?: string
          language?: string
          last_whatsapp_at?: string | null
          order_number?: string
          payment_method?: string
          phone: string
          region?: string | null
          source?: string
          status?: string
          stock_applied?: boolean
          subtotal?: number
          total?: number
          updated_at?: string
          whatsapp?: string | null
          whatsapp_attempts?: number
          whatsapp_status?: string
        }
        Update: {
          address?: string
          admin_notes?: string | null
          assigned_admin?: string | null
          city?: string
          coupon_code?: string | null
          created_at?: string
          customer_id?: string | null
          customer_name?: string
          customer_notes?: string | null
          delivery_fee?: number
          discount?: number
          email?: string | null
          id?: string
          language?: string
          last_whatsapp_at?: string | null
          order_number?: string
          payment_method?: string
          phone?: string
          region?: string | null
          source?: string
          status?: string
          stock_applied?: boolean
          subtotal?: number
          total?: number
          updated_at?: string
          whatsapp?: string | null
          whatsapp_attempts?: number
          whatsapp_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
        ]
      }
      product_images: {
        Row: {
          alt_text: string | null
          created_at: string
          display_order: number
          id: string
          is_main: boolean
          label: string | null
          media_type: string
          product_id: string
          storage_path: string | null
          updated_at: string
          url: string
        }
        Insert: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_main?: boolean
          label?: string | null
          media_type?: string
          product_id: string
          storage_path?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          alt_text?: string | null
          created_at?: string
          display_order?: number
          id?: string
          is_main?: boolean
          label?: string | null
          media_type?: string
          product_id?: string
          storage_path?: string | null
          updated_at?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          available: boolean
          created_at: string
          id: string
          image_url: string | null
          option_type: string
          option_value: string
          price: number | null
          product_id: string
          sku: string | null
          stock: number
          updated_at: string
        }
        Insert: {
          available?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          option_type: string
          option_value: string
          price?: number | null
          product_id: string
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Update: {
          available?: boolean
          created_at?: string
          id?: string
          image_url?: string | null
          option_type?: string
          option_value?: string
          price?: number | null
          product_id?: string
          sku?: string | null
          stock?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          cod_available: boolean
          color: string | null
          created_at: string
          delivery_time: string | null
          description: string | null
          dimensions: string | null
          featured: boolean
          features: string[] | null
          id: string
          leather_type: string | null
          low_stock_threshold: number
          made_in: string | null
          material: string | null
          name: string
          price: number
          rating: number | null
          reserved_stock: number
          sale_price: number | null
          seo_description: string | null
          seo_title: string | null
          short_description: string | null
          sku: string | null
          slug: string
          sold: number
          status: string
          stock: number
          subtitle: string | null
          tags: string[] | null
          translations: Json
          updated_at: string
          weight: number | null
          whatsapp_ordering: boolean
        }
        Insert: {
          category_id?: string | null
          cod_available?: boolean
          color?: string | null
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          dimensions?: string | null
          featured?: boolean
          features?: string[] | null
          id?: string
          leather_type?: string | null
          low_stock_threshold?: number
          made_in?: string | null
          material?: string | null
          name: string
          price?: number
          rating?: number | null
          reserved_stock?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug: string
          sold?: number
          status?: string
          stock?: number
          subtitle?: string | null
          tags?: string[] | null
          translations?: Json
          updated_at?: string
          weight?: number | null
          whatsapp_ordering?: boolean
        }
        Update: {
          category_id?: string | null
          cod_available?: boolean
          color?: string | null
          created_at?: string
          delivery_time?: string | null
          description?: string | null
          dimensions?: string | null
          featured?: boolean
          features?: string[] | null
          id?: string
          leather_type?: string | null
          low_stock_threshold?: number
          made_in?: string | null
          material?: string | null
          name?: string
          price?: number
          rating?: number | null
          reserved_stock?: number
          sale_price?: number | null
          seo_description?: string | null
          seo_title?: string | null
          short_description?: string | null
          sku?: string | null
          slug?: string
          sold?: number
          status?: string
          stock?: number
          subtitle?: string | null
          tags?: string[] | null
          translations?: Json
          updated_at?: string
          weight?: number | null
          whatsapp_ordering?: boolean
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
          approved_at: string | null
          approved_by: string | null
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean
          last_login_at: string | null
          phone: string | null
          provider: string | null
          status: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean
          last_login_at?: string | null
          phone?: string | null
          provider?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          city: string | null
          created_at: string
          customer_name: string
          id: string
          language: string | null
          photo_url: string | null
          product_id: string | null
          rating: number
          status: string
          text: string | null
          updated_at: string
        }
        Insert: {
          city?: string | null
          created_at?: string
          customer_name: string
          id?: string
          language?: string | null
          photo_url?: string | null
          product_id?: string | null
          rating?: number
          status?: string
          text?: string | null
          updated_at?: string
        }
        Update: {
          city?: string | null
          created_at?: string
          customer_name?: string
          id?: string
          language?: string | null
          photo_url?: string | null
          product_id?: string | null
          rating?: number
          status?: string
          text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          id: string
          is_public: boolean
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          value?: Json
        }
        Update: {
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      whatsapp_logs: {
        Row: {
          admin_id: string | null
          created_at: string
          customer_id: string | null
          direction: string
          id: string
          language: string | null
          message: string | null
          note: string | null
          order_id: string | null
          status: string
        }
        Insert: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          id?: string
          language?: string | null
          message?: string | null
          note?: string | null
          order_id?: string | null
          status?: string
        }
        Update: {
          admin_id?: string | null
          created_at?: string
          customer_id?: string | null
          direction?: string
          id?: string
          language?: string | null
          message?: string | null
          note?: string | null
          order_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_logs_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "whatsapp_logs_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
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
      is_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "super_admin" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
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
      app_role: ["super_admin", "admin"],
    },
  },
} as const
