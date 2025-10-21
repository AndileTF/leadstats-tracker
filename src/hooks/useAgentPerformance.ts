import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export interface AgentPerformance {
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

      // Fetch from csr_daily table and aggregate by agent
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
        const agentId = record.agentid || '';
        const agentName = record.Agent || 'Unknown';
        
        if (!agentMap.has(agentId)) {
          agentMap.set(agentId, {
            agent_id: agentId,
            agent_name: agentName,
            team_lead_id: '', // Will be set if needed
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_walk_ins: 0,
            avg_customer_satisfaction: 0,
            efficiency_score: 0,
            performance_rank: 0,
          });
        }

        const agent = agentMap.get(agentId)!;
        agent.total_calls += parseInt(record.Calls || '0', 10);
        agent.total_live_chat += parseInt(record['Live Chat'] || '0', 10);
        agent.total_emails += parseInt(record['Support/DNS Emails'] || '0', 10);
        agent.total_walk_ins += parseInt(record['Walk-Ins'] || '0', 10);
      });

      // Convert map to array and calculate efficiency scores
      let performanceData = Array.from(agentMap.values()).map((agent) => {
        const totalInteractions = agent.total_calls + agent.total_live_chat + agent.total_emails;
        agent.efficiency_score = totalInteractions > 0 
          ? ((agent.total_calls + agent.total_live_chat + agent.total_emails - agent.total_escalations) / totalInteractions)
          : 0;
        return agent;
      });

      // Sort by efficiency score and assign ranks
      performanceData.sort((a, b) => b.efficiency_score - a.efficiency_score);
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
