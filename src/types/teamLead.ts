
export interface TeamLead {
  id: string;
  name: string;
  created_at: string;
}

export interface DailyStats {
  id: string;
  team_lead_id: string;
  date: string;
  calls: number | null;
  emails: number | null;
  live_chat: number | null;
  escalations: number | null;
  qa_assessments: number | null;
  average_handling_time: string;
  average_wait_time: string;
  abandon_rate: number;
  sla_percentage: number;
  created_at: string;
}

export interface TeamLeadOverview {
  name: string | null;
  total_days: number | null;
  total_calls: number | null;
  total_emails: number | null;
  total_live_chat: number | null;
  total_escalations: number | null;
  total_qa_assessments: number | null;
  avg_handling_time_minutes: number | null;
  avg_wait_time_minutes: number | null;
  average_abandon_rate: number | null;
  average_sla: number | null;
}

export type DateFilter = 'day' | 'week' | 'month' | 'custom';
