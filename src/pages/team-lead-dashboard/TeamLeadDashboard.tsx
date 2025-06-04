
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { useDateRange } from '@/context/DateContext';
import { useAuth } from '@/context/AuthContext';
import { aggregateDataFromAllTables, AggregatedData } from '@/utils/dataAggregation';

const TeamLeadDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [stats, setStats] = useState<AggregatedData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dateRange } = useDateRange();
  const { user } = useAuth();

  useEffect(() => {
    fetchTeamLeads();
    
    // Set up realtime subscription for team_leads table
    const teamLeadsChannel = supabase
      .channel('dashboard-team-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_leads'
        },
        (payload) => {
          console.log('Team leads update received:', payload);
          fetchTeamLeads();
          toast({
            title: "Team Leads Updated",
            description: "Team leads data has been refreshed",
          });
        }
      )
      .subscribe();
      
    return () => {
      supabase.removeChannel(teamLeadsChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedTeamLead) return;

    // Set up multiple channels for different tables
    const tablesChannels = [
      'daily_stats_duplicate',
      'Calls',
      'Emails',
      'Live Chat',
      'Escalations', 
      'QA Table',
      'After Call Survey Tickets'
    ].map(tableName => {
      return supabase
        .channel(`dashboard-${tableName}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName,
            filter: tableName === 'After Call Survey Tickets' ? 
              `team_lead_id=eq.${selectedTeamLead}` : 
              `team_lead_id=eq.${selectedTeamLead}`
          },
          (payload) => {
            console.log(`${tableName} update received:`, payload);
            const changeDate = (payload.new as any).date || (payload.new as any).Date;
            if (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate) {
              fetchStats();
              toast({
                title: "Data Updated",
                description: `${tableName} data has been refreshed`,
              });
            }
          }
        )
        .subscribe();
    });

    fetchStats();

    return () => {
      tablesChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [selectedTeamLead, dateRange]);

  const fetchTeamLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('team_leads')
        .select('*');

      if (error) throw error;

      setTeamLeads(data);
      if (data.length > 0 && !selectedTeamLead) {
        setSelectedTeamLead(data[0].id);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team leads",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    if (!selectedTeamLead) return;

    try {
      console.log('Fetching aggregated stats from all tables with date range:', dateRange);
      setIsLoading(true);
      
      // Use the new aggregation function to get data from all tables
      const aggregatedStats = await aggregateDataFromAllTables(
        dateRange.startDate,
        dateRange.endDate,
        selectedTeamLead
      );

      console.log('Aggregated stats:', aggregatedStats);
      setStats(aggregatedStats);
    } catch (error) {
      console.error('Error fetching aggregated stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stats from all tables",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        <DashboardHeader 
          showForm={showForm}
          setShowForm={setShowForm}
          onApplyFilter={fetchStats}
        />
        
        <DashboardContent
          teamLeads={teamLeads}
          selectedTeamLead={selectedTeamLead}
          setSelectedTeamLead={setSelectedTeamLead}
          showForm={showForm}
          stats={stats}
          fetchStats={fetchStats}
        />
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
