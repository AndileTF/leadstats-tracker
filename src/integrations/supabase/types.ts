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
          {
            foreignKeyName: "After Call Survey Tickets_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
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
          {
            foreignKeyName: "agents_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
          },
        ]
      }
      Calls: {
        Row: {
          call_count: number | null
          Date: string
          Name: string
          team_lead_id: string | null
        }
        Insert: {
          call_count?: number | null
          Date: string
          Name: string
          team_lead_id?: string | null
        }
        Update: {
          call_count?: number | null
          Date?: string
          Name?: string
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
          {
            foreignKeyName: "Calls_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
          },
        ]
      }
      daily_stats: {
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
            foreignKeyName: "daily_stats_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "daily_stats_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
          },
        ]
      }
      Emails: {
        Row: {
          Date: string
          email_count: number | null
          Name: string
          team_lead_id: string | null
        }
        Insert: {
          Date: string
          email_count?: number | null
          Name: string
          team_lead_id?: string | null
        }
        Update: {
          Date?: string
          email_count?: number | null
          Name?: string
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
          {
            foreignKeyName: "Emails_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
          },
        ]
      }
      Escalations: {
        Row: {
          Date: string
          escalation_count: number | null
          Name: string
          team_lead_id: string | null
        }
        Insert: {
          Date: string
          escalation_count?: number | null
          Name: string
          team_lead_id?: string | null
        }
        Update: {
          Date?: string
          escalation_count?: number | null
          Name?: string
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
          {
            foreignKeyName: "Escalations_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
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
          {
            foreignKeyName: "Live Chat_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
          },
        ]
      }
      "QA Table": {
        Row: {
          assessment_count: number | null
          Assessor: string
          Date: string
          team_lead_id: string | null
        }
        Insert: {
          assessment_count?: number | null
          Assessor: string
          Date: string
          team_lead_id?: string | null
        }
        Update: {
          assessment_count?: number | null
          Assessor?: string
          Date?: string
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
          {
            foreignKeyName: "QA Table_team_lead_id_fkey"
            columns: ["team_lead_id"]
            isOneToOne: false
            referencedRelation: "team_metrics"
            referencedColumns: ["team_lead_id"]
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
      team_lead_overview: {
        Row: {
          average_sla: number | null
          end_date: string | null
          name: string | null
          start_date: string | null
          total_calls: number | null
          total_days: number | null
          total_emails: number | null
          total_escalations: number | null
          total_live_chat: number | null
          total_qa_assessments: number | null
        }
        Relationships: []
      }
      team_metrics: {
        Row: {
          team_lead_id: string | null
          team_lead_name: string | null
          total_calls: number | null
          total_chats: number | null
          total_emails: number | null
          total_escalations: number | null
          total_qa_assessments: number | null
          total_survey_tickets: number | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_weekly_stats: {
        Args: { start_date: string }
        Returns: {
          team_lead_id: string
          total_calls: number
          total_emails: number
          total_live_chat: number
          total_escalations: number
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
