
import { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TeamOverviewHeader } from "@/components/dashboard/TeamOverviewHeader";
import { GaugeChart } from "@/components/dashboard/GaugeChart";
import { PieChart } from "@/components/dashboard/PieChart";
import { BarChartComparison } from "@/components/dashboard/BarChartComparison";
import { HeatmapChart } from "@/components/dashboard/HeatmapChart";
import { ChannelHeatmap } from "@/components/dashboard/ChannelHeatmap";
import { TeamNetworkGraph } from "@/components/dashboard/TeamNetworkGraph";
import { LineChart } from "@/components/dashboard/LineChart";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useDateRange } from "@/context/DateContext";
import { aggregateDataFromAllTables } from "@/utils/dataAggregation";

const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { dateRange } = useDateRange();
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  
  useEffect(() => {
    // Set up real-time subscriptions for all tables
    const tablesChannels = [
      'daily_stats',
      'Calls', 
      'Emails',
      'Live Chat',
      'Escalations',
      'QA Table',
      'After Call Survey Tickets',
      'team_leads',
      'agents'
    ].map(tableName => {
      return supabase
        .channel(`overview-${tableName}-changes`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: tableName
          },
          (payload) => {
            console.log(`Real-time update received for ${tableName}:`, payload);
            const changeDate = (payload.new as any)?.date || (payload.new as any)?.Date;
            if (!changeDate || (changeDate >= dateRange.startDate && changeDate <= dateRange.endDate)) {
              fetchTeamLeads();
              fetchOverview();
              fetchDailyStats();
              toast({
                title: "Data Updated",
                description: `${tableName} data has been refreshed`
              });
            }
          }
        )
        .subscribe();
    });
      
    fetchTeamLeads();
    fetchOverview();
    fetchDailyStats();
    
    return () => {
      tablesChannels.forEach(channel => {
        supabase.removeChannel(channel);
      });
    };
  }, [dateRange]);

  const fetchTeamLeads = async () => {
    try {
      const { data, error } = await supabase.from('team_leads').select('*');
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
      setIsLoading(true);
      console.log('Fetching overview with aggregated data from all tables:', dateRange);
      
      setOverview([]);
      
      // Get all team leads
      const { data: teamLeadsData, error: teamLeadsError } = await supabase
        .from('team_leads')
        .select('*');
        
      if (teamLeadsError) throw teamLeadsError;
      
      // Aggregate data for each team lead
      const overviewPromises = teamLeadsData.map(async (teamLead) => {
        try {
          const aggregatedStats = await aggregateDataFromAllTables(
            dateRange.startDate,
            dateRange.endDate,
            teamLead.id
          );
          
          // Calculate totals and averages
          const totals = aggregatedStats.reduce((acc, stat) => ({
            total_calls: acc.total_calls + (stat.calls || 0),
            total_emails: acc.total_emails + (stat.emails || 0),
            total_live_chat: acc.total_live_chat + (stat.live_chat || 0),
            total_escalations: acc.total_escalations + (stat.escalations || 0),
            total_qa_assessments: acc.total_qa_assessments + (stat.qa_assessments || 0),
            total_survey_tickets: acc.total_survey_tickets + (stat.survey_tickets || 0),
            total_days: acc.total_days + 1,
            average_sla: acc.average_sla + (stat.sla_percentage || 0)
          }), {
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_survey_tickets: 0,
            total_days: 0,
            average_sla: 0
          });
          
          return {
            name: teamLead.name,
            team_lead_id: teamLead.id,
            ...totals,
            average_sla: totals.total_days > 0 ? totals.average_sla / totals.total_days : 0
          };
        } catch (error) {
          console.error(`Error aggregating data for team lead ${teamLead.name}:`, error);
          return {
            name: teamLead.name,
            team_lead_id: teamLead.id,
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_survey_tickets: 0,
            total_days: 0,
            average_sla: 0
          };
        }
      });
      
      const overviewArray = await Promise.all(overviewPromises);
      console.log('Processed overview data from all tables:', overviewArray);
      
      setOverview(overviewArray);
    } catch (error) {
      console.error('Error fetching overview:', error);
      toast({
        title: "Error",
        description: "Failed to fetch overview data from all tables",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDailyStats = async () => {
    try {
      // Get aggregated data from all tables for all team leads
      const aggregatedStats = await aggregateDataFromAllTables(
        dateRange.startDate,
        dateRange.endDate
      );
      
      setDailyStats(aggregatedStats);
    } catch (error) {
      console.error('Error fetching daily stats:', error);
      toast({
        title: "Error",
        description: "Failed to fetch daily statistics from all tables",
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
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="overview">Team Overview</TabsTrigger>
                <TabsTrigger value="detailed">Detailed Analysis</TabsTrigger>
                <TabsTrigger value="workload">Workload Analysis</TabsTrigger>
              </TabsList>
              
              <TabsContent value="overview" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <GaugeChart 
                    data={overview} 
                    title="Team Lead Issues Per Day" 
                    description="Daily performance for customer support issues by team lead"
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
                    metric="total_qa_assessments" 
                    title="Distribution of QA Assessments by Team Leads" 
                  />
                  <PieChart 
                    data={overview} 
                    metric="total_emails" 
                    title="Distribution of Emails by Team Leads" 
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
              
              <TabsContent value="workload" className="space-y-6">
                <ChannelHeatmap data={dailyStats} teamLeads={teamLeads} />
                
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
