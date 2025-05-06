
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { useDateRange } from '@/context/DateContext';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const TeamLeadDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const { dateRange } = useDateRange();

  useEffect(() => {
    console.log('TeamLeadDashboard component mounted');
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
      console.log('Cleaning up TeamLeadDashboard subscriptions');
      supabase.removeChannel(teamLeadsChannel);
    };
  }, []);

  useEffect(() => {
    if (!selectedTeamLead) return;
    
    console.log(`Setting up subscriptions for selected team lead: ${selectedTeamLead}`);

    // Set up multiple channels for different tables
    const dailyStatsChannel = supabase
      .channel('dashboard-daily-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats',
          filter: `team_lead_id=eq.${selectedTeamLead}`
        },
        (payload) => {
          console.log('Daily stats update received:', payload);
          const changeDate = (payload.new as DailyStats).date;
          if (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate) {
            fetchStats();
            toast({
              title: "Data Updated",
              description: "Dashboard data has been refreshed",
            });
          }
        }
      )
      .subscribe();
      
    // Set up subscription for survey tickets table
    const surveyTicketsChannel = supabase
      .channel('dashboard-survey-tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'After Call Survey Tickets',
          filter: `team_lead_id=eq.${selectedTeamLead}`
        },
        (payload) => {
          console.log('Survey tickets update received:', payload);
          const changeDate = (payload.new as any).date;
          if (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate) {
            fetchStats();
            toast({
              title: "Survey Data Updated",
              description: "Survey tickets data has been refreshed",
            });
          }
        }
      )
      .subscribe();

    fetchStats();

    return () => {
      console.log('Cleaning up selected team lead subscriptions');
      supabase.removeChannel(dailyStatsChannel);
      supabase.removeChannel(surveyTicketsChannel);
    };
  }, [selectedTeamLead, dateRange]);

  const fetchTeamLeads = async () => {
    try {
      console.log('Fetching team leads...');
      setLoadingError(null);
      
      const { data, error } = await supabase
        .from('team_leads')
        .select('*');

      if (error) {
        console.error('Error fetching team leads:', error);
        throw error;
      }

      console.log('Team leads fetched:', data);
      setTeamLeads(data || []);
      
      if (data && data.length > 0) {
        if (!selectedTeamLead) {
          console.log(`Setting selected team lead to first team lead: ${data[0].id} (${data[0].name})`);
          setSelectedTeamLead(data[0].id);
        }
      } else {
        console.log('No team leads found');
      }
    } catch (error) {
      console.error('Failed to fetch team leads:', error);
      setLoadingError('Failed to fetch team leads');
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
    if (!selectedTeamLead) {
      console.log('No team lead selected, skipping stats fetch');
      return;
    }

    try {
      console.log('Fetching stats with date range:', dateRange, 'for team lead:', selectedTeamLead);
      setIsLoading(true);
      setLoadingError(null);
      
      // First, get all unique dates in the range
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      const dateArray = [];
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dateArray.push(format(date, 'yyyy-MM-dd'));
      }

      // Fetch daily stats
      const { data: dailyStats, error: dailyStatsError } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('team_lead_id', selectedTeamLead)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate)
        .order('date', { ascending: false });

      if (dailyStatsError) throw dailyStatsError;
      console.log('Daily stats fetched:', dailyStats?.length, 'records');

      // Fetch survey tickets
      const { data: surveyTickets, error: surveyError } = await supabase
        .from('After Call Survey Tickets')
        .select('*')
        .eq('team_lead_id', selectedTeamLead)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (surveyError) throw surveyError;
      console.log('Survey tickets fetched:', surveyTickets?.length, 'records');

      // Create a map of dates to survey ticket counts
      const surveyTicketMap = surveyTickets?.reduce((acc: { [key: string]: number }, ticket) => {
        acc[ticket.date] = (acc[ticket.date] || 0) + (ticket.ticket_count || 0);
        return acc;
      }, {});

      // Create or update stats for each date
      const combinedStats = dateArray.map(date => {
        const existingStat = dailyStats?.find(stat => stat.date === date) || {
          id: `temp-${date}`,
          team_lead_id: selectedTeamLead,
          date: date,
          calls: 0,
          emails: 0,
          live_chat: 0,
          escalations: 0,
          qa_assessments: 0,
          survey_tickets: 0,
          created_at: new Date().toISOString(),
          sla_percentage: 0
        };

        return {
          ...existingStat,
          survey_tickets: surveyTicketMap?.[date] || 0
        };
      });

      console.log('Combined stats prepared:', combinedStats.length, 'records');
      setStats(combinedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      setLoadingError('Failed to fetch stats data');
      toast({
        title: "Error",
        description: "Failed to fetch stats",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && teamLeads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 p-6">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-lg">Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <DashboardHeader 
          showForm={showForm}
          setShowForm={setShowForm}
          onApplyFilter={fetchStats}
        />
        
        {loadingError ? (
          <div className="bg-destructive/10 border border-destructive rounded-md p-4">
            <p className="text-destructive font-medium">{loadingError}</p>
            <button 
              className="mt-2 text-sm underline"
              onClick={fetchTeamLeads}
            >
              Try again
            </button>
          </div>
        ) : teamLeads.length === 0 ? (
          <div className="text-center p-8 bg-muted/50 rounded-lg border">
            <p className="text-lg font-medium">No team leads found</p>
            <p className="text-muted-foreground mt-2">
              There are no team leads available in the system.
            </p>
          </div>
        ) : (
          <DashboardContent
            teamLeads={teamLeads}
            selectedTeamLead={selectedTeamLead}
            setSelectedTeamLead={setSelectedTeamLead}
            showForm={showForm}
            stats={stats}
            fetchStats={fetchStats}
          />
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
