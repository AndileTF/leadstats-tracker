
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLead, DailyStats, Agent } from "@/types/teamLead";
import { StatForm } from "@/components/StatForm";
import { StatsGrid } from "./StatsGrid";
import { useEffect, useState } from "react";
import { LineChart } from "./LineChart";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentsList } from "./AgentsList";
import { toast } from "@/hooks/use-toast";

interface TeamLeadTabsProps {
  teamLeads: TeamLead[];
  selectedTeamLead: string | null;
  setSelectedTeamLead: (id: string) => void;
  showForm: boolean;
  stats: DailyStats[];
  fetchStats: () => void;
}

export const TeamLeadTabs = ({
  teamLeads,
  selectedTeamLead,
  setSelectedTeamLead,
  showForm,
  stats,
  fetchStats
}: TeamLeadTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<string>(selectedTeamLead || "");
  const [agents, setAgents] = useState<Agent[]>([]);
  const [isLoadingAgents, setIsLoadingAgents] = useState(false);

  // Update the selected tab when selectedTeamLead changes from parent
  useEffect(() => {
    if (selectedTeamLead) {
      console.log(`TeamLeadTabs: Setting selected tab to ${selectedTeamLead}`);
      setSelectedTab(selectedTeamLead);
    } else if (teamLeads.length > 0) {
      console.log(`TeamLeadTabs: Setting selected tab to first team lead ${teamLeads[0].id}`);
      setSelectedTab(teamLeads[0].id);
    }
  }, [selectedTeamLead, teamLeads]);

  // Fetch agents when the selected tab changes
  useEffect(() => {
    if (!selectedTab) {
      console.log('TeamLeadTabs: No tab selected, skipping agent fetch');
      return;
    }
    
    console.log(`TeamLeadTabs: Selected tab changed to ${selectedTab}, fetching agents`);
    fetchAgents(selectedTab);
    
    // Set up multiple realtime subscriptions
    const agentsChannel = supabase
      .channel('agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents',
          filter: `team_lead_id=eq.${selectedTab}`
        },
        (payload) => {
          console.log('Agents update received:', payload);
          fetchAgents(selectedTab);
          toast({
            title: "Agents Updated",
            description: "The agents list has been refreshed",
          });
        }
      )
      .subscribe();
      
    // Listen for team_leads changes
    const teamLeadsChannel = supabase
      .channel('team-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_leads'
        },
        () => {
          // Refresh the parent component's team leads data
          console.log('Team leads update detected');
        }
      )
      .subscribe();

    return () => {
      console.log('TeamLeadTabs: Cleaning up subscriptions');
      supabase.removeChannel(agentsChannel);
      supabase.removeChannel(teamLeadsChannel);
    };
  }, [selectedTab]);

  const fetchAgents = async (teamLeadId: string) => {
    try {
      console.log(`TeamLeadTabs: Fetching agents for team lead ${teamLeadId}`);
      setIsLoadingAgents(true);
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .order('start_date', { ascending: false });

      if (error) throw error;
      console.log(`TeamLeadTabs: Fetched ${data?.length || 0} agents`);
      setAgents(data || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
    } finally {
      setIsLoadingAgents(false);
    }
  };

  const calculateTotalStats = () => {
    return stats.reduce((acc, curr) => ({
      calls: acc.calls + (curr.calls || 0),
      emails: acc.emails + (curr.emails || 0),
      live_chat: acc.live_chat + (curr.live_chat || 0),
      escalations: acc.escalations + (curr.escalations || 0),
      qa_assessments: acc.qa_assessments + (curr.qa_assessments || 0),
      survey_tickets: acc.survey_tickets + (curr.survey_tickets || 0),
    }), {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
      survey_tickets: 0,
    });
  };

  const totalStats = calculateTotalStats();
  const statsCount = stats.length || 1;
  
  // Find the selected team lead name for the LineChart
  const selectedTeamLeadName = teamLeads.find(tl => tl.id === selectedTab)?.name || "";

  const handleTabChange = (value: string) => {
    console.log(`TeamLeadTabs: Tab changed to ${value}`);
    setSelectedTab(value);
    setSelectedTeamLead(value);
  };

  // Log team leads data for debugging
  console.log('TeamLeadTabs: Team leads data:', teamLeads);
  console.log('TeamLeadTabs: Selected tab:', selectedTab);
  console.log('TeamLeadTabs: Selected team lead:', selectedTeamLead);

  if (teamLeads.length === 0) {
    return (
      <div className="bg-muted/30 rounded-md p-6 text-center">
        <AlertCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium">No Team Leads Available</h3>
        <p className="text-muted-foreground mt-2 mb-4">
          There are no team leads available in the system.
        </p>
      </div>
    );
  }

  return (
    <Tabs 
      value={selectedTab} 
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full justify-start overflow-x-auto">
        {teamLeads.map((teamLead) => (
          <TabsTrigger
            key={teamLead.id}
            value={teamLead.id}
            className="flex items-center gap-2"
          >
            <span>{teamLead.name}</span>
            {teamLead.assigned_agents_count !== undefined && (
              <Badge variant="secondary" className="flex items-center gap-1">
                <Users className="h-3 w-3" />
                <span>{teamLead.assigned_agents_count}</span>
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {teamLeads.map((teamLead) => (
        <TabsContent key={teamLead.id} value={teamLead.id}>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Agents Assigned: <strong>{teamLead.assigned_agents_count || 0}</strong></span>
            </div>
          </div>

          {showForm && selectedTeamLead === teamLead.id && (
            <StatForm teamLeadId={teamLead.id} onSuccess={fetchStats} />
          )}

          {/* Only render LineChart if we're on the selected team lead's tab */}
          {selectedTab === teamLead.id && stats.length > 0 && (
            <LineChart data={stats} teamLeadName={teamLead.name} />
          )}

          {/* Stats Grid moved above Agents List */}
          <StatsGrid totalStats={totalStats} statsCount={statsCount} />

          {/* Display agents list */}
          {selectedTab === teamLead.id && (
            <AgentsList 
              agents={agents} 
              isLoading={isLoadingAgents} 
              teamLeadId={teamLead.id}
              onAgentUpdated={() => fetchAgents(teamLead.id)}
            />
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
