
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { StatForm } from "@/components/StatForm";
import { toast } from "@/hooks/use-toast";
import { 
  ArrowUpRight, BarChart3, Calendar, Mail, MessageSquare, 
  Phone, Shield, Clock, Timer, AlertCircle, CheckCircle2 
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead, DailyStats, DateFilter, TeamLeadOverview } from "@/types/teamLead";
import { format, startOfWeek, startOfMonth, subDays, parseISO } from 'date-fns';

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [teamLeads, setTeamLeads] = useState<TeamLead[]>([]);
  const [selectedTeamLead, setSelectedTeamLead] = useState<string | null>(null);
  const [dateFilter, setDateFilter] = useState<DateFilter>('day');
  const [stats, setStats] = useState<DailyStats[]>([]);
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [customDate, setCustomDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

  useEffect(() => {
    fetchTeamLeads();
    fetchOverview();
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

  const fetchOverview = async () => {
    try {
      const { data, error } = await supabase
        .from('team_lead_overview')
        .select('*');

      if (error) throw error;

      setOverview(data || []);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overview",
        variant: "destructive",
      });
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

      // Convert interval to string before setting state
      const formattedData = (data || []).map(stat => ({
        ...stat,
        average_handling_time: String(stat.average_handling_time),
        average_wait_time: String(stat.average_wait_time)
      }));

      setStats(formattedData);
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
      calls: acc.calls + (curr.calls || 0),
      emails: acc.emails + (curr.emails || 0),
      live_chat: acc.live_chat + (curr.live_chat || 0),
      escalations: acc.escalations + (curr.escalations || 0),
      qa_assessments: acc.qa_assessments + (curr.qa_assessments || 0),
      average_handling_time: acc.average_handling_time + parseFloat(curr.average_handling_time) || 0,
      average_wait_time: acc.average_wait_time + parseFloat(curr.average_wait_time) || 0,
      abandon_rate: acc.abandon_rate + (curr.abandon_rate || 0),
      sla_percentage: acc.sla_percentage + (curr.sla_percentage || 0),
    }), {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
      average_handling_time: 0,
      average_wait_time: 0,
      abandon_rate: 0,
      sla_percentage: 0,
    });
  };

  const totalStats = calculateTotalStats();
  const statsCount = stats.length || 1;

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
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setDateFilter('custom')}
                  className={dateFilter === 'custom' ? 'bg-primary/20' : ''}
                >
                  Custom
                </Button>
                <Input
                  type="date"
                  value={customDate}
                  onChange={(e) => setCustomDate(e.target.value)}
                  className="w-40"
                />
              </div>
            </div>
            <Button 
              onClick={() => setShowForm(!showForm)}
              className="bg-primary/20 hover:bg-primary/30 text-primary"
            >
              {showForm ? 'Close Form' : 'Add Daily Stats'}
            </Button>
          </div>
        </div>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Team Overview</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Emails</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Live Chat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Handle Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Avg Wait Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Abandon Rate</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SLA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {overview.map((item) => (
                  <tr key={item.name}>
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_calls?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_emails?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_live_chat?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.avg_handling_time_minutes?.toFixed(1) ?? 0} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.avg_wait_time_minutes?.toFixed(1) ?? 0} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.average_abandon_rate?.toFixed(1) ?? 0}%</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.average_sla?.toFixed(1) ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

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

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
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
                  title="Average Handle Time"
                  value={totalStats.average_handling_time / statsCount}
                  suffix=" min"
                  icon={<Clock className="w-5 h-5" />}
                />
                <StatCard
                  title="Average Wait Time"
                  value={totalStats.average_wait_time / statsCount}
                  suffix=" min"
                  icon={<Timer className="w-5 h-5" />}
                />
                <StatCard
                  title="Abandon Rate"
                  value={totalStats.abandon_rate / statsCount}
                  suffix="%"
                  icon={<AlertCircle className="w-5 h-5" />}
                />
                <StatCard
                  title="SLA Percentage"
                  value={totalStats.sla_percentage / statsCount}
                  suffix="%"
                  icon={<CheckCircle2 className="w-5 h-5" />}
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

interface StatCardProps { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  highlight?: boolean;
  suffix?: string;
}

const StatCard = ({ title, value, icon, highlight = false, suffix = '' }: StatCardProps) => (
  <Card className={`p-6 ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-muted-foreground font-medium">{title}</p>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold">
        {value.toLocaleString(undefined, { maximumFractionDigits: 2 })}{suffix}
      </h3>
    </div>
  </Card>
);

export default Index;
