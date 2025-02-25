
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats, DateRange } from "@/types/teamLead";
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<DateRange>({
    startDate: format(new Date(), 'yyyy-MM-dd'),
    endDate: format(new Date(), 'yyyy-MM-dd')
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  useEffect(() => {
    if (!selectedTeamLead) return;

    const channel = supabase
      .channel('dashboard-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats',
          filter: `team_lead_id=eq.${selectedTeamLead}`
        },
        (payload) => {
          console.log('Real-time update received:', payload);
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

    fetchStats();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [selectedTeamLead, dateRange]);

  const fetchTeamLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('team_leads')
        .select('*');

      if (error) throw error;

      setTeamLeads(data);
      if (data.length > 0) {
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
      console.log('Fetching stats with date range:', dateRange);
      setIsLoading(true);
      
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
      console.log('Daily stats:', dailyStats);

      // Fetch survey tickets
      const { data: surveyTickets, error: surveyError } = await supabase
        .from('After Call Survey Tickets')
        .select('*')
        .eq('team_lead_id', selectedTeamLead)
        .gte('date', dateRange.startDate)
        .lte('date', dateRange.endDate);

      if (surveyError) throw surveyError;
      console.log('Survey tickets:', surveyTickets);

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

      console.log('Combined stats:', combinedStats);
      setStats(combinedStats);
    } catch (error) {
      console.error('Error fetching stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch stats",
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
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Team Lead Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
          </div>
          <div className="flex gap-4">
            <DateFilter
              dateRange={dateRange}
              setDateRange={setDateRange}
            />
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              {showForm ? 'Close Form' : 'Add Daily Stats'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              Team Overview
            </Button>
          </div>
        </div>

        <TeamLeadTabs
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

export default Index;
