
import { useState, useEffect } from "react";
import { DailyStats, TeamLead } from "@/types/teamLead";
import { useToast } from "@/hooks/use-toast";
import { TeamLeadSelector } from "./TeamLeadSelector";
import { PerformanceOverview } from "./PerformanceOverview";
import { DateSummary } from "./DateSummary";
import { useDateRange } from '@/context/DateContext';
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { StatsGrid } from "@/components/dashboard/StatsGrid";
import { ComprehensiveDashboard } from "@/components/dashboard/ComprehensiveDashboard";
import { AgentsManagement } from "./AgentsManagement";

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
  const [activeTab, setActiveTab] = useState<string>("overview");
  const { dateRange } = useDateRange();
  
  // Check for empty data situations
  const noStats = stats.length === 0;
  
  useEffect(() => {
    if (selectedTeamLead && dateRange.startDate && dateRange.endDate) {
      fetchStats();
    }
  }, [selectedTeamLead, dateRange.startDate, dateRange.endDate, fetchStats]);

  // Get the selected team lead object from the ID
  const selectedTeamLeadObject = selectedTeamLead 
    ? teamLeads.find(tl => tl.id === selectedTeamLead) || null
    : null;

  if (noStats && selectedTeamLead) {
    return (
      <Alert className="mb-6" variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>No data found</AlertTitle>
        <AlertDescription>
          No statistics data available for the selected team lead and date range.
          Try selecting a different date range or team lead.
        </AlertDescription>
        <Button 
          className="mt-4"
          onClick={fetchStats}
        >
          Retry
        </Button>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Team Lead Selector Row */}
      <div className="flex flex-col md:flex-row gap-4 md:justify-between md:items-center">
        <TeamLeadSelector 
          teamLeads={teamLeads}
          selectedTeamLead={selectedTeamLead}
          setSelectedTeamLead={setSelectedTeamLead}
        />
        
        {selectedTeamLead && (
          <DateSummary 
            startDate={dateRange.startDate} 
            endDate={dateRange.endDate}
          />
        )}
      </div>

      {/* Dashboard Tabs */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Button 
          variant={activeTab === "overview" ? "default" : "outline"}
          className="w-full"
          onClick={() => setActiveTab("overview")}
        >
          Overview
        </Button>
        <Button 
          variant={activeTab === "detailed" ? "default" : "outline"}
          className="w-full"
          onClick={() => setActiveTab("detailed")}
        >
          Detailed Stats
        </Button>
        <Button 
          variant={activeTab === "agents" ? "default" : "outline"}
          className="w-full"
          onClick={() => setActiveTab("agents")}
        >
          Agents
        </Button>
        <Button 
          variant={activeTab === "comparison" ? "default" : "outline"}
          className="w-full"
          onClick={() => setActiveTab("comparison")}
        >
          Team Comparison
        </Button>
      </div>

      {/* Tab content */}
      {activeTab === "overview" && (
        <PerformanceOverview 
          stats={stats} 
          teamLead={selectedTeamLeadObject}
        />
      )}

      {activeTab === "detailed" && (
        <StatsGrid stats={stats} />
      )}
      
      {activeTab === "agents" && (
        <AgentsManagement 
          teamLeadId={selectedTeamLead} 
          onAgentChange={fetchStats}
        />
      )}

      {activeTab === "comparison" && (
        <ComprehensiveDashboard 
          teamLeadId={selectedTeamLead}
          teamLeads={teamLeads}
        />
      )}
    </div>
  );
};
