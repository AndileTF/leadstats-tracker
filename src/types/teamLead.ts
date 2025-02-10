
export interface TeamLead {
  id: string;
  name: string;
  created_at: string;
}

export interface DailyStats {
  id: string;
  team_lead_id: string;
  date: string;
  calls: number;
  emails: number;
  live_chat: number;
  escalations: number;
  qa_assessments: number;
  average_handling_time: string;
  average_wait_time: string;
  abandon_rate: number;
  sla_percentage: number;
  created_at: string;
}

export interface TeamLeadOverview {
  name: string;
  total_days: number;
  total_calls: number;
  total_emails: number;
  total_live_chat: number;
  total_escalations: number;
  total_qa_assessments: number;
  avg_handling_time_minutes: number;
  avg_wait_time_minutes: number;
  average_abandon_rate: number;
  average_sla: number;
}

export type DateFilter = 'day' | 'week' | 'month' | 'custom';
