import { Agent } from './teamLead';

export interface AgentPerformanceMetrics {
  id: string;
  agent_id: string;
  date: string;
  calls: number;
  emails: number;
  live_chat: number;
  escalations: number;
  qa_assessments: number;
  walk_ins: number;
  avg_response_time?: number; // in minutes
  customer_satisfaction?: number; // 1-5 scale
  tickets_resolved?: number;
  first_call_resolution?: number; // percentage
  created_at: string;
  updated_at: string;
}

export interface AgentPerformanceWithDetails extends AgentPerformanceMetrics {
  agent: Agent;
  total_interactions: number;
  efficiency_score: number; // calculated metric
  performance_trend: 'up' | 'down' | 'stable';
}

export interface AgentPerformanceFilters {
  search: string;
  teamLeadId?: string;
  dateRange: {
    startDate: string;
    endDate: string;
  };
  sortBy: 'name' | 'calls' | 'emails' | 'efficiency_score' | 'customer_satisfaction';
  sortOrder: 'asc' | 'desc';
  minCalls?: number;
  minEmails?: number;
  showTopPerformersOnly?: boolean;
}

export interface AgentPerformanceSummary {
  agent_id: string;
  agent_name: string;
  team_lead_id: string;
  total_calls: number;
  total_emails: number;
  total_live_chat: number;
  total_escalations: number;
  total_qa_assessments: number;
  total_walk_ins: number;
  avg_customer_satisfaction: number;
  efficiency_score: number;
  days_active: number;
  trend: 'up' | 'down' | 'stable';
}

export interface AgentRanking {
  agent_id: string;
  agent_name: string;
  team_lead_id: string;
  total_calls: number;
  total_emails: number;
  total_live_chat: number;
  total_escalations: number;
  total_qa_assessments: number;
  total_walk_ins: number;
  avg_customer_satisfaction: number;
  efficiency_score: number;
  performance_rank: number;
}