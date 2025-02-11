
import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats, DateFilter as DateFilterType } from "@/types/teamLead";
import { format, startOfWeek, startOfMonth, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { DateFilter } from "@/components/dashboard/DateFilter";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilterType>('day');
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customDate, setCustomDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  useEffect(() => {
    if (selectedTeamLead) {
      fetchStats();
    }
  }, [selectedTeamLead, dateFilter, customDate]);

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

  const getDateRange = () => {
    const now = new Date();
    switch (dateFilter) {
      case 'week':
        return startOfWeek(now);
      case 'month':
        return startOfMonth(now);
      case 'custom':
        return parseISO(customDate);
      case 'day':
      default:
        return now;
    }
  };

  const fetchStats = async () => {
    try {
      const startDate = getDateRange();
      const { data, error } = await supabase
        .from('daily_stats')
        .select('*')
        .eq('team_lead_id', selectedTeamLead)
        .gte('date', format(startDate, 'yyyy-MM-dd'))
        .order('date', { ascending: false });

      if (error) throw error;

      setStats(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch stats",
        variant: "destructive",
      });
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
              dateFilter={dateFilter}
              setDateFilter={setDateFilter}
              customDate={customDate}
              setCustomDate={setCustomDate}
            />
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              {showForm ? 'Close Form' : 'Add Daily Stats'}
            </Button>
            <Button
              variant="outline"
              onClick={() => navigate('/team-overview')}
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
