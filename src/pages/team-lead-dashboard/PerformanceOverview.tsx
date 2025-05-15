
import { useState } from "react";
import { DailyStats, TeamLead } from "@/types/teamLead";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LineChart } from "@/components/dashboard/LineChart";
import { BarChartComparison } from "@/components/dashboard/BarChartComparison";
import { PieChart } from "@/components/dashboard/PieChart";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow } from "date-fns";

interface PerformanceOverviewProps {
  stats: DailyStats[];
  teamLeadId: string | null;
  teamLeads: TeamLead[];
}

export const PerformanceOverview = ({ 
  stats, 
  teamLeadId,
  teamLeads 
}: PerformanceOverviewProps) => {
  const [metric, setMetric] = useState<string>("calls");
  const teamLead = teamLeads.find(tl => tl.id === teamLeadId);
  
  // Calculate totals and averages
  const calculateSummary = () => {
    if (!stats.length) return {
      total: 0,
      average: 0,
      max: 0,
      lastUpdated: null
    };
    
    const values = stats.map(s => s[metric as keyof DailyStats] as number || 0);
    const total = values.reduce((a, b) => a + b, 0);
    const average = total / stats.length;
    const max = Math.max(...values);
    
    // Find the most recent date
    const dates = stats.map(s => new Date(s.created_at));
    const lastUpdated = new Date(Math.max(...dates.map(d => d.getTime())));
    
    return {
      total,
      average: parseFloat(average.toFixed(2)),
      max,
      lastUpdated
    };
  };
  
  const summary = calculateSummary();
  
  // Distribution for pie chart
  const getChannelDistribution = () => {
    if (!stats.length) return [];
    
    const totalCalls = stats.reduce((sum, stat) => sum + (stat.calls || 0), 0);
    const totalEmails = stats.reduce((sum, stat) => sum + (stat.emails || 0), 0);
    const totalLiveChat = stats.reduce((sum, stat) => sum + (stat.live_chat || 0), 0);
    
    return [
      { name: 'Calls', value: totalCalls },
      { name: 'Emails', value: totalEmails },
      { name: 'Live Chat', value: totalLiveChat }
    ];
  };
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Team Lead</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamLead?.name || 'Unknown'}</div>
            {teamLead?.assigned_agents_count !== undefined && (
              <div className="mt-2 flex items-center">
                <Badge variant="outline">
                  {teamLead.assigned_agents_count} agents
                </Badge>
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total {metric}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.total}</div>
            <p className="text-xs text-muted-foreground">
              Over {stats.length} days
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Average per day</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.average}</div>
            <p className="text-xs text-muted-foreground">
              {metric} per day
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Last updated</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-lg font-medium">
              {summary.lastUpdated 
                ? formatDistanceToNow(summary.lastUpdated, { addSuffix: true }) 
                : 'Never'
              }
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.length} total records
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="trend" className="w-full">
        <TabsList>
          <TabsTrigger value="trend">Trend Analysis</TabsTrigger>
          <TabsTrigger value="distribution">Channel Distribution</TabsTrigger>
          <TabsTrigger value="metrics">Metrics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="trend" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Performance Trend</CardTitle>
              <CardDescription>
                Daily performance for {teamLead?.name || 'selected team lead'}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {stats.length > 0 ? (
                  <LineChart 
                    data={stats} 
                    teamLeadName={teamLead?.name || 'Team Lead'} 
                  />
                ) : (
                  <div className="flex h-full items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="distribution" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Channel Distribution</CardTitle>
              <CardDescription>
                Breakdown of communication channels
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {stats.length > 0 ? (
                  <PieChart data={getChannelDistribution()} />
                ) : (
                  <div className="flex h-full items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="metrics" className="pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Key Metrics Comparison</CardTitle>
              <CardDescription>
                Compare important performance indicators
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[350px]">
                {stats.length > 0 ? (
                  <BarChartComparison data={stats} />
                ) : (
                  <div className="flex h-full items-center justify-center border border-dashed rounded-md">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};
