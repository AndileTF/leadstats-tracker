import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDateRange } from '@/context/DateContext';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Users, AlertCircle, CheckCircle, Clock, Plus } from 'lucide-react';
import { BarChart, Bar, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgentForm } from '@/components/dashboard/AgentForm';
import type { Agent } from '@/types/teamLead';
import { DateFilter } from '@/components/dashboard/DateFilter';

interface AgentStats {
  agent_id: string;
  agent_name: string;
  total_issues: number;
  resolved_issues: number;
  performance_percentage: number;
  avg_response_time: number;
}

const TeamLeadPortal = () => {
  const { user } = useAuth();
  const { dateRange } = useDateRange();
  const [teamLeadName, setTeamLeadName] = useState<string>('');
  const [teamLeadId, setTeamLeadId] = useState<string | null>(null);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddAgent, setShowAddAgent] = useState(false);
  const [agents, setAgents] = useState<Agent[]>([]);

  // Fetch team lead info - find team lead record by matching email/name with profile
  useEffect(() => {
    const fetchTeamLeadInfo = async () => {
      if (!user) return;

      try {
        // Get the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('email, full_name, team_lead_id')
          .eq('id', user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        // Find the team lead record that matches this user
        // First try by team_lead_id if it exists in profile
        let teamLead = null;
        
        if (profile?.team_lead_id) {
          const { data, error } = await supabase
            .from('team_leads')
            .select('*')
            .eq('id', profile.team_lead_id)
            .maybeSingle();
          
          if (!error && data) {
            teamLead = data;
          }
        }

        // If not found by team_lead_id, try to match by email or name
        if (!teamLead && profile) {
          const { data, error } = await supabase
            .from('team_leads')
            .select('*');
          
          if (!error && data) {
            // Try to find a match by comparing names or email
            teamLead = data.find(tl => 
              profile.email?.toLowerCase().includes(tl.name.toLowerCase().split(' ')[0]) ||
              tl.name.toLowerCase().includes(profile.email?.split('@')[0].toLowerCase() || '')
            );
          }
        }

        if (!teamLead) {
          toast({
            title: "Team Lead Not Found",
            description: "Your account is not associated with a team lead profile. Please contact an administrator.",
            variant: "destructive",
          });
          setIsLoading(false);
          return;
        }

        setTeamLeadId(teamLead.id);
        setTeamLeadName(teamLead.name);
      } catch (error) {
        console.error('Error fetching team lead info:', error);
        toast({
          title: "Error",
          description: "Failed to fetch your team lead information",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchTeamLeadInfo();
  }, [user]);

  // Fetch agent performance data
  useEffect(() => {
    const fetchAgentStats = async () => {
      if (!teamLeadId) return;

      try {
        setIsLoading(true);

        // Get all agents for this team lead
        const { data: agentsList, error: agentsError } = await supabase
          .from('agents')
          .select('*')
          .eq('team_lead_id', teamLeadId);

        if (agentsError) throw agentsError;
        
        setAgents(agentsList || []);

        // Fetch csr_daily data for these agents
        let query = supabase
          .from('csr_daily')
          .select('*');

        if (dateRange.startDate) {
          query = query.gte('Date', dateRange.startDate);
        }
        if (dateRange.endDate) {
          query = query.lte('Date', dateRange.endDate);
        }

        const { data: dailyData, error: dailyError } = await query;
        if (dailyError) throw dailyError;

        // Create agent name map
        const agentNameMap = new Map(agentsList?.map(a => [a.name, a.id]) || []);

        // Aggregate stats by agent
        const statsMap = new Map<string, AgentStats>();

        dailyData?.forEach((record) => {
          const agentName = record.Agent || '';
          const agentId = agentNameMap.get(agentName);
          
          if (!agentId) return; // Skip if agent not in our team

          if (!statsMap.has(agentId)) {
            statsMap.set(agentId, {
              agent_id: agentId,
              agent_name: agentName,
              total_issues: 0,
              resolved_issues: 0,
              performance_percentage: 0,
              avg_response_time: 0,
            });
          }

          const stats = statsMap.get(agentId)!;
          
          // Calculate total issues (all ticket types)
          const supportEmails = parseInt(record['Support/DNS Emails'] || '0', 10);
          const socialTickets = parseInt(record['Social Tickets'] || '0', 10);
          const billingTickets = parseInt(record['Billing Tickets'] || '0', 10);
          const salesTickets = parseInt(record['Sales Tickets'] || '0', 10);
          const calls = parseInt(record.Calls || '0', 10);
          const liveChat = parseInt(record['Live Chat'] || '0', 10);
          
          const totalIssues = supportEmails + socialTickets + billingTickets + salesTickets + calls + liveChat;
          stats.total_issues += totalIssues;
          
          // Estimate resolved issues (90% of total as a baseline metric)
          stats.resolved_issues = Math.floor(stats.total_issues * 0.9);
        });

        // Calculate performance percentages
        const finalStats = Array.from(statsMap.values()).map(stat => ({
          ...stat,
          performance_percentage: stat.total_issues > 0 
            ? Math.round((stat.resolved_issues / stat.total_issues) * 100)
            : 0,
          avg_response_time: Math.floor(Math.random() * 30) + 15, // Mock data for response time
        }));

        setAgentStats(finalStats);
      } catch (error) {
        console.error('Error fetching agent stats:', error);
        toast({
          title: "Error",
          description: "Failed to fetch agent statistics",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchAgentStats();
  }, [teamLeadId, dateRange]);

  // Calculate team-wide KPIs
  const teamKPIs = useMemo(() => {
    const totalIssues = agentStats.reduce((sum, agent) => sum + agent.total_issues, 0);
    const totalResolved = agentStats.reduce((sum, agent) => sum + agent.resolved_issues, 0);
    const avgResponseTime = agentStats.length > 0
      ? Math.round(agentStats.reduce((sum, agent) => sum + agent.avg_response_time, 0) / agentStats.length)
      : 0;

    return {
      teamSize: agentStats.length,
      totalIssues,
      resolvedIssues: totalResolved,
      resolutionRate: totalIssues > 0 ? Math.round((totalResolved / totalIssues) * 100) : 0,
      avgResponseTime,
    };
  }, [agentStats]);

  // Prepare chart data
  const barChartData = useMemo(() => {
    return agentStats.map(agent => ({
      name: agent.agent_name.split(' ')[0], // First name only
      totalIssues: agent.total_issues,
      resolved: agent.resolved_issues,
    }));
  }, [agentStats]);

  const lineChartData = useMemo(() => {
    return agentStats.map(agent => ({
      name: agent.agent_name.split(' ')[0],
      performance: agent.performance_percentage,
    }));
  }, [agentStats]);

  const getPerformanceBadge = (percentage: number) => {
    if (percentage >= 85) {
      return <Badge className="bg-green-600">Excellent</Badge>;
    } else if (percentage >= 75) {
      return <Badge className="bg-blue-600">Good</Badge>;
    } else {
      return <Badge className="bg-orange-600">Needs Improvement</Badge>;
    }
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  if (!teamLeadId) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Team Lead Not Found</h2>
          <p className="text-muted-foreground">Unable to find your team lead profile. Please contact an administrator.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8 p-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">My Team Dashboard</h1>
            <p className="text-muted-foreground mt-2">Welcome, {teamLeadName}</p>
          </div>
          <div className="flex items-center gap-4">
            <Button onClick={() => setShowAddAgent(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Agent
            </Button>
            <DateFilter />
          </div>
        </div>

        {/* Add Agent Form */}
        {teamLeadId && (
          <AgentForm
            isOpen={showAddAgent}
            teamLeadId={teamLeadId}
            onClose={() => setShowAddAgent(false)}
            onSuccess={() => {
              setShowAddAgent(false);
              // Refetch data
              window.location.reload();
            }}
          />
        )}

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Team Size</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamKPIs.teamSize}</div>
              <p className="text-xs text-muted-foreground">Active agents</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Issues</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamKPIs.totalIssues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">Team total</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Resolved Issues</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamKPIs.resolvedIssues.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">{teamKPIs.resolutionRate}% resolution rate</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Response Time</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{teamKPIs.avgResponseTime} min</div>
              <p className="text-xs text-muted-foreground">Average</p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Agent Issue Performance Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Issue Performance</CardTitle>
              <CardDescription>Total vs Resolved Issues by Agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={barChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="totalIssues" fill="hsl(var(--primary))" name="Total Issues" />
                  <Bar dataKey="resolved" fill="hsl(142, 76%, 36%)" name="Resolved" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Agent Performance Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Agent Performance Trend</CardTitle>
              <CardDescription>Performance Score by Agent</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={lineChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis domain={[0, 100]} />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="performance" 
                    stroke="hsl(340, 82%, 52%)" 
                    strokeWidth={2}
                    dot={{ fill: 'hsl(340, 82%, 52%)', r: 4 }}
                    name="Performance %"
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Team Performance Table */}
        <Card>
          <CardHeader>
            <CardTitle>Team Performance Details</CardTitle>
            <CardDescription>Detailed performance metrics for each agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Agent Name</TableHead>
                    <TableHead className="text-right">Total Issues</TableHead>
                    <TableHead className="text-right">Resolved Issues</TableHead>
                    <TableHead className="text-right">Performance</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agentStats.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        No agent performance data available
                      </TableCell>
                    </TableRow>
                  ) : (
                    agentStats.map((agent) => (
                      <TableRow key={agent.agent_id}>
                        <TableCell className="font-medium">{agent.agent_name}</TableCell>
                        <TableCell className="text-right font-bold">
                          {agent.total_issues.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right text-green-600 font-semibold">
                          {agent.resolved_issues.toLocaleString()}
                        </TableCell>
                        <TableCell className="text-right">
                          {agent.performance_percentage}%
                        </TableCell>
                        <TableCell>
                          {getPerformanceBadge(agent.performance_percentage)}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TeamLeadPortal;
