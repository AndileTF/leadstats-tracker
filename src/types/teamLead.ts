
export interface TeamLead {
  id: string;
  name: string;
  created_at: string;
  assigned_agents_count?: number;
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
  walk_ins: number | null;
  sla_percentage?: number | null;
  created_at: string;
}

export interface TeamLeadOverview {
  name: string | null;
  team_lead_id: string;
  total_days: number | null;
  total_calls: number | null;
  total_emails: number | null;
  total_live_chat: number | null;
  total_escalations: number | null;
  total_qa_assessments: number | null;
  total_walk_ins: number | null;
  average_sla?: number | null;
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

export interface Agent {
  id: string;
  name: string;
  team_lead_id: string;
  group_name: string;
  start_date: string;
  created_at: string;
}
