import { useState, useEffect } from 'react';
import { AgentPerformanceDashboard } from '@/components/agents/AgentPerformanceDashboard';
import { TeamLead } from '@/types/teamLead';
import { dbClient } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

const AgentPerformancePage = () => {
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  const fetchTeamLeads = async () => {
    try {
      const data = await dbClient.getTeamLeads();
      setTeamLeads(data);
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team leads from database",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        <AgentPerformanceDashboard teamLeads={teamLeads} />
      </div>
    </div>
  );
};

export default AgentPerformancePage;