
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLead, DailyStats } from "@/types/teamLead";
import { StatForm } from "@/components/StatForm";
import { StatsGrid } from "./StatsGrid";
import { useEffect, useState } from "react";
import { LineChart } from "./LineChart";

interface TeamLeadTabsProps {
  teamLeads: TeamLead[];
  selectedTeamLead: string | null;
  setSelectedTeamLead: (id: string) => void;
  showForm: boolean;
  stats: DailyStats[];
  fetchStats: () => void;
}

export const TeamLeadTabs = ({
  teamLeads,
  selectedTeamLead,
  setSelectedTeamLead,
  showForm,
  stats,
  fetchStats
}: TeamLeadTabsProps) => {
  const [selectedTab, setSelectedTab] = useState<string>(selectedTeamLead || "");

  // Update the selected tab when selectedTeamLead changes from parent
  useEffect(() => {
    if (selectedTeamLead) {
      setSelectedTab(selectedTeamLead);
    } else if (teamLeads.length > 0) {
      setSelectedTab(teamLeads[0].id);
    }
  }, [selectedTeamLead, teamLeads]);

  const calculateTotalStats = () => {
    return stats.reduce((acc, curr) => ({
      calls: acc.calls + (curr.calls || 0),
      emails: acc.emails + (curr.emails || 0),
      live_chat: acc.live_chat + (curr.live_chat || 0),
      escalations: acc.escalations + (curr.escalations || 0),
      qa_assessments: acc.qa_assessments + (curr.qa_assessments || 0),
      survey_tickets: acc.survey_tickets + (curr.survey_tickets || 0),
    }), {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
      survey_tickets: 0,
    });
  };

  const totalStats = calculateTotalStats();
  const statsCount = stats.length || 1;
  
  // Find the selected team lead name for the LineChart
  const selectedTeamLeadName = teamLeads.find(tl => tl.id === selectedTab)?.name || "";

  const handleTabChange = (value: string) => {
    setSelectedTab(value);
    setSelectedTeamLead(value);
  };

  return (
    <Tabs 
      value={selectedTab} 
      onValueChange={handleTabChange}
      className="w-full"
    >
      <TabsList className="w-full justify-start">
        {teamLeads.map((teamLead) => (
          <TabsTrigger
            key={teamLead.id}
            value={teamLead.id}
          >
            {teamLead.name}
          </TabsTrigger>
        ))}
      </TabsList>

      {teamLeads.map((teamLead) => (
        <TabsContent key={teamLead.id} value={teamLead.id}>
          {showForm && selectedTeamLead === teamLead.id && (
            <StatForm teamLeadId={teamLead.id} onSuccess={fetchStats} />
          )}

          {/* Only render LineChart if we're on the selected team lead's tab */}
          {selectedTab === teamLead.id && stats.length > 0 && (
            <LineChart data={stats} teamLeadName={teamLead.name} />
          )}

          <StatsGrid totalStats={totalStats} statsCount={statsCount} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
