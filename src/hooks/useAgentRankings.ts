import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { AgentRanking } from '@/types/agentPerformance';

interface UseAgentRankingsProps {
  teamLeadId?: string;
  startDate?: string;
  endDate?: string;
}

export const useAgentRankings = ({ teamLeadId, startDate, endDate }: UseAgentRankingsProps) => {
  const [topAgents, setTopAgents] = useState<AgentRanking[]>([]);
  const [bottomAgents, setBottomAgents] = useState<AgentRanking[]>([]);
  const [allRankings, setAllRankings] = useState<AgentRanking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAgentRankings = async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Call the database function to get agent performance rankings
      const { data, error } = await supabase.rpc('get_agent_performance_rankings', {
        team_lead_id_param: teamLeadId || null,
        start_date_param: startDate || null,
        end_date_param: endDate || null,
        limit_count: 100 // Get all agents, then filter top/bottom 5
      });

      if (error) {
        throw error;
      }

      const rankings: AgentRanking[] = data || [];
      setAllRankings(rankings);
      
      // Get top 5 and bottom 5
      const top5 = rankings.slice(0, 5);
      const bottom5 = rankings.length > 5 ? rankings.slice(-5).reverse() : [];
      
      setTopAgents(top5);
      setBottomAgents(bottom5);

    } catch (err: any) {
      console.error('Error fetching agent rankings:', err);
      setError(err.message);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch agent performance rankings",
      });
      
      // Set empty arrays on error
      setTopAgents([]);
      setBottomAgents([]);
      setAllRankings([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAgentRankings();
  }, [teamLeadId, startDate, endDate]);

  return {
    topAgents,
    bottomAgents,
    allRankings,
    isLoading,
    error,
    refetch: fetchAgentRankings
  };
};