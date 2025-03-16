
import { TeamLead, DailyStats } from "@/types/teamLead";
import { TeamLeadTabs } from "@/components/dashboard/TeamLeadTabs";

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
    <TeamLeadTabs
      teamLeads={teamLeads}
      selectedTeamLead={selectedTeamLead}
      setSelectedTeamLead={setSelectedTeamLead}
      showForm={showForm}
      stats={stats}
      fetchStats={fetchStats}
    />
  );
};
