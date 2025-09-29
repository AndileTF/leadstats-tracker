import { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { KPIService, TeamKPISummary, AgentKPISummary } from '@/services/kpiService';
import { toast } from '@/hooks/use-toast';
import { DateFilter } from '@/components/dashboard/DateFilter';
import { useDateRange } from '@/context/DateContext';
import { 
  Phone, MessageSquare, Mail, Share2, CreditCard, 
  ShoppingCart, Users as WalkInIcon, TrendingUp, TrendingDown,
  Download, BarChart3, Users, Award
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

const ManagementPortal = () => {
  const { dateRange } = useDateRange();
  const [teamsData, setTeamsData] = useState<TeamKPISummary[]>([]);
  const [topAgents, setTopAgents] = useState<AgentKPISummary[]>([]);
  const [bottomAgents, setBottomAgents] = useState<AgentKPISummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedTeam, setSelectedTeam] = useState<string | null>(null);

  useEffect(() => {
    fetchAllData();
  }, [dateRange]);

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const [teams, { topAgents: top, bottomAgents: bottom }] = await Promise.all([
        KPIService.getAllTeamsKPISummary(dateRange.startDate, dateRange.endDate),
        KPIService.getTopBottomAgentsAcrossTeams(10, dateRange.startDate, dateRange.endDate)
      ]);
      
      setTeamsData(teams);
      setTopAgents(top);
      setBottomAgents(bottom);
    } catch (error) {
      console.error('Error fetching management data:', error);
      toast({
        title: "Error",
        description: "Failed to fetch management overview data",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const exportToCSV = () => {
    const headers = [
      'Team Lead', 'Total Calls', 'Live Chat', 'Emails', 
      'Social Tickets', 'Billing Tickets', 'Sales Tickets', 'Walk-Ins',
      'Total Issues', 'Agent Count'
    ];
    
    const csvData = teamsData.map(team => [
      team.team_lead_name,
      team.total_calls,
      team.total_live_chat,
      team.total_emails,
      team.total_social_tickets,
      team.total_billing_tickets,
      team.total_sales_tickets,
      team.total_walk_ins,
      team.total_issues,
      team.agent_count
    ]);

    const csv = [headers, ...csvData].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `management-overview-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  const calculateGrandTotals = () => {
    return {
      calls: teamsData.reduce((sum, team) => sum + team.total_calls, 0),
      liveChat: teamsData.reduce((sum, team) => sum + team.total_live_chat, 0),
      emails: teamsData.reduce((sum, team) => sum + team.total_emails, 0),
      totalIssues: teamsData.reduce((sum, team) => sum + team.total_issues, 0),
      totalAgents: teamsData.reduce((sum, team) => sum + team.agent_count, 0),
      totalTeams: teamsData.length,
    };
  };

  const totals = calculateGrandTotals();

  const MetricCard = ({ title, value, icon: Icon, subtitle }: any) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold mt-2">{value.toLocaleString()}</p>
            {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
            <Icon className="h-6 w-6 text-primary" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading && !teamsData.length) {
    return (
      <div className="min-h-screen p-6">
        <div className="max-w-7xl mx-auto space-y-6">
          <Skeleton className="h-12 w-64" />
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold liquid-text">Management Dashboard</h1>
            <p className="text-muted-foreground mt-1">Organization-Wide Performance Overview</p>
          </div>
          <div className="flex gap-4">
            <DateFilter onApplyFilter={fetchAllData} />
            <Button onClick={exportToCSV} variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export Report
            </Button>
          </div>
        </div>

        {/* Executive Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <MetricCard 
            title="Total Issues Handled" 
            value={totals.totalIssues} 
            icon={BarChart3}
            subtitle="Across all teams"
          />
          <MetricCard 
            title="Total Teams" 
            value={totals.totalTeams} 
            icon={Users}
          />
          <MetricCard 
            title="Total Agents" 
            value={totals.totalAgents} 
            icon={Users}
          />
          <MetricCard 
            title="Total Calls" 
            value={totals.calls} 
            icon={Phone}
          />
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="teams" className="space-y-6">
          <TabsList>
            <TabsTrigger value="teams">Team Rankings</TabsTrigger>
            <TabsTrigger value="top-performers">Top Performers</TabsTrigger>
            <TabsTrigger value="improvement-areas">Improvement Areas</TabsTrigger>
          </TabsList>

          <TabsContent value="teams" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Team Performance Rankings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead className="text-right">Agents</TableHead>
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
                      {teamsData.map((team, index) => (
                        <TableRow 
                          key={team.team_lead_id}
                          className="cursor-pointer hover:bg-muted/50"
                          onClick={() => setSelectedTeam(team.team_lead_id)}
                        >
                          <TableCell>
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              index === 1 ? 'bg-gray-400/20 text-gray-400' :
                              index === 2 ? 'bg-orange-500/20 text-orange-500' :
                              'bg-muted'
                            }`}>
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">
                            {team.team_lead_name}
                            {index < 3 && (
                              <Badge variant="outline" className="ml-2">Top Performer</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">{team.agent_count}</TableCell>
                          <TableCell className="text-right">{team.total_calls.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_live_chat.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_emails.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_social_tickets.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_billing_tickets.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_sales_tickets.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{team.total_walk_ins.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-bold">{team.total_issues.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top-performers" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5 text-yellow-500" />
                  Top 10 Agents Across All Teams
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Rank</TableHead>
                        <TableHead>Agent Name</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead className="text-right">Total Issues</TableHead>
                        <TableHead className="text-right">Calls</TableHead>
                        <TableHead className="text-right">Live Chat</TableHead>
                        <TableHead className="text-right">Emails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {topAgents.map((agent, index) => (
                        <TableRow key={agent.agent_id}>
                          <TableCell>
                            <div className={`inline-flex items-center justify-center w-8 h-8 rounded-full ${
                              index === 0 ? 'bg-yellow-500/20 text-yellow-500' :
                              index === 1 ? 'bg-gray-400/20 text-gray-400' :
                              index === 2 ? 'bg-orange-500/20 text-orange-500' :
                              'bg-muted'
                            }`}>
                              {index + 1}
                            </div>
                          </TableCell>
                          <TableCell className="font-medium">{agent.agent_name}</TableCell>
                          <TableCell>{agent.team_lead_name}</TableCell>
                          <TableCell className="text-right font-bold">{agent.total_issues.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_calls.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_live_chat.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_emails.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="improvement-areas" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5 text-orange-500" />
                  Agents Needing Support
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Agent Name</TableHead>
                        <TableHead>Team Lead</TableHead>
                        <TableHead className="text-right">Total Issues</TableHead>
                        <TableHead className="text-right">Calls</TableHead>
                        <TableHead className="text-right">Live Chat</TableHead>
                        <TableHead className="text-right">Emails</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bottomAgents.map((agent) => (
                        <TableRow key={agent.agent_id}>
                          <TableCell className="font-medium">{agent.agent_name}</TableCell>
                          <TableCell>{agent.team_lead_name}</TableCell>
                          <TableCell className="text-right font-bold">{agent.total_issues.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_calls.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_live_chat.toLocaleString()}</TableCell>
                          <TableCell className="text-right">{agent.total_emails.toLocaleString()}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default ManagementPortal;
