
import { useEffect, useState } from "react";
import AuthLayout from "@/components/AuthLayout";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";
import { AgentsList } from "@/components/dashboard/AgentsList";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats, Agent } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";

const TeamOverview = () => {
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Fetch team leads on component mount
  useEffect(() => {
    fetchTeamLeads();
  }, []);

  // Fetch stats when selectedTeamLead changes
  useEffect(() => {
    if (selectedTeamLead) {
      fetchStats();
      fetchAgents(selectedTeamLead);
    }
  }, [selectedTeamLead]);

  const fetchTeamLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('team_leads')
        .select('*')
        .order('name');

      if (error) throw error;
      
      if (data && data.length > 0) {
        setTeamLeads(data);
        setSelectedTeamLead(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team leads",
        variant: "destructive",
      });
    }
  };

  const fetchStats = async () => {
    if (!selectedTeamLead) return;

    try {
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('team_lead_id', selectedTeamLead)
        .order('date', { ascending: false });

      if (error) throw error;
      
      setStats(data || []);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team lead statistics",
        variant: "destructive",
      });
    }
  };

  const fetchAgents = async (teamLeadId: string) => {
    try {
      setIsLoadingAgents(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: "Error",
        description: "Failed to fetch agents",
        variant: "destructive",
      });
    } finally {
      setIsLoadingAgents(false);
    }
  };

  return (
    <AuthLayout>
      <div className="container mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <TeamOverviewHeader />
        <div className="mt-8">
          {teamLeads.length > 0 && (
            <TeamLeadTabs 
              teamLeads={teamLeads}
              selectedTeamLead={selectedTeamLead}
              setSelectedTeamLead={setSelectedTeamLead}
              showForm={showForm}
              stats={stats}
              fetchStats={fetchStats}
            />
          )}
        </div>
        <div className="mt-8">
          {selectedTeamLead && (
            <AgentsList 
              agents={agents}
              isLoading={isLoadingAgents}
              teamLeadId={selectedTeamLead}
              onAgentUpdated={() => fetchAgents(selectedTeamLead)}
            />
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default TeamOverview;
