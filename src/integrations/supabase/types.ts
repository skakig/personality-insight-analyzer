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
      analysis_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          level: number
          score_range_max: number
          score_range_min: number
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          level: number
          score_range_max: number
          score_range_min: number
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          level?: number
          score_range_max?: number
          score_range_min?: number
        }
        Relationships: []
      }
      corporate_subscriptions: {
        Row: {
          active: boolean | null
          assessments_used: number | null
          created_at: string
          id: string
          max_assessments: number
          organization_id: string
          subscription_tier: string
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          assessments_used?: number | null
          created_at?: string
          id?: string
          max_assessments: number
          organization_id: string
          subscription_tier: string
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          assessments_used?: number | null
          created_at?: string
          id?: string
          max_assessments?: number
          organization_id?: string
          subscription_tier?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "corporate_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      credit_purchases: {
        Row: {
          amount: number
          created_at: string
          id: string
          status: string
          stripe_session_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          status?: string
          stripe_session_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      detailed_analysis_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          id: string
          level: number
          recommendations: string | null
          score_range_max: number
          score_range_min: number
          subcategory: string | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string
          id?: string
          level: number
          recommendations?: string | null
          score_range_max: number
          score_range_min: number
          subcategory?: string | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          id?: string
          level?: number
          recommendations?: string | null
          score_range_max?: number
          score_range_min?: number
          subcategory?: string | null
        }
        Relationships: []
      }
      guest_purchases: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          price_id: string | null
          purchase_type: string
          result_id: string | null
          status: string | null
          stripe_session_id: string | null
          subscription_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          price_id?: string | null
          purchase_type: string
          result_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          price_id?: string | null
          purchase_type?: string
          result_id?: string | null
          status?: string | null
          stripe_session_id?: string | null
          subscription_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "guest_purchases_result_id_fkey"
            columns: ["result_id"]
            isOneToOne: false
            referencedRelation: "quiz_results"
            referencedColumns: ["id"]
          },
        ]
      }
      guest_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          plan_type: string
          session_id: string | null
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_session_id: string | null
          stripe_subscription_id: string | null
          temp_access_token: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          plan_type: string
          session_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          temp_access_token?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          plan_type?: string
          session_id?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_session_id?: string | null
          stripe_subscription_id?: string | null
          temp_access_token?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "guest_subscriptions_temp_access_token_fkey"
            columns: ["temp_access_token"]
            isOneToOne: false
            referencedRelation: "temp_access_tokens"
            referencedColumns: ["id"]
          },
        ]
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      purchase_notifications: {
        Row: {
          created_at: string | null
          id: string
          is_real: boolean | null
          location: string
          name: string
          product_type: string
          time_ago_minutes: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_real?: boolean | null
          location: string
          name: string
          product_type: string
          time_ago_minutes?: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_real?: boolean | null
          location?: string
          name?: string
          product_type?: string
          time_ago_minutes?: number
        }
        Relationships: []
      }
      quiz_progress: {
        Row: {
          completed_levels: number[] | null
          created_at: string
          current_level: number
          id: string
          last_quiz_date: string
          user_id: string
        }
        Insert: {
          completed_levels?: number[] | null
          created_at?: string
          current_level?: number
          id?: string
          last_quiz_date?: string
          user_id: string
        }
        Update: {
          completed_levels?: number[] | null
          created_at?: string
          current_level?: number
          id?: string
          last_quiz_date?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      quiz_questions: {
        Row: {
          category: string
          created_at: string
          explanation: string | null
          id: string
          level: number
          question: string
          subcategory: string | null
          weight: number | null
        }
        Insert: {
          category: string
          created_at?: string
          explanation?: string | null
          id?: string
          level: number
          question: string
          subcategory?: string | null
          weight?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          explanation?: string | null
          id?: string
          level?: number
          question?: string
          subcategory?: string | null
          weight?: number | null
        }
        Relationships: []
      }
      quiz_results: {
        Row: {
          access_method: string | null
          answers: Json
          category_scores: Json | null
          created_at: string
          detailed_analysis: string | null
          id: string
          is_detailed: boolean | null
          is_purchased: boolean | null
          personality_type: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          access_method?: string | null
          answers: Json
          category_scores?: Json | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          is_detailed?: boolean | null
          is_purchased?: boolean | null
          personality_type: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          access_method?: string | null
          answers?: Json
          category_scores?: Json | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          is_detailed?: boolean | null
          is_purchased?: boolean | null
          personality_type?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "quiz_results_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          processed_at: string | null
          raw_event: Json
          status: string
          stripe_event_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          processed_at?: string | null
          raw_event: Json
          status?: string
          stripe_event_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          processed_at?: string | null
          raw_event?: Json
          status?: string
          stripe_event_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_type: string
          status: string
          stripe_customer_id: string | null
          stripe_price_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_type?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_price_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      team_assessment_results: {
        Row: {
          assessment_date: string
          average_level: number
          created_at: string
          id: string
          individual_results: Json
          recommendations: string
          strengths: string[]
          team_id: string
          weaknesses: string[]
        }
        Insert: {
          assessment_date?: string
          average_level: number
          created_at?: string
          id?: string
          individual_results: Json
          recommendations: string
          strengths: string[]
          team_id: string
          weaknesses: string[]
        }
        Update: {
          assessment_date?: string
          average_level?: number
          created_at?: string
          id?: string
          individual_results?: Json
          recommendations?: string
          strengths?: string[]
          team_id?: string
          weaknesses?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "team_assessment_results_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      team_members: {
        Row: {
          created_at: string
          id: string
          role: string
          team_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: string
          team_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: string
          team_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_members_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          created_at: string
          id: string
          name: string
          organization_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          organization_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          organization_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "teams_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      temp_access_tokens: {
        Row: {
          created_at: string | null
          email: string
          expires_at: string
          id: string
          token: string
          updated_at: string | null
          used: boolean | null
        }
        Insert: {
          created_at?: string | null
          email: string
          expires_at?: string
          id?: string
          token: string
          updated_at?: string | null
          used?: boolean | null
        }
        Update: {
          created_at?: string | null
          email?: string
          expires_at?: string
          id?: string
          token?: string
          updated_at?: string | null
          used?: boolean | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_random_purchase_notification: {
        Args: Record<PropertyKey, never>
        Returns: {
          id: string
          name: string
          location: string
          product_type: string
          time_ago_minutes: number
          is_real: boolean
          created_at: string
        }[]
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
