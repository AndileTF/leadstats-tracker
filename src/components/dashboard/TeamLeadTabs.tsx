
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { TeamLead, DailyStats } from "@/types/teamLead";
import { StatForm } from "@/components/StatForm";
import { StatsGrid } from "./StatsGrid";
import { DateFilter } from "./DateFilter";
import { useState } from "react";
import { format } from "date-fns";

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
  const [dateFilter, setDateFilter] = useState<'today' | 'day' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));

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

  return (
    <div className="space-y-6">
      <DateFilter
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        customDate={customDate}
        setCustomDate={setCustomDate}
      />
      
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
    </div>
  );
};
