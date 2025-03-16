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
          created_at: string
          group_name: string
          id: string
          name: string
          start_date: string
          team_lead_id: string | null
        }
        Insert: {
          created_at?: string
          group_name: string
          id?: string
          name: string
          start_date?: string
          team_lead_id?: string | null
        }
        Update: {
          created_at?: string
          group_name?: string
          id?: string
          name?: string
          start_date?: string
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
        Args: {
          start_date: string
        }
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
