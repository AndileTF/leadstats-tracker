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
      csr_agent_proflie: {
        Row: {
          agent: string | null
          agentid: string
          email: string | null
          profile: string | null
        }
        Insert: {
          agent?: string | null
          agentid?: string
          email?: string | null
          profile?: string | null
        }
        Update: {
          agent?: string | null
          agentid?: string
          email?: string | null
          profile?: string | null
        }
        Relationships: []
      }
      daily_stats: {
        Row: {
          agent: string | null
          agentid: string
          "Billing Tickets": string | null
          calls: number | null
          date: string | null
          email: string | null
          Group: string | null
          "Live Chat": string | null
          profile: string | null
          "Sales Tickets": number | null
          "Social Tickets": string | null
          "Support/DNS Emails": string | null
          "Team Lead Group": string | null
          "Walk-Ins": string | null
        }
        Insert: {
          agent?: string | null
          agentid: string
          "Billing Tickets"?: string | null
          calls?: number | null
          date?: string | null
          email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          profile?: string | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Update: {
          agent?: string | null
          agentid?: string
          "Billing Tickets"?: string | null
          calls?: number | null
          date?: string | null
          email?: string | null
          Group?: string | null
          "Live Chat"?: string | null
          profile?: string | null
          "Sales Tickets"?: number | null
          "Social Tickets"?: string | null
          "Support/DNS Emails"?: string | null
          "Team Lead Group"?: string | null
          "Walk-Ins"?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "daily_stats_agentid_fkey"
            columns: ["agentid"]
            isOneToOne: false
            referencedRelation: "csr_agent_proflie"
            referencedColumns: ["agentid"]
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
      leadstats_kpi_records: {
        Row: {
          billing_tickets: number | null
          calls: number | null
          created_at: string
          date: string
          hour_of_day: number | null
          id: string
          live_chat: number | null
          sales_tickets: number | null
          social_tickets: number | null
          support_dns_emails: number | null
          team_id: string
          total_issues: number | null
          updated_at: string
          user_id: string
          walk_ins: number | null
        }
        Insert: {
          billing_tickets?: number | null
          calls?: number | null
          created_at?: string
          date?: string
          hour_of_day?: number | null
          id?: string
          live_chat?: number | null
          sales_tickets?: number | null
          social_tickets?: number | null
          support_dns_emails?: number | null
          team_id: string
          total_issues?: number | null
          updated_at?: string
          user_id: string
          walk_ins?: number | null
        }
        Update: {
          billing_tickets?: number | null
          calls?: number | null
          created_at?: string
          date?: string
          hour_of_day?: number | null
          id?: string
          live_chat?: number | null
          sales_tickets?: number | null
          social_tickets?: number | null
          support_dns_emails?: number | null
          team_id?: string
          total_issues?: number | null
          updated_at?: string
          user_id?: string
          walk_ins?: number | null
        }
        Relationships: []
      }
      leadstats_performance_goals: {
        Row: {
          created_at: string
          end_date: string | null
          id: string
          is_active: boolean | null
          metric_type: string
          period_type: string
          start_date: string
          target_value: number
          team_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          metric_type: string
          period_type?: string
          start_date: string
          target_value: number
          team_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          metric_type?: string
          period_type?: string
          start_date?: string
          target_value?: number
          team_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      leadstats_qa_scores: {
        Row: {
          assessor_id: string | null
          category: string | null
          comments: string | null
          created_at: string
          date: string
          id: string
          score: number
          team_id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assessor_id?: string | null
          category?: string | null
          comments?: string | null
          created_at?: string
          date?: string
          id?: string
          score: number
          team_id: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assessor_id?: string | null
          category?: string | null
          comments?: string | null
          created_at?: string
          date?: string
          id?: string
          score?: number
          team_id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leadstats_teams: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          supervisor_id: string | null
          team_lead_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          supervisor_id?: string | null
          team_lead_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          supervisor_id?: string | null
          team_lead_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leadstats_users: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          is_active: boolean | null
          role: string
          supervisor_id: string | null
          team_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          supervisor_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          role?: string
          supervisor_id?: string | null
          team_id?: string | null
          updated_at?: string
        }
        Relationships: []
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
      profile: {
        Row: {
          agentid: string | null
          avatar: string | null
          contract_type: string | null
          department: string | null
          email: string | null
          Employment_Group: string | null
          gender: string | null
          name: string | null
          post: string | null
          role: string | null
          team_lead_name: string | null
        }
        Insert: {
          agentid?: string | null
          avatar?: string | null
          contract_type?: string | null
          department?: string | null
          email?: string | null
          Employment_Group?: string | null
          gender?: string | null
          name?: string | null
          post?: string | null
          role?: string | null
          team_lead_name?: string | null
        }
        Update: {
          agentid?: string | null
          avatar?: string | null
          contract_type?: string | null
          department?: string | null
          email?: string | null
          Employment_Group?: string | null
          gender?: string | null
          name?: string | null
          post?: string | null
          role?: string | null
          team_lead_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_agentid_fkey"
            columns: ["agentid"]
            isOneToOne: false
            referencedRelation: "csr_agent_proflie"
            referencedColumns: ["agentid"]
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
