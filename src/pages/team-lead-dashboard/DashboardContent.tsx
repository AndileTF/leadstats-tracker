
import { TeamLead, DailyStats } from "@/types/teamLead";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";
import { ComprehensiveDashboard } from "@/components/dashboard/ComprehensiveDashboard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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
  return (
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
  );
};
