import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AgentPerformance {
  agent_id: string;
  agent_name: string;
  team_lead_id: string;
  team_name: string;
  total_calls: number;
  total_emails: number;
  total_live_chat: number;
  total_escalations: number;
  total_qa_assessments: number;
  total_walk_ins: number;
  total_issues: number;
  performance_rank: number;
}

interface UseAgentPerformanceOptions {
  teamLeadId?: string;
  startDate?: string;
  endDate?: string;
  limit?: number;
}

export const useAgentPerformance = ({
  teamLeadId,
  startDate,
  endDate,
  limit = 100,
}: UseAgentPerformanceOptions = {}) => {
  const [data, setData] = useState<AgentPerformance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    fetchAgentPerformance();
    
    // Set up real-time subscription
    const channel = supabase
      .channel('agent-performance-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'csr_daily'
        },
        () => {
          fetchAgentPerformance();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [teamLeadId, startDate, endDate, limit]);

  const fetchAgentPerformance = async () => {
    try {
      setLoading(true);
      setError(null);

      // First, get team lead name if teamLeadId is provided
      let teamLeadName: string | null = null;
      if (teamLeadId) {
        const { data: teamLeadData } = await supabase
          .from('team_leads')
          .select('name')
          .eq('id', teamLeadId)
          .single();
        teamLeadName = teamLeadData?.name || null;
      }

      // Fetch from csr_daily table
      let query = supabase
        .from('csr_daily')
        .select('*');

      const { data: dailyData, error: dailyError } = await query;

      if (dailyError) throw dailyError;

      // Aggregate data by agent
      const agentMap = new Map<string, AgentPerformance>();
      
      dailyData?.forEach((record) => {
        const agentId = record.agentid || '';
        const agentName = record.Agent || 'Unknown';
        const teamLeadGroup = record['Team Lead Group'] || '';
        const teamName = record.Group || '';
        const recordDate = record.Date || '';
        
        // Filter by team lead name if specified
        if (teamLeadName && teamLeadGroup !== teamLeadName) {
          return;
        }

        // Filter by date range
        if (startDate && recordDate < startDate) {
          return;
        }
        if (endDate && recordDate > endDate) {
          return;
        }
        
        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, {
            agent_id: agentId,
            agent_name: agentName,
            team_lead_id: teamLeadGroup,
            team_name: teamName,
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_walk_ins: 0,
            total_issues: 0,
            performance_rank: 0,
          });
        }

        const agent = agentMap.get(agentId)!;
        agent.total_calls += parseInt(record.Calls || '0', 10);
        agent.total_live_chat += parseInt(record['Live Chat'] || '0', 10);
        agent.total_emails += parseInt(record['Support/DNS Emails'] || '0', 10);
        agent.total_walk_ins += parseInt(record['Walk-Ins'] || '0', 10);
        
        // Calculate total issues (all support tickets)
        const supportEmails = parseInt(record['Support/DNS Emails'] || '0', 10);
        const socialTickets = parseInt(record['Social Tickets'] || '0', 10);
        const billingTickets = parseInt(record['Billing Tickets'] || '0', 10);
        const salesTickets = parseInt(record['Sales Tickets'] || '0', 10);
        agent.total_issues += supportEmails + socialTickets + billingTickets + salesTickets;
      });

      // Convert map to array and sort by total issues
      let performanceData = Array.from(agentMap.values());
      performanceData.sort((a, b) => b.total_issues - a.total_issues);
      
      // Assign ranks
      performanceData.forEach((agent, index) => {
        agent.performance_rank = index + 1;
      });

      // Apply limit
      if (limit) {
        performanceData = performanceData.slice(0, limit);
      }

      setData(performanceData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch agent performance';
      setError(err instanceof Error ? err : new Error(errorMessage));
      toast({
        title: 'Error',
        description: errorMessage,
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const refetch = () => {
    fetchAgentPerformance();
  };

  return {
    data,
    loading,
    error,
    refetch,
  };
};
