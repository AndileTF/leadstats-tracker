import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { 
  AgentPerformanceMetrics, 
  AgentPerformanceWithDetails, 
  AgentPerformanceFilters,
  AgentPerformanceSummary 
} from '@/types/agentPerformance';
import { Agent } from '@/types/teamLead';

export const useAgentPerformance = (filters: AgentPerformanceFilters) => {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [performanceData, setPerformanceData] = useState<AgentPerformanceMetrics[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch agents
  const fetchAgents = async () => {
    try {
      let query = supabase.from('agents').select('*');
      
      if (filters.teamLeadId) {
        query = query.eq('team_lead_id', filters.teamLeadId);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      setAgents(data || []);
    } catch (err: any) {
      console.error('Error fetching agents:', err);
      setError(err.message);
    }
  };

  // Fetch performance data (simulated for now, as we don't have the performance table yet)
  const fetchPerformanceData = async () => {
    try {
      setIsLoading(true);
      
      // For now, we'll generate mock performance data based on existing stats
      // In a real implementation, this would query an agent_performance table
      const mockPerformanceData: AgentPerformanceMetrics[] = agents.map(agent => {
        const baseDate = new Date(filters.dateRange.startDate);
        const endDate = new Date(filters.dateRange.endDate);
        const metrics: AgentPerformanceMetrics[] = [];
        
        // Generate daily metrics for each agent
        for (let d = new Date(baseDate); d <= endDate; d.setDate(d.getDate() + 1)) {
          const dateStr = d.toISOString().split('T')[0];
          
          metrics.push({
            id: `${agent.id}-${dateStr}`,
            agent_id: agent.id,
            date: dateStr,
            calls: Math.floor(Math.random() * 50) + 10,
            emails: Math.floor(Math.random() * 30) + 5,
            live_chat: Math.floor(Math.random() * 20) + 3,
            escalations: Math.floor(Math.random() * 5),
            qa_assessments: Math.floor(Math.random() * 3) + 1,
            survey_tickets: Math.floor(Math.random() * 10) + 2,
            avg_response_time: Math.floor(Math.random() * 30) + 5,
            customer_satisfaction: Math.random() * 2 + 3, // 3-5 range
            tickets_resolved: Math.floor(Math.random() * 40) + 15,
            first_call_resolution: Math.random() * 40 + 60, // 60-100%
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
        
        return metrics;
      }).flat();
      
      setPerformanceData(mockPerformanceData);
    } catch (err: any) {
      console.error('Error fetching performance data:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch agent performance data",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate performance summaries
  const performanceSummaries = useMemo(() => {
    if (!agents.length || !performanceData.length) return [];
    
    const summaries: AgentPerformanceSummary[] = agents.map(agent => {
      const agentMetrics = performanceData.filter(p => p.agent_id === agent.id);
      
      if (agentMetrics.length === 0) {
        return {
          agent_id: agent.id,
          agent_name: agent.name,
          team_lead_id: agent.team_lead_id,
          total_calls: 0,
          total_emails: 0,
          total_live_chat: 0,
          total_escalations: 0,
          total_qa_assessments: 0,
          total_survey_tickets: 0,
          avg_customer_satisfaction: 0,
          efficiency_score: 0,
          days_active: 0,
          trend: 'stable' as const
        };
      }
      
      const totals = agentMetrics.reduce((acc, metric) => ({
        calls: acc.calls + metric.calls,
        emails: acc.emails + metric.emails,
        live_chat: acc.live_chat + metric.live_chat,
        escalations: acc.escalations + metric.escalations,
        qa_assessments: acc.qa_assessments + metric.qa_assessments,
        survey_tickets: acc.survey_tickets + metric.survey_tickets,
        customer_satisfaction: acc.customer_satisfaction + (metric.customer_satisfaction || 0),
        tickets_resolved: acc.tickets_resolved + (metric.tickets_resolved || 0)
      }), {
        calls: 0, emails: 0, live_chat: 0, escalations: 0,
        qa_assessments: 0, survey_tickets: 0, customer_satisfaction: 0, tickets_resolved: 0
      });
      
      const daysActive = agentMetrics.length;
      const avgCustomerSat = totals.customer_satisfaction / daysActive;
      
      // Calculate efficiency score (example formula)
      const totalInteractions = totals.calls + totals.emails + totals.live_chat;
      const efficiencyScore = totalInteractions > 0 
        ? Math.round(((totals.tickets_resolved / totalInteractions) * avgCustomerSat) * 20)
        : 0;
      
      // Calculate trend (simplified)
      const recentMetrics = agentMetrics.slice(-7); // Last 7 days
      const olderMetrics = agentMetrics.slice(0, -7);
      const recentAvg = recentMetrics.length ? 
        recentMetrics.reduce((acc, m) => acc + m.calls + m.emails, 0) / recentMetrics.length : 0;
      const olderAvg = olderMetrics.length ?
        olderMetrics.reduce((acc, m) => acc + m.calls + m.emails, 0) / olderMetrics.length : recentAvg;
      
      let trend: 'up' | 'down' | 'stable' = 'stable';
      if (recentAvg > olderAvg * 1.1) trend = 'up';
      else if (recentAvg < olderAvg * 0.9) trend = 'down';
      
      return {
        agent_id: agent.id,
        agent_name: agent.name,
        team_lead_id: agent.team_lead_id,
        total_calls: totals.calls,
        total_emails: totals.emails,
        total_live_chat: totals.live_chat,
        total_escalations: totals.escalations,
        total_qa_assessments: totals.qa_assessments,
        total_survey_tickets: totals.survey_tickets,
        avg_customer_satisfaction: Number(avgCustomerSat.toFixed(2)),
        efficiency_score: efficiencyScore,
        days_active: daysActive,
        trend
      };
    });
    
    return summaries;
  }, [agents, performanceData]);

  // Apply filters and sorting
  const filteredSummaries = useMemo(() => {
    let filtered = [...performanceSummaries];
    
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(summary =>
        summary.agent_name.toLowerCase().includes(searchLower)
      );
    }
    
    // Minimum calls filter
    if (filters.minCalls) {
      filtered = filtered.filter(summary => summary.total_calls >= filters.minCalls!);
    }
    
    // Minimum emails filter
    if (filters.minEmails) {
      filtered = filtered.filter(summary => summary.total_emails >= filters.minEmails!);
    }
    
    // Top performers only
    if (filters.showTopPerformersOnly) {
      const avgEfficiency = filtered.reduce((acc, s) => acc + s.efficiency_score, 0) / filtered.length;
      filtered = filtered.filter(summary => summary.efficiency_score > avgEfficiency);
    }
    
    // Sorting
    filtered.sort((a, b) => {
      let aVal: number | string;
      let bVal: number | string;
      
      if (filters.sortBy === 'name') {
        aVal = a.agent_name;
        bVal = b.agent_name;
      } else if (filters.sortBy === 'calls') {
        aVal = a.total_calls;
        bVal = b.total_calls;
      } else if (filters.sortBy === 'emails') {
        aVal = a.total_emails;
        bVal = b.total_emails;
      } else if (filters.sortBy === 'efficiency_score') {
        aVal = a.efficiency_score;
        bVal = b.efficiency_score;
      } else if (filters.sortBy === 'customer_satisfaction') {
        aVal = a.avg_customer_satisfaction;
        bVal = b.avg_customer_satisfaction;
      } else {
        aVal = a.efficiency_score;
        bVal = b.efficiency_score;
      }
      
      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return filters.sortOrder === 'asc' 
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }
      
      return filters.sortOrder === 'asc' 
        ? (aVal as number) - (bVal as number)
        : (bVal as number) - (aVal as number);
    });
    
    return filtered;
  }, [performanceSummaries, filters]);

  useEffect(() => {
    fetchAgents();
  }, [filters.teamLeadId]);

  useEffect(() => {
    if (agents.length > 0) {
      fetchPerformanceData();
    }
  }, [agents, filters.dateRange]);

  return {
    agents,
    performanceData,
    performanceSummaries: filteredSummaries,
    isLoading,
    error,
    refetch: fetchPerformanceData
  };
};