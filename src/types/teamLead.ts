
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
  average_sla: number | null;
}

export type DateFilter = 'day' | 'week' | 'month' | 'custom';
