
import { useState, useEffect } from 'react';
import { DailyStats } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { DashboardHeader } from './DashboardHeader';
import { DashboardContent } from './DashboardContent';
import { useDateRange } from '@/context/DateContext';
import { format } from 'date-fns';
import { Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTeamLeads, useDailyStats, useSurveyTickets } from '@/hooks/use-supabase-data';
import { supabase } from "@/integrations/supabase/client";

const TeamLeadDashboard = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const { dateRange } = useDateRange();
  const [queryLogsVisible, setQueryLogsVisible] = useState(false);
  
  // Fetch team leads using our custom hook
  const { 
    data: teamLeads, 
    isLoading: isLoadingTeamLeads, 
    error: teamLeadsError, 
    refetch: refetchTeamLeads 
  } = useTeamLeads();
  
  console.log("Current date range from context:", dateRange);
  
  // Fetch daily stats for the selected team lead
  const { 
    data: dailyStats, 
    isLoading: isLoadingDailyStats,
    error: dailyStatsError,
    refetch: refetchDailyStats 
  } = useDailyStats(
    selectedTeamLead, 
    dateRange.startDate, 
    dateRange.endDate,
    !!selectedTeamLead
  );
  
  // Fetch survey tickets for the selected team lead
  const { 
    data: surveyTickets,
    isLoading: isLoadingSurveyTickets,
    error: surveyTicketsError,
    refetch: refetchSurveyTickets
  } = useSurveyTickets(
    selectedTeamLead, 
    dateRange.startDate, 
    dateRange.endDate,
    !!selectedTeamLead
  );
  
  // Set selected team lead when teamLeads data loads
  useEffect(() => {
    console.log('TeamLeadDashboard: teamLeads updated:', teamLeads.length);
    
    if (teamLeads.length > 0 && !selectedTeamLead) {
      console.log(`Setting selected team lead to first team lead: ${teamLeads[0].id} (${teamLeads[0].name})`);
      setSelectedTeamLead(teamLeads[0].id);
    }
  }, [teamLeads, selectedTeamLead]);
  
  // Process daily stats and survey tickets data
  useEffect(() => {
    if (dailyStats.length === 0 && !isLoadingDailyStats) {
      console.log('No daily stats data available for processing');
      setStats([]);
      return;
    }
    
    console.log('Processing daily stats and survey tickets data', {
      dailyStats: dailyStats.length,
      surveyTickets: surveyTickets?.length || 0,
      dateRange
    });
    
    try {
      // Sort data by date in ascending order
      const sortedDailyStats = [...dailyStats].sort((a, b) => 
        new Date(a.date).getTime() - new Date(b.date).getTime()
      );
      
      // Create a map of dates to survey ticket counts
      const surveyTicketMap = surveyTickets?.reduce((acc: { [key: string]: number }, ticket) => {
        acc[ticket.date] = (acc[ticket.date] || 0) + (ticket.ticket_count || 0);
        return acc;
      }, {}) || {};
      
      // First, get all unique dates in the range
      if (!dateRange.startDate || !dateRange.endDate) {
        console.error("Missing date range for processing stats");
        setStats([]);
        return;
      }
      
      const startDate = new Date(dateRange.startDate);
      const endDate = new Date(dateRange.endDate);
      
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        console.error("Invalid date range", { startDate, endDate, dateRange });
        toast({
          title: "Error",
          description: "Invalid date range selected",
          variant: "destructive",
        });
        return;
      }
      
      const dateArray: string[] = [];
      for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
        dateArray.push(format(date, 'yyyy-MM-dd'));
      }
      
      // Combine daily stats with survey tickets
      const combinedStats = dateArray.map(date => {
        const existingStat = sortedDailyStats?.find(stat => stat.date === date) || {
          id: `temp-${date}`,
          team_lead_id: selectedTeamLead || '',
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
          survey_tickets: surveyTicketMap[date] || 0
        };
      });
      
      console.log(`Processed ${combinedStats.length} daily stats records with survey tickets`);
      setStats(combinedStats);
    } catch (error: any) {
      console.error('Error processing stats data:', error);
      toast({
        title: "Error",
        description: `Failed to process stats data: ${error.message}`,
        variant: "destructive",
      });
    }
  }, [dailyStats, surveyTickets, dateRange]);
  
  // Set up realtime subscriptions
  useEffect(() => {
    console.log('Setting up realtime subscriptions');
    
    // Team leads subscription
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
          refetchTeamLeads();
          toast({
            title: "Team Leads Updated",
            description: "Team leads data has been refreshed",
          });
        }
      )
      .subscribe();
      
    // Daily stats subscription - only set up if we have a selected team lead
    let dailyStatsChannel;
    let surveyTicketsChannel;
    
    if (selectedTeamLead) {
      dailyStatsChannel = supabase
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
            refetchDailyStats();
            toast({
              title: "Data Updated",
              description: "Dashboard data has been refreshed",
            });
          }
        )
        .subscribe();
      
      surveyTicketsChannel = supabase
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
            refetchSurveyTickets();
            toast({
              title: "Survey Data Updated",
              description: "Survey tickets data has been refreshed",
            });
          }
        )
        .subscribe();
    }
      
    return () => {
      console.log('Cleaning up TeamLeadDashboard subscriptions');
      supabase.removeChannel(teamLeadsChannel);
      if (dailyStatsChannel) supabase.removeChannel(dailyStatsChannel);
      if (surveyTicketsChannel) supabase.removeChannel(surveyTicketsChannel);
    };
  }, [selectedTeamLead, refetchTeamLeads, refetchDailyStats, refetchSurveyTickets]);

  const handleRefresh = () => {
    console.log('Manual refresh requested');
    refetchTeamLeads();
  };
  
  const fetchStats = () => {
    console.log('Fetching stats...', { 
      selectedTeamLead, 
      startDate: dateRange.startDate, 
      endDate: dateRange.endDate 
    });
    refetchDailyStats();
    refetchSurveyTickets();
    
    // Show temporary toast to confirm fetching
    toast({
      title: "Fetching Data",
      description: `Requesting data for ${dateRange.startDate} to ${dateRange.endDate}`,
    });
  };

  const isLoading = isLoadingTeamLeads && teamLeads.length === 0;
  const hasDataErrors = dailyStatsError || surveyTicketsError;
  
  // Diagnostic information
  const diagnosticInfo = {
    selectedTeamLead,
    dateRange,
    dailyStatsCount: dailyStats.length,
    surveyTicketsCount: surveyTickets?.length || 0,
    isLoadingDailyStats,
    isLoadingSurveyTickets,
    errors: {
      dailyStats: dailyStatsError,
      surveyTickets: surveyTicketsError
    }
  };

  if (isLoading) {
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
        
        {teamLeadsError ? (
          <div className="bg-destructive/10 border border-destructive rounded-md p-4 space-y-4">
            <div className="flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
              <div>
                <p className="text-destructive font-medium">{teamLeadsError}</p>
                <p className="text-destructive/70 text-sm mt-1">
                  There was an error loading the dashboard data. Please check console for more details.
                </p>
              </div>
            </div>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              className="w-full sm:w-auto"
            >
              Try again
            </Button>
          </div>
        ) : teamLeads.length === 0 ? (
          <div className="text-center p-8 bg-muted/50 rounded-lg border space-y-4">
            <AlertCircle className="h-10 w-10 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">No team leads found</p>
              <p className="text-muted-foreground mt-2">
                There are no team leads available in the database.
              </p>
            </div>
            <Button 
              variant="outline"
              onClick={handleRefresh}
              className="mt-4"
            >
              Refresh data
            </Button>
          </div>
        ) : (
          <>
            {hasDataErrors && (
              <div className="bg-amber-50 border border-amber-200 rounded-md p-4 mb-6">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5" />
                  <div>
                    <p className="text-amber-800 font-medium">Data retrieval issues detected</p>
                    <p className="text-amber-700 text-sm mt-1">
                      There was an issue fetching some data. Please check the date range and try again.
                    </p>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="mt-2 text-xs"
                      onClick={() => setQueryLogsVisible(!queryLogsVisible)}
                    >
                      {queryLogsVisible ? 'Hide Details' : 'Show Details'}
                    </Button>
                    
                    {queryLogsVisible && (
                      <pre className="bg-slate-800 text-white p-2 rounded text-xs mt-2 overflow-auto max-h-48">
                        {JSON.stringify(diagnosticInfo, null, 2)}
                      </pre>
                    )}
                  </div>
                </div>
                <div className="mt-3 flex gap-2">
                  <Button 
                    variant="default"
                    size="sm"
                    onClick={fetchStats}
                  >
                    Retry Data Fetch
                  </Button>
                </div>
              </div>
            )}
              
            <DashboardContent
              teamLeads={teamLeads}
              selectedTeamLead={selectedTeamLead}
              setSelectedTeamLead={setSelectedTeamLead}
              showForm={showForm}
              stats={stats}
              fetchStats={fetchStats}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default TeamLeadDashboard;
