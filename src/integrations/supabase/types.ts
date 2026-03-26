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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      accessibility_rules: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          min_contrast_ratio: number
          rule_name: string
          wcag_level: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          min_contrast_ratio?: number
          rule_name: string
          wcag_level?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          min_contrast_ratio?: number
          rule_name?: string
          wcag_level?: string
        }
        Relationships: []
      }
      ad_impressions: {
        Row: {
          created_at: string
          id: string
          page: string
          placement: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          page: string
          placement: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          page?: string
          placement?: string
          user_id?: string | null
        }
        Relationships: []
      }
      api_sync_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          source: string
          status: string
          sync_duration_ms: number | null
          trademarks_synced: number | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          source: string
          status?: string
          sync_duration_ms?: number | null
          trademarks_synced?: number | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          source?: string
          status?: string
          sync_duration_ms?: number | null
          trademarks_synced?: number | null
        }
        Relationships: []
      }
      copyrighted_images: {
        Row: {
          category: string
          created_at: string
          id: string
          image_hash: string
          owner: string
          source_url: string | null
          term: string
        }
        Insert: {
          category?: string
          created_at?: string
          id?: string
          image_hash: string
          owner: string
          source_url?: string | null
          term: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          image_hash?: string
          owner?: string
          source_url?: string | null
          term?: string
        }
        Relationships: []
      }
      design_suggestions: {
        Row: {
          created_at: string
          event_id: string | null
          id: string
          style: string
          suggestion: string
        }
        Insert: {
          created_at?: string
          event_id?: string | null
          id?: string
          style: string
          suggestion: string
        }
        Update: {
          created_at?: string
          event_id?: string | null
          id?: string
          style?: string
          suggestion?: string
        }
        Relationships: [
          {
            foreignKeyName: "design_suggestions_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events_calendar"
            referencedColumns: ["id"]
          },
        ]
      }
      designs: {
        Row: {
          color_scheme: string | null
          created_at: string
          event_tag: string | null
          id: string
          image_url: string
          prompt: string
          shopify_product_id: string | null
          style: string
          uploaded_to_shopify: boolean
          user_id: string
        }
        Insert: {
          color_scheme?: string | null
          created_at?: string
          event_tag?: string | null
          id?: string
          image_url: string
          prompt: string
          shopify_product_id?: string | null
          style: string
          uploaded_to_shopify?: boolean
          user_id: string
        }
        Update: {
          color_scheme?: string | null
          created_at?: string
          event_tag?: string | null
          id?: string
          image_url?: string
          prompt?: string
          shopify_product_id?: string | null
          style?: string
          uploaded_to_shopify?: boolean
          user_id?: string
        }
        Relationships: []
      }
      eco_printers: {
        Row: {
          affiliate_url: string | null
          certifications: string[] | null
          created_at: string
          description: string | null
          id: string
          min_order: number | null
          name: string
          rating: number | null
          region: string
          website_url: string | null
        }
        Insert: {
          affiliate_url?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          min_order?: number | null
          name: string
          rating?: number | null
          region?: string
          website_url?: string | null
        }
        Update: {
          affiliate_url?: string | null
          certifications?: string[] | null
          created_at?: string
          description?: string | null
          id?: string
          min_order?: number | null
          name?: string
          rating?: number | null
          region?: string
          website_url?: string | null
        }
        Relationships: []
      }
      events_calendar: {
        Row: {
          category: string
          country: string
          created_at: string
          description: string | null
          event_date: string
          id: string
          name: string
          suggested_themes: string[] | null
        }
        Insert: {
          category: string
          country: string
          created_at?: string
          description?: string | null
          event_date: string
          id?: string
          name: string
          suggested_themes?: string[] | null
        }
        Update: {
          category?: string
          country?: string
          created_at?: string
          description?: string | null
          event_date?: string
          id?: string
          name?: string
          suggested_themes?: string[] | null
        }
        Relationships: []
      }
      false_positive_reports: {
        Row: {
          admin_notes: string | null
          created_at: string
          flagged_term: string
          id: string
          reason: string
          reviewed_at: string | null
          scan_id: string | null
          status: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          flagged_term: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          scan_id?: string | null
          status?: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          flagged_term?: string
          id?: string
          reason?: string
          reviewed_at?: string | null
          scan_id?: string | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "false_positive_reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_results"
            referencedColumns: ["id"]
          },
        ]
      }
      ocr_results: {
        Row: {
          confidence: number
          created_at: string
          extracted_text: string
          flagged_terms: string[]
          id: string
          scan_id: string | null
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          extracted_text?: string
          flagged_terms?: string[]
          id?: string
          scan_id?: string | null
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          extracted_text?: string
          flagged_terms?: string[]
          id?: string
          scan_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ocr_results_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_results"
            referencedColumns: ["id"]
          },
        ]
      }
      print_requirements: {
        Row: {
          created_at: string
          description: string | null
          id: string
          min_height_px: number
          min_width_px: number
          product_type: string
          recommended_dpi: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          min_height_px: number
          min_width_px: number
          product_type: string
          recommended_dpi?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          min_height_px?: number
          min_width_px?: number
          product_type?: string
          recommended_dpi?: number
        }
        Relationships: []
      }
      saved_images: {
        Row: {
          created_at: string | null
          id: string
          image_type: string
          image_url: string
          original_url: string | null
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_type: string
          image_url: string
          original_url?: string | null
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          image_type?: string
          image_url?: string
          original_url?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      scan_results: {
        Row: {
          accessibility_score: number
          created_at: string
          fail_reason: string | null
          id: string
          image_url: string | null
          ip_score: number
          ip_score_raw: number | null
          keywords: string[] | null
          overall_score: number
          overall_score_capped: boolean | null
          passed: boolean
          quality_score: number
          transparency_score: number
          user_id: string
        }
        Insert: {
          accessibility_score?: number
          created_at?: string
          fail_reason?: string | null
          id?: string
          image_url?: string | null
          ip_score?: number
          ip_score_raw?: number | null
          keywords?: string[] | null
          overall_score?: number
          overall_score_capped?: boolean | null
          passed?: boolean
          quality_score?: number
          transparency_score?: number
          user_id: string
        }
        Update: {
          accessibility_score?: number
          created_at?: string
          fail_reason?: string | null
          id?: string
          image_url?: string | null
          ip_score?: number
          ip_score_raw?: number | null
          keywords?: string[] | null
          overall_score?: number
          overall_score_capped?: boolean | null
          passed?: boolean
          quality_score?: number
          transparency_score?: number
          user_id?: string
        }
        Relationships: []
      }
      shopify_credentials: {
        Row: {
          api_key: string
          created_at: string
          id: string
          shop_url: string
          updated_at: string
          user_id: string
        }
        Insert: {
          api_key: string
          created_at?: string
          id?: string
          shop_url: string
          updated_at?: string
          user_id: string
        }
        Update: {
          api_key?: string
          created_at?: string
          id?: string
          shop_url?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      trademark_database: {
        Row: {
          auto_synced: boolean | null
          category: string
          created_at: string
          description: string | null
          id: string
          last_verified: string | null
          owner_name: string | null
          region: string | null
          registration_number: string | null
          risk_level: string
          source: string | null
          term: string
        }
        Insert: {
          auto_synced?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_verified?: string | null
          owner_name?: string | null
          region?: string | null
          registration_number?: string | null
          risk_level?: string
          source?: string | null
          term: string
        }
        Update: {
          auto_synced?: boolean | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          last_verified?: string | null
          owner_name?: string | null
          region?: string | null
          registration_number?: string | null
          risk_level?: string
          source?: string | null
          term?: string
        }
        Relationships: []
      }
      trademark_reports: {
        Row: {
          category: string
          created_at: string
          evidence_url: string | null
          id: string
          notes: string | null
          reported_term: string
          status: string
          user_id: string
        }
        Insert: {
          category?: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          reported_term: string
          status?: string
          user_id: string
        }
        Update: {
          category?: string
          created_at?: string
          evidence_url?: string | null
          id?: string
          notes?: string | null
          reported_term?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      uploaded_images: {
        Row: {
          id: string
          image_hash: string
          is_copyrighted: boolean
          upload_date: string
          user_id: string
        }
        Insert: {
          id?: string
          image_hash: string
          is_copyrighted?: boolean
          upload_date?: string
          user_id: string
        }
        Update: {
          id?: string
          image_hash?: string
          is_copyrighted?: boolean
          upload_date?: string
          user_id?: string
        }
        Relationships: []
      }
      user_profiles: {
        Row: {
          affiliate_clicks: number
          affiliate_earnings: number
          created_at: string
          display_name: string | null
          id: string
          preferred_language: string
          privacy_accepted_at: string | null
          subscription_status: string
          terms_accepted_at: string | null
          total_scans: number
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_clicks?: number
          affiliate_earnings?: number
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string
          privacy_accepted_at?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          total_scans?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_clicks?: number
          affiliate_earnings?: number
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_language?: string
          privacy_accepted_at?: string | null
          subscription_status?: string
          terms_accepted_at?: string | null
          total_scans?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
    Enums: {},
  },
} as const
