
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLead, DailyStats } from "@/types/teamLead";
import { StatForm } from "@/components/StatForm";
import { StatsGrid } from "./StatsGrid";

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
  const calculateTotalStats = () => {
    return stats.reduce((acc, curr) => ({
      calls: acc.calls + (curr.calls || 0),
      emails: acc.emails + (curr.emails || 0),
      live_chat: acc.live_chat + (curr.live_chat || 0),
      escalations: acc.escalations + (curr.escalations || 0),
      qa_assessments: acc.qa_assessments + (curr.qa_assessments || 0),
      average_handling_time: acc.average_handling_time + parseFloat(curr.average_handling_time) || 0,
      average_wait_time: acc.average_wait_time + parseFloat(curr.average_wait_time) || 0,
      abandon_rate: acc.abandon_rate + (curr.abandon_rate || 0),
      sla_percentage: acc.sla_percentage + (curr.sla_percentage || 0),
    }), {
      calls: 0,
      emails: 0,
      live_chat: 0,
      escalations: 0,
      qa_assessments: 0,
      average_handling_time: 0,
      average_wait_time: 0,
      abandon_rate: 0,
      sla_percentage: 0,
    });
  };

  const totalStats = calculateTotalStats();
  const statsCount = stats.length || 1;

  return (
    <Tabs defaultValue={teamLeads[0]?.id} className="w-full">
      <TabsList className="w-full justify-start">
        {teamLeads.map((teamLead) => (
          <TabsTrigger
            key={teamLead.id}
            value={teamLead.id}
            onClick={() => setSelectedTeamLead(teamLead.id)}
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

          <StatsGrid totalStats={totalStats} statsCount={statsCount} />
        </TabsContent>
      ))}
    </Tabs>
  );
};
