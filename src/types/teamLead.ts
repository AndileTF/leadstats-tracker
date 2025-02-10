
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
  created_at: string;
}

export type DateFilter = 'day' | 'week' | 'month' | 'custom';
