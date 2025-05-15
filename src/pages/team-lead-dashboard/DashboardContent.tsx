
import { useEffect } from "react";
import { TeamLead, DailyStats } from "@/types/teamLead";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";
import { ComprehensiveDashboard } from "@/components/dashboard/ComprehensiveDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Card, CardContent } from "@/components/ui/card";

interface DashboardContentProps {
  teamLeads: TeamLead[];
  selectedTeamLead: string | null;
  setSelectedTeamLead: (id: string) => void;
  showForm: boolean;
  stats: DailyStats[];
  fetchStats: () => void;
}

export const DashboardContent = ({
  teamLeads,
  selectedTeamLead,
  setSelectedTeamLead,
  showForm,
  stats,
  fetchStats
}: DashboardContentProps) => {
  // Add an effect to attempt data fetching when component mounts or selectedTeamLead changes
  useEffect(() => {
    if (selectedTeamLead && stats.length === 0) {
      console.log("DashboardContent: Initial data fetch for selected team lead", selectedTeamLead);
      fetchStats();
    }
  }, [selectedTeamLead, fetchStats]);

  // Function to handle manual refresh
  const handleManualRefresh = () => {
    console.log("DashboardContent: Manual refresh requested");
    fetchStats();
    toast({
      title: "Refreshing data",
      description: "Fetching the latest data from the database..."
    });
  };

  return (
    <div className="space-y-6">
      {/* Data Status Indicator */}
      {stats.length === 0 && selectedTeamLead && (
        <Alert variant="warning" className="bg-amber-50 border-amber-200 text-amber-800">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertTitle>No data available</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            <p>No daily statistics data found for the selected team lead in this date range.</p>
            <div className="flex gap-2 mt-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleManualRefresh}
                className="flex items-center gap-1"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Refresh Data
              </Button>
              {showForm ? (
                <Button 
                  size="sm" 
                  variant="default"
                >
                  Add Stats Using Form Below
                </Button>
              ) : null}
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Main Content Tabs */}
      <Card>
        <CardContent className="p-4 sm:p-6">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="detailed">Detailed Data</TabsTrigger>
            </TabsList>
            
            <TabsContent value="overview">
              <TeamLeadTabs
                teamLeads={teamLeads}
                selectedTeamLead={selectedTeamLead}
                setSelectedTeamLead={setSelectedTeamLead}
                showForm={showForm}
                stats={stats}
                fetchStats={fetchStats}
              />
            </TabsContent>
            
            <TabsContent value="detailed">
              <ComprehensiveDashboard teamLeadId={selectedTeamLead} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};
