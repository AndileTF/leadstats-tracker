import { useState, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Award } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { AgentPerformance } from '@/hooks/useAgentPerformance';

interface AgentPerformanceTableProps {
  data: AgentPerformance[];
  loading?: boolean;
}

type SortField = keyof AgentPerformance;
type SortDirection = 'asc' | 'desc';

export const AgentPerformanceTable = ({ data, loading }: AgentPerformanceTableProps) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortField, setSortField] = useState<SortField>('performance_rank');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const filteredAndSortedData = useMemo(() => {
    let filtered = data.filter((agent) =>
      agent.agent_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    filtered.sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sortDirection === 'asc' 
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue);
      }
      
      return 0;
    });

    return filtered;
  }, [data, searchTerm, sortField, sortDirection]);

  const getRankBadge = (rank: number) => {
    if (rank === 1) return <Badge className="bg-yellow-500"><Award className="h-3 w-3 mr-1" />1st</Badge>;
    if (rank === 2) return <Badge className="bg-gray-400">2nd</Badge>;
    if (rank === 3) return <Badge className="bg-orange-600">3rd</Badge>;
    return <Badge variant="outline">{rank}th</Badge>;
  };

  const chartData = useMemo(() => {
    // Group agents by team and sum their total issues
    const teamMap = new Map<string, { team: string; totalIssues: number; agents: string[] }>();
    
    filteredAndSortedData.forEach((agent) => {
      const teamName = agent.team_name || 'Unknown Team';
      if (!teamMap.has(teamName)) {
        teamMap.set(teamName, { team: teamName, totalIssues: 0, agents: [] });
      }
      const teamData = teamMap.get(teamName)!;
      teamData.totalIssues += agent.total_issues;
      teamData.agents.push(agent.agent_name);
    });

    return Array.from(teamMap.values()).map(team => ({
      name: team.team,
      issues: team.totalIssues,
      agentCount: team.agents.length,
    }));
  }, [filteredAndSortedData]);

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-64">
            <p className="text-muted-foreground">Loading agent performance data...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Performance Rankings</CardTitle>
        <CardDescription>
          Comprehensive performance metrics for all team agents
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="mb-6">
          <h3 className="text-lg font-semibold mb-4">Total Issues by Team</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="issues" fill="hsl(var(--primary))" name="Total Issues" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mb-4 relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search agents by name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="rounded-md border overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('performance_rank')}
                >
                  Rank
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('agent_name')}
                >
                  Agent Name
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50"
                  onClick={() => handleSort('team_name')}
                >
                  Team
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total_calls')}
                >
                  Calls
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total_emails')}
                >
                  Emails
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total_live_chat')}
                >
                  Live Chat
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total_walk_ins')}
                >
                  Walk-Ins
                </TableHead>
                <TableHead 
                  className="cursor-pointer hover:bg-muted/50 text-right"
                  onClick={() => handleSort('total_issues')}
                >
                  Total Issues
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAndSortedData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No agent performance data available
                  </TableCell>
                </TableRow>
              ) : (
                filteredAndSortedData.map((agent) => (
                  <TableRow key={agent.agent_id}>
                    <TableCell>{getRankBadge(agent.performance_rank)}</TableCell>
                    <TableCell className="font-medium">{agent.agent_name}</TableCell>
                    <TableCell>{agent.team_name}</TableCell>
                    <TableCell className="text-right">{agent.total_calls.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{agent.total_emails.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{agent.total_live_chat.toLocaleString()}</TableCell>
                    <TableCell className="text-right">{agent.total_walk_ins.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-semibold">{agent.total_issues.toLocaleString()}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
