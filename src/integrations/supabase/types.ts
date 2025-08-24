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
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      "After Call Survey Tickets": {
        Row: {
          created_at: string
          date: string
          id: string
          team_lead_id: string
          ticket_count: number | null
        }
        Insert: {
          created_at?: string
          date?: string
          id?: string
          team_lead_id: string
          ticket_count?: number | null
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          team_lead_id?: string
          ticket_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "After Call Survey Tickets_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          created_at: string | null
          group_name: string | null
          id: string
          name: string
          start_date: string | null
          team_lead_id: string | null
        }
        Insert: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          name: string
          start_date?: string | null
          team_lead_id?: string | null
        }
        Update: {
          created_at?: string | null
          group_name?: string | null
          id?: string
          name?: string
          start_date?: string | null
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "agents_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      Calls: {
        Row: {
          call_count: number | null
          Date: string
          "end time": string | null
          Name: string
          "start time": string | null
          team_lead_id: string | null
        }
        Insert: {
          call_count?: number | null
          Date: string
          "end time"?: string | null
          Name: string
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Update: {
          call_count?: number | null
          Date?: string
          "end time"?: string | null
          Name?: string
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Calls_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      daily_stats_duplicate: {
        Row: {
          calls: number | null
          created_at: string
          date: string
          emails: number | null
          escalations: number | null
          id: string
          live_chat: number | null
          qa_assessments: number | null
          sla_percentage: number
          survey_tickets: number | null
          team_lead_id: string
        }
        Insert: {
          calls?: number | null
          created_at?: string
          date?: string
          emails?: number | null
          escalations?: number | null
          id?: string
          live_chat?: number | null
          qa_assessments?: number | null
          sla_percentage?: number
          survey_tickets?: number | null
          team_lead_id: string
        }
        Update: {
          calls?: number | null
          created_at?: string
          date?: string
          emails?: number | null
          escalations?: number | null
          id?: string
          live_chat?: number | null
          qa_assessments?: number | null
          sla_percentage?: number
          survey_tickets?: number | null
          team_lead_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_duplicate_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      Emails: {
        Row: {
          Date: string
          email_count: number | null
          "end time": string | null
          Name: string
          "start time": string | null
          team_lead_id: string | null
        }
        Insert: {
          Date: string
          email_count?: number | null
          "end time"?: string | null
          Name: string
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Update: {
          Date?: string
          email_count?: number | null
          "end time"?: string | null
          Name?: string
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Emails_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      Escalations: {
        Row: {
          Date: string
          "End time": string | null
          escalation_count: number | null
          Name: string
          "Start time": string | null
          team_lead_id: string | null
        }
        Insert: {
          Date: string
          "End time"?: string | null
          escalation_count?: number | null
          Name: string
          "Start time"?: string | null
          team_lead_id?: string | null
        }
        Update: {
          Date?: string
          "End time"?: string | null
          escalation_count?: number | null
          Name?: string
          "Start time"?: string | null
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Escalations_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      "Live Chat": {
        Row: {
          chat_count: number | null
          Date: string
          Name: string
          team_lead_id: string | null
        }
        Insert: {
          chat_count?: number | null
          Date: string
          Name: string
          team_lead_id?: string | null
        }
        Update: {
          chat_count?: number | null
          Date?: string
          Name?: string
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "Live Chat_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          password_changed: boolean | null
          role: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          password_changed?: boolean | null
          role?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          password_changed?: boolean | null
          role?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      "QA Table": {
        Row: {
          assessment_count: number | null
          Assessor: string | null
          Date: string | null
          "end time": string | null
          "start time": string | null
          team_lead_id: string | null
        }
        Insert: {
          assessment_count?: number | null
          Assessor?: string | null
          Date?: string | null
          "end time"?: string | null
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Update: {
          assessment_count?: number | null
          Assessor?: string | null
          Date?: string | null
          "end time"?: string | null
          "start time"?: string | null
          team_lead_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "QA Table_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      team_leads: {
        Row: {
          assigned_agents_count: number | null
          created_at: string
          id: string
          name: string
        }
        Insert: {
          assigned_agents_count?: number | null
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          assigned_agents_count?: number | null
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_profile_role: {
        Args: { user_id: string }
        Returns: string
      }
      get_tables_list: {
        Args: Record<PropertyKey, never>
        Returns: {
          table_name: string
        }[]
      }
      get_weekly_stats: {
        Args: { start_date: string }
        Returns: {
          team_lead_id: string
          total_calls: number
          total_emails: number
          total_escalations: number
          total_live_chat: number
          total_qa_assessments: number
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
