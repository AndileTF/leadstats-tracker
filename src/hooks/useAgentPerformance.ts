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

      // First, get agents with their team lead info
      let agentsQuery = supabase
        .from('agents')
        .select('id, name, team_lead_id, team_leads(name)');

      // Filter by team lead if provided
      if (teamLeadId) {
        agentsQuery = agentsQuery.eq('team_lead_id', teamLeadId);
      }

      const { data: agentsData, error: agentsError } = await agentsQuery;
      if (agentsError) throw agentsError;

      // Create a map of agent names to their IDs and team info
      const agentNameMap = new Map<string, { id: string; teamLeadId: string; teamName: string }>();
      agentsData?.forEach((agent: any) => {
        agentNameMap.set(agent.name, {
          id: agent.id,
          teamLeadId: agent.team_lead_id,
          teamName: agent.team_leads?.name || 'Unknown Team',
        });
      });

      // Fetch from csr_daily table
      let query = supabase
        .from('csr_daily')
        .select('*');

      // Apply date filters if provided
      if (startDate) {
        query = query.gte('Date', startDate);
      }
      if (endDate) {
        query = query.lte('Date', endDate);
      }

      const { data: dailyData, error: dailyError } = await query;
      if (dailyError) throw dailyError;

      // Aggregate data by agent
      const agentMap = new Map<string, AgentPerformance>();
      
      dailyData?.forEach((record) => {
        const agentName = record.Agent || 'Unknown';
        const agentInfo = agentNameMap.get(agentName);
        
        // Skip if agent not in our filtered list
        if (!agentInfo) return;
        
        if (!agentMap.has(agentInfo.id)) {
          agentMap.set(agentInfo.id, {
            agent_id: agentInfo.id,
            agent_name: agentName,
            team_lead_id: agentInfo.teamLeadId,
            team_name: agentInfo.teamName,
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

        const agent = agentMap.get(agentInfo.id)!;
        agent.total_calls += parseInt(record.Calls || '0', 10);
        agent.total_live_chat += parseInt(record['Live Chat'] || '0', 10);
        agent.total_emails += parseInt(record['Support/DNS Emails'] || '0', 10);
        agent.total_walk_ins += parseInt(record['Walk-Ins'] || '0', 10);
        
        // Calculate total issues (emails + social + billing + sales tickets)
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
