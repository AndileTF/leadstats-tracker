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
          table: 'agent_performance_metrics'
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

      // Call the database function for agent performance rankings
      const { data: performanceData, error: performanceError } = await supabase
        .rpc('get_agent_performance_rankings', {
          team_lead_id_param: teamLeadId || null,
          start_date_param: startDate || null,
          end_date_param: endDate || null,
          limit_count: limit,
        });

      if (performanceError) throw performanceError;

      setData(performanceData || []);
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
