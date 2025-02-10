
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatForm } from "@/components/StatForm";
import { toast } from "@/hooks/use-toast";
import { ArrowUpRight, BarChart3, Calendar, Mail, MessageSquare, Phone, Shield } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats, DateFilter } from "@/types/teamLead";
import { format, startOfWeek, startOfMonth, subDays } from 'date-fns';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('day');
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchTeamLeads();
  }, []);

  useEffect(() => {
    if (selectedTeamLead) {
      fetchStats();
    }
  }, [selectedTeamLead, dateFilter]);

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
      case 'day':
        return now;
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

  const calculateTotalStats = () => {
    return stats.reduce((acc, curr) => ({
      calls: acc.calls + curr.calls,
      emails: acc.emails + curr.emails,
      live_chat: acc.live_chat + curr.live_chat,
      escalations: acc.escalations + curr.escalations,
      qa_assessments: acc.qa_assessments + curr.qa_assessments,
    }), {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
    });
  };

  const totalStats = calculateTotalStats();

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
            <div className="flex gap-2">
              <Button
                variant="outline"
                onClick={() => setDateFilter('day')}
                className={dateFilter === 'day' ? 'bg-primary/20' : ''}
              >
                Day
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateFilter('week')}
                className={dateFilter === 'week' ? 'bg-primary/20' : ''}
              >
                Week
              </Button>
              <Button
                variant="outline"
                onClick={() => setDateFilter('month')}
                className={dateFilter === 'month' ? 'bg-primary/20' : ''}
              >
                Month
              </Button>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              {showForm ? 'Close Form' : 'Add Daily Stats'}
            </Button>
          </div>
        </div>

        <Tabs defaultValue={teamLeads[0]?.id} className="w-full">
          <TabsList className="w-full justify-start">
            {teamLeads.map((teamLead) => (
              <TabsTrigger
                key={teamLead.id}
                value={teamLead.id}
                onClick={() => setSelectedTeamLead(teamLead.id)}
              >
                {teamLead.name}
              </TabsTrigger>
            ))}
          </TabsList>

          {teamLeads.map((teamLead) => (
            <TabsContent key={teamLead.id} value={teamLead.id}>
              {showForm && selectedTeamLead === teamLead.id && (
                <StatForm teamLeadId={teamLead.id} onSuccess={fetchStats} />
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-6">
                <StatCard
                  title="Calls"
                  value={totalStats.calls}
                  icon={<Phone className="w-5 h-5" />}
                />
                <StatCard
                  title="Emails"
                  value={totalStats.emails}
                  icon={<Mail className="w-5 h-5" />}
                />
                <StatCard
                  title="Live Chat"
                  value={totalStats.live_chat}
                  icon={<MessageSquare className="w-5 h-5" />}
                />
                <StatCard
                  title="Escalations"
                  value={totalStats.escalations}
                  icon={<ArrowUpRight className="w-5 h-5" />}
                />
                <StatCard
                  title="QA Assessments"
                  value={totalStats.qa_assessments}
                  icon={<Shield className="w-5 h-5" />}
                />
                <StatCard
                  title="Total Interactions"
                  value={totalStats.calls + totalStats.emails + totalStats.live_chat}
                  icon={<BarChart3 className="w-5 h-5" />}
                  highlight
                />
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  highlight = false 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <Card className={`p-6 ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-muted-foreground font-medium">{title}</p>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold">
        {value.toLocaleString()}
      </h3>
    </div>
  </Card>
);

export default Index;
