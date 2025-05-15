
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChartComparison } from "./BarChartComparison";
import { TeamNetworkGraph } from "./TeamNetworkGraph";
import { HeatmapChart } from "./HeatmapChart";
import { ChannelHeatmap } from "./ChannelHeatmap";
import { useToast } from "@/hooks/use-toast";
import { TeamLead } from "@/types/teamLead";

interface ComprehensiveDashboardProps {
  teamLeadId: string | null;
  teamLeads: TeamLead[];
}

export const ComprehensiveDashboard = ({ teamLeadId, teamLeads }: ComprehensiveDashboardProps) => {
  const [teamData, setTeamData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  
  useEffect(() => {
    const fetchTeamComparisonData = async () => {
      setIsLoading(true);
      
      try {
        // Get summary stats for all team leads
        const { data, error } = await supabase
          .from('team_metrics')
          .select('*');
          
        if (error) throw error;
        
        setTeamData(data || []);
      } catch (err: any) {
        console.error("Error fetching team comparison data:", err);
        toast({
          title: "Error",
          description: "Failed to load team comparison data",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchTeamComparisonData();
  }, [toast]);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Team Performance Comparison</CardTitle>
          <CardDescription>Compare metrics across all team leads</CardDescription>
        </CardHeader>
        <CardContent className="h-[400px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading comparison data...</p>
            </div>
          ) : teamData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No comparison data available</p>
            </div>
          ) : (
            <BarChartComparison data={teamData} />
          )}
        </CardContent>
      </Card>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Channel Distribution Comparison</CardTitle>
            <CardDescription>Communication channels across teams</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading heatmap data...</p>
              </div>
            ) : teamData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No heatmap data available</p>
              </div>
            ) : (
              <ChannelHeatmap data={teamData} />
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Team Network</CardTitle>
            <CardDescription>Relationship between team leads and metrics</CardDescription>
          </CardHeader>
          <CardContent className="h-[350px]">
            {isLoading ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">Loading network data...</p>
              </div>
            ) : teamData.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <p className="text-muted-foreground">No network data available</p>
              </div>
            ) : (
              <TeamNetworkGraph data={teamData} teamLeads={teamLeads} currentTeamLeadId={teamLeadId} />
            )}
          </CardContent>
        </Card>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Performance Heatmap</CardTitle>
          <CardDescription>Identify patterns and outliers in team performance</CardDescription>
        </CardHeader>
        <CardContent className="h-[350px]">
          {isLoading ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">Loading heatmap data...</p>
            </div>
          ) : teamData.length === 0 ? (
            <div className="h-full flex items-center justify-center">
              <p className="text-muted-foreground">No heatmap data available</p>
            </div>
          ) : (
            <HeatmapChart data={teamData} />
          )}
        </CardContent>
      </Card>
    </div>
  );
};
