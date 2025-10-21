import { useState, useEffect } from 'react';
import { TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from '../team-lead-dashboard/DashboardHeader';
import { DashboardContent } from '../team-lead-dashboard/DashboardContent';
import { useDateRange } from '@/context/DateContext';
import { useAuth } from '@/context/AuthContext';
import { aggregateDataFromAllTables, AggregatedData } from '@/utils/dataAggregation';
import { dbClient } from '@/lib/supabaseClient';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { AgentPerformanceTable } from '@/components/dashboard/AgentPerformanceTable';
import { useAgentPerformance } from '@/hooks/useAgentPerformance';
import { supabase } from '@/integrations/supabase/client';

const TeamLeadPortal = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLead, setTeamLead] = useState<TeamLead | null>(null);
  const [stats, setStats] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dateRange } = useDateRange();
  const { user } = useAuth();

  useEffect(() => {
    fetchTeamLeadInfo();
  }, [user]);

  useEffect(() => {
    if (teamLead) {
      fetchStats();
    }
  }, [teamLead, dateRange]);

  const fetchTeamLeadInfo = async () => {
    if (!user) return;

    try {
      // Get the team lead record for the current user
      const { data: userRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .single();

      if (rolesError) throw rolesError;

      // Get profile to find team lead name
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('full_name')
        .eq('id', user.id)
        .single();

      if (profileError) throw profileError;

      // Find team lead by name
      const { data: teamLeadData, error: teamLeadError } = await supabase
        .from('team_leads')
        .select('*')
        .eq('name', profile.full_name)
        .single();

      if (teamLeadError) throw teamLeadError;

      setTeamLead(teamLeadData);
    } catch (error) {
      console.error('Error fetching team lead info:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your team lead information",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!teamLead) return;

    try {
      console.log('Fetching aggregated stats for team lead:', teamLead.id);
      setIsLoading(true);
      
      const aggregatedStats = await aggregateDataFromAllTables(
        dateRange.startDate,
        dateRange.endDate,
        teamLead.id
      );

      console.log('Aggregated stats:', aggregatedStats);
      setStats(aggregatedStats);
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team stats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const {
    data: agentPerformanceData,
    loading: agentLoading,
  } = useAgentPerformance({
    teamLeadId: teamLead?.id,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!teamLead) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Team Lead Not Found</h2>
          <p className="text-muted-foreground">Unable to find your team lead profile. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">My Team Dashboard</h1>
          <p className="text-muted-foreground mt-2">Welcome, {teamLead.name}</p>
        </div>

        <DashboardHeader 
          showForm={showForm}
          setShowForm={setShowForm}
          onApplyFilter={fetchStats}
        />
        
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">My Team Overview</TabsTrigger>
            <TabsTrigger value="agents">My Agents Performance</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <DashboardContent
              teamLeads={[teamLead]}
              selectedTeamLead={teamLead.id}
              setSelectedTeamLead={() => {}}
              showForm={showForm}
              stats={stats}
              fetchStats={fetchStats}
            />
          </TabsContent>

          <TabsContent value="agents">
            <AgentPerformanceTable 
              data={agentPerformanceData} 
              loading={agentLoading}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default TeamLeadPortal;
