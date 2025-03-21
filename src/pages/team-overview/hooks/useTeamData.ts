
import { useState, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview, DateRange, DailyStats, TeamLead } from "@/types/teamLead";
import { toast } from "@/hooks/use-toast";

export const useTeamData = (dateRange: DateRange) => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [channels, setChannels] = useState<ReturnType<typeof supabase.channel>[]>([]);

  useEffect(() => {
    setupRealTimeSubscriptions();
    fetchTeamLeads();
    fetchOverview();
    fetchDailyStats();
    
    return realTimeCleanup;
  }, [dateRange]);

  const setupRealTimeSubscriptions = () => {
    // Clean up any existing channels first
    realTimeCleanup();
    
    const newChannels = [];
    
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
    
    newChannels.push(dailyStatsChannel);
      
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
    
    newChannels.push(surveyTicketsChannel);
      
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
    
    newChannels.push(teamLeadsChannel);
      
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
    
    newChannels.push(agentsChannel);
    
    setChannels(newChannels);
  };

  const realTimeCleanup = () => {
    channels.forEach(channel => {
      supabase.removeChannel(channel);
    });
    setChannels([]);
  };

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
      setIsLoading(true);
      
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
      console.log('Fetched daily stats for charts:', data);
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

  return {
    overview,
    dailyStats,
    teamLeads,
    selectedTeamLead,
    setSelectedTeamLead,
    isLoading,
    realTimeCleanup
  };
};
