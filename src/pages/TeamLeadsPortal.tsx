import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useUser } from '@/hooks/useUser';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPIService, AgentKPISummary } from '@/services/kpiService';
import { toast } from '@/hooks/use-toast';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { useDateRange } from '@/context/DateContext';
import { 
  Phone, MessageSquare, Mail, Share2, CreditCard, 
  ShoppingCart, Users as WalkInIcon, AlertTriangle, 
  ClipboardCheck, TrendingUp, TrendingDown, Minus,
  Download
} from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';

const TeamLeadsPortal = () => {
  const { user } = useAuth();
  const { profile, isTeamLead } = useUser();
  const { dateRange } = useDateRange();
  const [teamData, setTeamData] = useState<AgentKPISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [teamLeadId, setTeamLeadId] = useState<string | null>(null);

  useEffect(() => {
    fetchTeamLeadId();
  }, [user?.id]);

  useEffect(() => {
    if (teamLeadId) {
      fetchTeamData();
    }
  }, [teamLeadId, dateRange]);

  const fetchTeamLeadId = async () => {
    if (!user?.id) {
      console.error('No user ID available');
      return;
    }
    
    try {
      // Get the first team lead for demo purposes
      const { data, error } = await import('@/integrations/supabase/client').then(m => m.supabase
        .from('team_leads')
        .select('id')
        .limit(1)
        .maybeSingle()
      );
      
      if (error) {
        console.error('Error fetching team lead:', error);
        toast({
          title: "Error",
          description: "Failed to fetch team lead data. Please ensure you're logged in.",
          variant: "destructive",
        });
        return;
      }
      
      if (data) {
        setTeamLeadId(data.id);
      } else {
        toast({
          title: "No Team Lead Found",
          description: "No team lead data available. Please contact your administrator.",
          variant: "destructive",
        });
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      });
    }
  };

  const fetchTeamData = async () => {
    if (!teamLeadId) return;
    
    setIsLoading(true);
    try {
      const data = await KPIService.getTeamKPIData(
        teamLeadId,
        dateRange.startDate,
        dateRange.endDate
      );
      setTeamData(data);
    } catch (error) {
      console.error('Error fetching team data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch team performance data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Agent Name', 'Calls', 'Live Chat', 'Support/DNS Emails', 
      'Social Tickets', 'Billing Tickets', 'Sales Tickets', 'Walk-Ins',
      'Escalations', 'QA Assessments', 'Total Issues', 'Rank'
    ];
    
    const csvData = teamData.map(agent => [
      agent.agent_name,
      agent.total_calls,
      agent.total_live_chat,
      agent.total_emails,
      agent.total_social_tickets,
      agent.total_billing_tickets,
      agent.total_sales_tickets,
      agent.total_walk_ins,
      agent.total_escalations,
      agent.total_qa_assessments,
      agent.total_issues,
      agent.performance_rank
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `team-performance-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const calculateTeamTotals = () => {
    return {
      calls: teamData.reduce((sum, agent) => sum + agent.total_calls, 0),
      liveChat: teamData.reduce((sum, agent) => sum + agent.total_live_chat, 0),
      emails: teamData.reduce((sum, agent) => sum + agent.total_emails, 0),
      socialTickets: teamData.reduce((sum, agent) => sum + agent.total_social_tickets, 0),
      billingTickets: teamData.reduce((sum, agent) => sum + agent.total_billing_tickets, 0),
      salesTickets: teamData.reduce((sum, agent) => sum + agent.total_sales_tickets, 0),
      walkIns: teamData.reduce((sum, agent) => sum + agent.total_walk_ins, 0),
      totalIssues: teamData.reduce((sum, agent) => sum + agent.total_issues, 0),
    };
  };

  const totals = calculateTeamTotals();

  const KPICard = ({ title, value, icon: Icon, trend }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold mt-2">{value.toLocaleString()}</p>
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
        {trend && (
          <div className="mt-2 flex items-center text-sm">
            {trend > 0 ? <TrendingUp className="h-4 w-4 text-green-500 mr-1" /> : 
             trend < 0 ? <TrendingDown className="h-4 w-4 text-red-500 mr-1" /> :
             <Minus className="h-4 w-4 text-gray-500 mr-1" />}
            <span className={trend > 0 ? 'text-green-500' : trend < 0 ? 'text-red-500' : 'text-gray-500'}>
              {Math.abs(trend)}% vs last period
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (!user) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">Authentication Required</h2>
            <p className="text-muted-foreground">Please log in to access the Team Leads Portal.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading && !teamData.length) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isLoading && !teamLeadId) {
    return (
      <div className="min-h-screen p-6 flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="p-6">
            <h2 className="text-xl font-bold mb-2">No Team Lead Found</h2>
            <p className="text-muted-foreground">No team lead data available. Please contact your administrator.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold liquid-text">Team Lead Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              {teamData[0]?.team_lead_name || 'My Team'} - Performance Overview
            </p>
          </div>
          <div className="flex gap-4">
            <DateFilter onApplyFilter={fetchTeamData} />
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* KPI Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard title="Total Calls" value={totals.calls} icon={Phone} />
          <KPICard title="Live Chat" value={totals.liveChat} icon={MessageSquare} />
          <KPICard title="Support/DNS Emails" value={totals.emails} icon={Mail} />
          <KPICard title="Total Issues Handled" value={totals.totalIssues} icon={ClipboardCheck} />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <KPICard title="Social Tickets" value={totals.socialTickets} icon={Share2} />
          <KPICard title="Billing Tickets" value={totals.billingTickets} icon={CreditCard} />
          <KPICard title="Sales Tickets" value={totals.salesTickets} icon={ShoppingCart} />
          <KPICard title="Walk-Ins" value={totals.walkIns} icon={WalkInIcon} />
        </div>

        {/* Agent Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Agent Performance Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Rank</TableHead>
                    <TableHead>Agent Name</TableHead>
                    <TableHead className="text-right">Calls</TableHead>
                    <TableHead className="text-right">Live Chat</TableHead>
                    <TableHead className="text-right">Emails</TableHead>
                    <TableHead className="text-right">Social</TableHead>
                    <TableHead className="text-right">Billing</TableHead>
                    <TableHead className="text-right">Sales</TableHead>
                    <TableHead className="text-right">Walk-Ins</TableHead>
                    <TableHead className="text-right">Total Issues</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {teamData.map((agent) => (
                    <TableRow key={agent.agent_id}>
                      <TableCell className="font-medium">
                        <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                          agent.performance_rank === 1 ? 'bg-yellow-500/20 text-yellow-500' :
                          agent.performance_rank === 2 ? 'bg-gray-400/20 text-gray-400' :
                          agent.performance_rank === 3 ? 'bg-orange-500/20 text-orange-500' :
                          'bg-muted'
                        }`}>
                          {agent.performance_rank}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{agent.agent_name}</TableCell>
                      <TableCell className="text-right">{agent.total_calls.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_live_chat.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_emails.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_social_tickets.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_billing_tickets.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_sales_tickets.toLocaleString()}</TableCell>
                      <TableCell className="text-right">{agent.total_walk_ins.toLocaleString()}</TableCell>
                      <TableCell className="text-right font-bold">{agent.total_issues.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeadsPortal;
