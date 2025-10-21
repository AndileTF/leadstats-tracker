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
      agent_performance_metrics: {
        Row: {
          agent_id: string
          avg_response_time: number | null
          calls: number | null
          created_at: string
          customer_satisfaction: number | null
          date: string
          emails: number | null
          escalations: number | null
          first_call_resolution: number | null
          id: string
          live_chat: number | null
          qa_assessments: number | null
          tickets_resolved: number | null
          updated_at: string
          walk_ins: number | null
        }
        Insert: {
          agent_id: string
          avg_response_time?: number | null
          calls?: number | null
          created_at?: string
          customer_satisfaction?: number | null
          date?: string
          emails?: number | null
          escalations?: number | null
          first_call_resolution?: number | null
          id?: string
          live_chat?: number | null
          qa_assessments?: number | null
          tickets_resolved?: number | null
          updated_at?: string
          walk_ins?: number | null
        }
        Update: {
          agent_id?: string
          avg_response_time?: number | null
          calls?: number | null
          created_at?: string
          customer_satisfaction?: number | null
          date?: string
          emails?: number | null
          escalations?: number | null
          first_call_resolution?: number | null
          id?: string
          live_chat?: number | null
          qa_assessments?: number | null
          tickets_resolved?: number | null
          updated_at?: string
          walk_ins?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "agent_performance_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
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
      csr_agents: {
        Row: {
          Agent: string | null
          agentid: string | null
          Email: string | null
          Profile: string | null
        }
        Insert: {
          Agent?: string | null
          agentid?: string | null
          Email?: string | null
          Profile?: string | null
        }
        Update: {
          Agent?: string | null
          agentid?: string | null
          Email?: string | null
          Profile?: string | null
        }
        Relationships: []
      }
      csr_daily: {
        Row: {
          Agent: string | null
          agentid: string | null
          "Billing Tickets": string | null
          Calls: string | null
          Date: string | null
          Email: string | null
          Group: string | null
          "Live Chat": string | null
          Profile: string | null
          "Sales Tickets": string | null
          "Social Tickets": string | null
          "Support/DNS Emails": string | null
          "Team Lead Group": string | null
          "Walk-Ins": string | null
        }
        Insert: {
          Agent?: string | null
          agentid?: string | null
          "Billing Tickets"?: string | null
          Calls?: string | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          Profile?: string | null
          "Sales Tickets"?: string | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Update: {
          Agent?: string | null
          agentid?: string | null
          "Billing Tickets"?: string | null
          Calls?: string | null
          Date?: string | null
          Email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          Profile?: string | null
          "Sales Tickets"?: string | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Relationships: []
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
          team_lead_id: string
          walk_ins: number | null
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
          team_lead_id: string
          walk_ins?: number | null
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
          team_lead_id?: string
          walk_ins?: number | null
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
      import_history: {
        Row: {
          can_rollback: boolean | null
          created_at: string
          file_path: string | null
          filename: string
          id: string
          import_date: string
          imported_by: string | null
          rows_imported: number
          status: string
        }
        Insert: {
          can_rollback?: boolean | null
          created_at?: string
          file_path?: string | null
          filename: string
          id?: string
          import_date?: string
          imported_by?: string | null
          rows_imported?: number
          status?: string
        }
        Update: {
          can_rollback?: boolean | null
          created_at?: string
          file_path?: string | null
          filename?: string
          id?: string
          import_date?: string
          imported_by?: string | null
          rows_imported?: number
          status?: string
        }
        Relationships: []
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
          team_lead_id: string | null
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
          team_lead_id?: string | null
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
          team_lead_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      servicenow_sync_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          records_synced: number | null
          status: string
          sync_date: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          status: string
          sync_date?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          records_synced?: number | null
          status?: string
          sync_date?: string
        }
        Relationships: []
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
      user_roles: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
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
      get_agent_performance_rankings: {
        Args: {
          end_date_param?: string
          limit_count?: number
          start_date_param?: string
          team_lead_id_param?: string
        }
        Returns: {
          agent_id: string
          agent_name: string
          avg_customer_satisfaction: number
          efficiency_score: number
          performance_rank: number
          team_lead_id: string
          total_calls: number
          total_emails: number
          total_escalations: number
          total_live_chat: number
          total_qa_assessments: number
          total_walk_ins: number
        }[]
      }
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
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
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
      has_role: {
        Args:
          | { _role: Database["public"]["Enums"]["app_role"]; _user_id: string }
          | { _role: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "agent" | "team_lead" | "admin"
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
      app_role: ["agent", "team_lead", "admin"],
    },
  },
} as const
