import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  RefreshCw, 
  Download, 
  TrendingUp,
  Star,
  Clock,
  Target
} from 'lucide-react';
import { AgentPerformanceTable } from './AgentPerformanceTable';
import { AgentPerformanceFiltersComponent } from './AgentPerformanceFilters';
import { useAgentPerformance } from '@/hooks/useAgentPerformance';
import { useStatsStore } from '@/store/statsStore';
import { AgentPerformanceFilters } from '@/types/agentPerformance';
import { TeamLead } from '@/types/teamLead';
import { dbClient } from '@/lib/supabaseClient';
import { toast } from '@/hooks/use-toast';

interface AgentPerformanceDashboardProps {
  teamLeads: TeamLead[];
}

export const AgentPerformanceDashboard = ({ teamLeads }: AgentPerformanceDashboardProps) => {
  const { selectedTeamLead, dateRange } = useStatsStore();
  
  const [filters, setFilters] = useState<AgentPerformanceFilters>({
    search: '',
    teamLeadId: selectedTeamLead || undefined,
    dateRange: dateRange,
    sortBy: 'efficiency_score',
    sortOrder: 'desc',
    showTopPerformersOnly: false
  });

  const { 
    agents, 
    performanceSummaries, 
    isLoading, 
    error, 
    refetch 
  } = useAgentPerformance(filters);

  // Update filters when store values change
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      teamLeadId: selectedTeamLead || undefined,
      dateRange: dateRange
    }));
  }, [selectedTeamLead, dateRange]);

  const handleFiltersChange = (newFilters: AgentPerformanceFilters) => {
    setFilters(newFilters);
  };

  const handleViewDetails = (agentId: string) => {
    // TODO: Navigate to detailed agent view or open modal
    toast({
      title: "Agent Details",
      description: "Detailed agent view coming soon!",
    });
  };

  const handleExport = () => {
    // TODO: Implement export functionality
    toast({
      title: "Export",
      description: "Export functionality coming soon!",
    });
  };

  const getTopPerformers = () => {
    return performanceSummaries
      .filter(summary => summary.efficiency_score >= 80)
      .slice(0, 3);
  };

  const getWorstPerformers = () => {
    return performanceSummaries
      .filter(summary => summary.efficiency_score < 60)
      .slice(0, 3);
  };

  const getAverageMetrics = () => {
    if (!performanceSummaries.length) return null;
    
    const totals = performanceSummaries.reduce((acc, summary) => ({
      calls: acc.calls + summary.total_calls,
      emails: acc.emails + summary.total_emails,
      satisfaction: acc.satisfaction + summary.avg_customer_satisfaction,
      efficiency: acc.efficiency + summary.efficiency_score
    }), { calls: 0, emails: 0, satisfaction: 0, efficiency: 0 });
    
    const count = performanceSummaries.length;
    
    return {
      avgCalls: Math.round(totals.calls / count),
      avgEmails: Math.round(totals.emails / count),
      avgSatisfaction: (totals.satisfaction / count).toFixed(1),
      avgEfficiency: Math.round(totals.efficiency / count)
    };
  };

  const averageMetrics = getAverageMetrics();
  const topPerformers = getTopPerformers();
  const worstPerformers = getWorstPerformers();

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <div className="text-red-500 mb-4">
              <Users className="h-12 w-12 mx-auto" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Error Loading Data</h3>
            <p className="text-muted-foreground mb-4">{error}</p>
            <Button onClick={refetch} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Agent Performance Dashboard</h2>
          <p className="text-muted-foreground">
            Monitor and analyze individual agent performance metrics
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={refetch} disabled={isLoading}>
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      {averageMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Calls</p>
                  <p className="text-2xl font-bold">{averageMetrics.avgCalls}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-100 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Emails</p>
                  <p className="text-2xl font-bold">{averageMetrics.avgEmails}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-yellow-100 rounded-lg">
                  <Star className="h-5 w-5 text-yellow-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Satisfaction</p>
                  <p className="text-2xl font-bold">{averageMetrics.avgSatisfaction}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Clock className="h-5 w-5 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Avg. Efficiency</p>
                  <p className="text-2xl font-bold">{averageMetrics.avgEfficiency}%</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <AgentPerformanceFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        teamLeads={teamLeads}
      />

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Performance Overview</TabsTrigger>
          <TabsTrigger value="insights">Performance Insights</TabsTrigger>
        </TabsList>
        
        <TabsContent value="overview">
          <AgentPerformanceTable
            summaries={performanceSummaries}
            isLoading={isLoading}
            onViewDetails={handleViewDetails}
          />
        </TabsContent>
        
        <TabsContent value="insights" className="space-y-6">
          {/* Top Performers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-green-500" />
                Top Performers
              </CardTitle>
            </CardHeader>
            <CardContent>
              {topPerformers.length > 0 ? (
                <div className="space-y-3">
                  {topPerformers.map((performer, index) => (
                    <div key={performer.agent_id} className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="default" className="w-8 h-8 rounded-full flex items-center justify-center">
                          {index + 1}
                        </Badge>
                        <div>
                          <p className="font-medium">{performer.agent_name}</p>
                          <p className="text-sm text-muted-foreground">
                            {performer.total_calls + performer.total_emails + performer.total_live_chat} total interactions
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-green-600">{performer.efficiency_score}%</p>
                        <p className="text-sm text-muted-foreground">efficiency</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">No top performers found.</p>
              )}
            </CardContent>
          </Card>

          {/* Improvement Opportunities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-orange-500" />
                Improvement Opportunities
              </CardTitle>
            </CardHeader>
            <CardContent>
              {worstPerformers.length > 0 ? (
                <div className="space-y-3">
                  {worstPerformers.map((performer) => (
                    <div key={performer.agent_id} className="flex items-center justify-between p-3 bg-orange-50 rounded-lg">
                      <div>
                        <p className="font-medium">{performer.agent_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {performer.total_calls + performer.total_emails + performer.total_live_chat} total interactions
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-orange-600">{performer.efficiency_score}%</p>
                        <p className="text-sm text-muted-foreground">efficiency</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-muted-foreground">All agents are performing well!</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};