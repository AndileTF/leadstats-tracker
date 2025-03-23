import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { PieChart } from "@/components/dashboard/PieChart";
import { BarChartComparison } from "@/components/dashboard/BarChartComparison";
import { HeatmapChart } from "@/components/dashboard/HeatmapChart";
import { TeamNetworkGraph } from "@/components/dashboard/TeamNetworkGraph";
import { LineChart } from "@/components/dashboard/LineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDateRange } from "@/context/DateContext";

const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dateRange } = useDateRange();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  
  useEffect(() => {
    const dailyStatsChannel = supabase
      .channel('overview-daily-stats-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'daily_stats'
        },
        (payload) => {
          console.log('Real-time update received for daily_stats:', payload);
          const changeDate = (payload.new as any).date;
          if (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate) {
            fetchOverview();
            fetchDailyStats();
            toast({
              title: "Data Updated",
              description: "Dashboard data has been refreshed"
            });
          }
        }
      )
      .subscribe();
      
    const surveyTicketsChannel = supabase
      .channel('overview-survey-tickets-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'After Call Survey Tickets'
        },
        (payload) => {
          console.log('Real-time update received for survey tickets:', payload);
          const changeDate = (payload.new as any).date;
          if (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate) {
            fetchOverview();
            fetchDailyStats();
            toast({
              title: "Survey Data Updated",
              description: "Survey data has been refreshed"
            });
          }
        }
      )
      .subscribe();
      
    const teamLeadsChannel = supabase
      .channel('overview-team-leads-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'team_leads'
        },
        (payload) => {
          console.log('Real-time update received for team_leads:', payload);
          fetchTeamLeads();
          fetchOverview();
          toast({
            title: "Team Leads Updated",
            description: "Team leads data has been refreshed"
          });
        }
      )
      .subscribe();
      
    const agentsChannel = supabase
      .channel('overview-agents-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'agents'
        },
        (payload) => {
          console.log('Real-time update received for agents:', payload);
          fetchTeamLeads();
        }
      )
      .subscribe();
      
    fetchTeamLeads();
    fetchOverview();
    fetchDailyStats();
    
    return () => {
      supabase.removeChannel(dailyStatsChannel);
      supabase.removeChannel(surveyTicketsChannel);
      supabase.removeChannel(teamLeadsChannel);
      supabase.removeChannel(agentsChannel);
    };
  }, [dateRange]);

  const fetchTeamLeads = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('team_leads').select('*');
      if (error) throw error;
      setTeamLeads(data);
      if (data.length > 0 && !selectedTeamLead) {
        setSelectedTeamLead(data[0].id);
      }
    } catch (error) {
      console.error('Error fetching team leads:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team leads",
        variant: "destructive"
      });
    }
  };

  const fetchOverview = async () => {
    try {
      console.log('Fetching overview with date range:', dateRange);
      const {
        data: dailyStats,
        error: dailyStatsError
      } = await supabase.from('daily_stats').select(`
          team_leads (
            id,
            name
          ),
          calls,
          emails,
          live_chat,
          escalations,
          qa_assessments,
          date,
          team_lead_id,
          sla_percentage
        `).gte('date', dateRange.startDate).lte('date', dateRange.endDate);
      if (dailyStatsError) throw dailyStatsError;
      const {
        data: surveyTickets,
        error: surveyError
      } = await supabase.from('After Call Survey Tickets').select('*').gte('date', dateRange.startDate).lte('date', dateRange.endDate);
      if (surveyError) throw surveyError;
      console.log('Fetched daily stats:', dailyStats);
      console.log('Fetched survey tickets:', surveyTickets);
      const surveyTicketMap = surveyTickets.reduce((acc: {
        [key: string]: number;
      }, curr) => {
        acc[curr.team_lead_id] = (acc[curr.team_lead_id] || 0) + (curr.ticket_count || 0);
        return acc;
      }, {});
      const overview = dailyStats.reduce((acc: {
        [key: string]: any;
      }, curr) => {
        const name = curr.team_leads?.name;
        const teamLeadId = curr.team_lead_id;
        if (!name || !teamLeadId) return acc;
        if (!acc[name]) {
          acc[name] = {
            name,
            team_lead_id: teamLeadId,
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_survey_tickets: 0,
            total_days: 0,
            average_sla: 0,
            sla_days: 0
          };
        }
        acc[name].total_calls += curr.calls || 0;
        acc[name].total_emails += curr.emails || 0;
        acc[name].total_live_chat += curr.live_chat || 0;
        acc[name].total_escalations += curr.escalations || 0;
        acc[name].total_qa_assessments += curr.qa_assessments || 0;
        acc[name].total_survey_tickets = surveyTicketMap[teamLeadId] || 0;
        if (curr.sla_percentage) {
          acc[name].average_sla += curr.sla_percentage;
          acc[name].sla_days += 1;
        }
        acc[name].total_days += 1;
        return acc;
      }, {});

      Object.values(overview).forEach((item: any) => {
        if (item.sla_days > 0) {
          item.average_sla = item.average_sla / item.sla_days;
        }
      });
      setOverview(Object.values(overview));
    } catch (error) {
      console.error('Error fetching overview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch overview",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      const {
        data,
        error
      } = await supabase.from('daily_stats').select('*').gte('date', dateRange.startDate).lte('date', dateRange.endDate).order('date', {
        ascending: true
      });
      if (error) throw error;
      setDailyStats(data);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch daily statistics",
        variant: "destructive"
      });
    }
  };

  const getTeamLeadStats = () => {
    if (!selectedTeamLead) return [];
    return dailyStats.filter(stat => stat.team_lead_id === selectedTeamLead);
  };

  const getTeamLeadName = () => {
    const teamLead = teamLeads.find(tl => tl.id === selectedTeamLead);
    return teamLead?.name || 'Unknown';
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <TeamOverviewHeader />

        <Card>
          <CardContent className="p-6">
            <DateFilter onApplyFilter={() => {
              fetchOverview();
              fetchDailyStats();
            }} />

            <Tabs defaultValue="overview" className="mt-6">
              <TabsList className="grid w-full grid-cols-2 mb-4">
                <TabsTrigger value="overview">Team Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GaugeChart 
                    data={overview} 
                    title="Issues Per Agent Per Day" 
                    description="Daily target performance for customer support issues"
                  />
                  <BarChartComparison data={overview} />
                </div>
                
                <PerformanceChart data={overview} />
                <PerformanceTable data={overview} />
                <TeamNetworkGraph data={overview} />
              </TabsContent>
              
              <TabsContent value="detailed" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <PieChart 
                    data={overview} 
                    metric="total_calls" 
                    title="Distribution of Calls" 
                  />
                  <PieChart 
                    data={overview} 
                    metric="total_emails" 
                    title="Distribution of Emails" 
                  />
                </div>
                
                {teamLeads.length > 0 && (
                  <div className="mt-6">
                    <div className="flex gap-4 mb-4">
                      <select 
                        value={selectedTeamLead || ''}
                        onChange={(e) => setSelectedTeamLead(e.target.value)}
                        className="border rounded px-3 py-2 bg-slate-900"
                      >
                        {teamLeads.map(tl => (
                          <option key={tl.id} value={tl.id}>{tl.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    {selectedTeamLead && (
                      <>
                        <LineChart 
                          data={getTeamLeadStats()} 
                          teamLeadName={getTeamLeadName()}
                        />
                      </>
                    )}
                  </div>
                )}
                
                <HeatmapChart data={dailyStats} teamLeads={teamLeads} />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
