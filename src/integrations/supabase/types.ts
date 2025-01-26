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
          answers: Json
          category_scores: Json | null
          created_at: string
          detailed_analysis: string | null
          id: string
          is_detailed: boolean | null
          is_purchased: boolean | null
          personality_type: string
          user_id: string
        }
        Insert: {
          answers: Json
          category_scores?: Json | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          is_detailed?: boolean | null
          is_purchased?: boolean | null
          personality_type: string
          user_id: string
        }
        Update: {
          answers?: Json
          category_scores?: Json | null
          created_at?: string
          detailed_analysis?: string | null
          id?: string
          is_detailed?: boolean | null
          is_purchased?: boolean | null
          personality_type?: string
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
