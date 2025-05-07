
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLead, DailyStats, Agent } from "@/types/teamLead";
import { StatForm } from "@/components/StatForm";
import { StatsGrid } from "./StatsGrid";
import { useEffect, useState } from "react";
import { LineChart } from "./LineChart";
import { Badge } from "@/components/ui/badge";
import { Users, AlertCircle, Loader2, RefreshCw } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { AgentsList } from "./AgentsList";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";

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
  const [agentError, setAgentError] = useState<string | null>(null);

  // Update the selected tab when selectedTeamLead changes from parent
  useEffect(() => {
    console.log(`TeamLeadTabs: useEffect for selectedTeamLead: ${selectedTeamLead}`);
    console.log(`TeamLeadTabs: Current teamLeads:`, teamLeads.map(tl => `${tl.id} (${tl.name})`));
    
    if (selectedTeamLead) {
      console.log(`TeamLeadTabs: Setting selected tab to ${selectedTeamLead}`);
      setSelectedTab(selectedTeamLead);
    } else if (teamLeads.length > 0) {
      console.log(`TeamLeadTabs: Setting selected tab to first team lead ${teamLeads[0].id}`);
      setSelectedTab(teamLeads[0].id);
      setSelectedTeamLead(teamLeads[0].id);
    }
  }, [selectedTeamLead, teamLeads, setSelectedTeamLead]);

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
      setAgentError(null);
      
      const { data, error } = await supabase
        .from('agents')
        .select('*')
        .eq('team_lead_id', teamLeadId)
        .order('start_date', { ascending: false });

      if (error) {
        console.error('Error fetching agents:', error);
        setAgentError(`Failed to fetch agents: ${error.message}`);
        throw error;
      }
      
      console.log(`TeamLeadTabs: Fetched ${data?.length || 0} agents`);
      setAgents(data || []);
    } catch (error: any) {
      console.error('Error fetching agents:', error);
      setAgentError(`Failed to fetch agents: ${error.message}`);
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

  const handleRefreshAgents = () => {
    if (selectedTab) {
      console.log("TeamLeadTabs: Manually refreshing agents");
      fetchAgents(selectedTab);
    }
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
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => window.location.reload()}
          className="mx-auto"
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Refresh Page
        </Button>
      </div>
    );
  }

  return (
    <Tabs 
      value={selectedTab} 
      onValueChange={handleTabChange}
      className="w-full"
    >
      <div className="flex justify-between items-center mb-2">
        <TabsList className="w-full justify-start overflow-x-auto">
          {teamLeads.map((teamLead) => (
            <TabsTrigger
              key={teamLead.id}
              value={teamLead.id}
              className="flex items-center gap-2"
            >
              <span>{teamLead.name || 'Unnamed Lead'}</span>
              {teamLead.assigned_agents_count !== undefined && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <Users className="h-3 w-3" />
                  <span>{teamLead.assigned_agents_count}</span>
                </Badge>
              )}
            </TabsTrigger>
          ))}
        </TabsList>
        
        <Button 
          variant="ghost" 
          size="sm"
          onClick={handleRefreshAgents}
          className="ml-2"
        >
          <RefreshCw className="h-4 w-4" />
          <span className="sr-only">Refresh</span>
        </Button>
      </div>

      {teamLeads.map((teamLead) => (
        <TabsContent key={teamLead.id} value={teamLead.id}>
          <div className="mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>Agents Assigned: <strong>{teamLead.assigned_agents_count || 0}</strong></span>
            </div>
          </div>

          {showForm && selectedTeamLead === teamLead.id && (
            <div className="mb-6">
              <StatForm teamLeadId={teamLead.id} onSuccess={fetchStats} />
            </div>
          )}

          {/* Only render LineChart if we're on the selected team lead's tab and have stats */}
          {selectedTab === teamLead.id && stats.length > 0 && (
            <LineChart data={stats} teamLeadName={teamLead.name || 'Unnamed Lead'} />
          )}

          {/* Empty state for no stats */}
          {selectedTab === teamLead.id && stats.length === 0 && (
            <div className="bg-muted/30 rounded-md p-6 text-center mb-6">
              <h3 className="text-lg font-medium">No Stats Available</h3>
              <p className="text-muted-foreground mt-2 mb-4">
                There are no statistics available for this time period.
              </p>
              {showForm ? (
                <p className="text-sm">Use the form above to add daily stats.</p>
              ) : (
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => setSelectedTeamLead(teamLead.id)}
                >
                  Add Stats
                </Button>
              )}
            </div>
          )}

          {/* Stats Grid always shown, even with empty data */}
          <StatsGrid totalStats={totalStats} statsCount={statsCount} />

          {/* Display agents list */}
          {selectedTab === teamLead.id && (
            <div className="mt-6">
              {agentError ? (
                <div className="bg-destructive/10 border border-destructive rounded-md p-4 mb-4">
                  <p className="text-destructive text-sm">{agentError}</p>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => fetchAgents(teamLead.id)}
                    className="mt-2"
                  >
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Try Again
                  </Button>
                </div>
              ) : (
                <AgentsList 
                  agents={agents} 
                  isLoading={isLoadingAgents} 
                  teamLeadId={teamLead.id}
                  onAgentUpdated={() => fetchAgents(teamLead.id)}
                />
              )}
            </div>
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
};
