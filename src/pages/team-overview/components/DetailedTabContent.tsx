
import { useState } from 'react';
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { HeatmapChart } from "@/components/dashboard/HeatmapChart";

interface DetailedTabContentProps {
  overview: TeamLeadOverview[];
  dailyStats: DailyStats[];
  teamLeads: TeamLead[];
  selectedTeamLead: string | null;
  setSelectedTeamLead: (id: string) => void;
}

export const DetailedTabContent = ({ 
  overview, 
  dailyStats, 
  teamLeads, 
  selectedTeamLead, 
  setSelectedTeamLead 
}: DetailedTabContentProps) => {
  
  const getTeamLeadStats = () => {
    if (!selectedTeamLead) return [];
    return dailyStats.filter(stat => stat.team_lead_id === selectedTeamLead);
  };

  const getTeamLeadName = () => {
    const teamLead = teamLeads.find(tl => tl.id === selectedTeamLead);
    return teamLead?.name || 'Unknown';
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <PieChart 
          data={overview} 
          metric="total_calls" 
          title="Distribution of Calls" 
        />
        <PieChart 
          data={overview} 
          metric="total_emails" 
          title="Distribution of Emails" 
        />
      </div>
      
      {teamLeads.length > 0 && (
        <div className="mt-6">
          <div className="flex gap-4 mb-4">
            <select 
              value={selectedTeamLead || ''}
              onChange={(e) => setSelectedTeamLead(e.target.value)}
              className="border rounded px-3 py-2 bg-slate-900"
            >
              {teamLeads.map(tl => (
                <option key={tl.id} value={tl.id}>{tl.name}</option>
              ))}
            </select>
          </div>
          
          {selectedTeamLead && (
            <>
              <LineChart 
                data={getTeamLeadStats()} 
                teamLeadName={getTeamLeadName()}
              />
            </>
          )}
        </div>
      )}
      
      <HeatmapChart data={dailyStats} teamLeads={teamLeads} />
    </>
  );
};
