
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { useState, useEffect } from "react";
import { Clock, Users } from "lucide-react";

interface HeatmapProps {
  data: DailyStats[];
  teamLeads: { id: string; name: string, assigned_agents_count?: number }[];
}

interface HeatmapCell {
  teamLeadId: string;
  teamLeadName: string;
  date: string;
  value: number;
  perAgentValue: number;
  perHourValue: number;
}

export const HeatmapChart = ({ data, teamLeads }: HeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("total");
  const [displayMode, setDisplayMode] = useState<"total" | "per_agent" | "per_hour">("total");
  
  // Constants for workload calculation
  const WORK_HOURS_PER_DAY = 8;
  const AVG_TEAM_SIZE = 3; // default if no assigned_agents_count

  useEffect(() => {
    const grouped: { [key: string]: { [key: string]: HeatmapCell } } = {};
    
    // Group data by team lead and date
    data.forEach(stat => {
      const teamLead = teamLeads.find(tl => tl.id === stat.team_lead_id);
      if (!teamLead) return;
      
      if (!grouped[teamLead.id]) {
        grouped[teamLead.id] = {};
      }
      
      const total = (stat.calls || 0) + 
                  (stat.emails || 0) + 
                  (stat.live_chat || 0) + 
                  (stat.escalations || 0) + 
                  (stat.qa_assessments || 0) + 
                  (stat.survey_tickets || 0);
      
      const teamSize = teamLead.assigned_agents_count || AVG_TEAM_SIZE;
      
      const value = selectedMetric === "total" 
        ? total 
        : (stat[selectedMetric as keyof DailyStats] as number) || 0;
      
      grouped[teamLead.id][stat.date] = {
        teamLeadId: teamLead.id,
        teamLeadName: teamLead.name,
        date: stat.date,
        value: value,
        perAgentValue: value / teamSize,
        perHourValue: value / WORK_HOURS_PER_DAY
      };
    });
    
    // Convert to array
    const result: HeatmapCell[] = [];
    Object.values(grouped).forEach(dateMap => {
      Object.values(dateMap).forEach(cell => {
        result.push(cell);
      });
    });
    
    setHeatmapData(result);
  }, [data, teamLeads, selectedMetric]);

  // Get unique dates and sort them
  const uniqueDates = [...new Set(heatmapData.map(item => item.date))].sort();
  
  // Get unique team leads
  const uniqueTeamLeads = [...new Set(heatmapData.map(item => item.teamLeadName))];
  
  // Find max value for color scaling based on display mode
  const getMaxValue = () => {
    switch (displayMode) {
      case "per_agent":
        return Math.max(...heatmapData.map(item => item.perAgentValue), 1);
      case "per_hour":
        return Math.max(...heatmapData.map(item => item.perHourValue), 1);
      default:
        return Math.max(...heatmapData.map(item => item.value), 1);
    }
  };
  
  const maxValue = getMaxValue();

  // Color scaling function - using shades of purple matching the theme
  const getColorIntensity = (value: number) => {
    const normalizedValue = value / maxValue;
    return `rgba(139, 92, 246, ${normalizedValue.toFixed(2)})`;
  };

  // Get cell value based on display mode
  const getCellValue = (cell: HeatmapCell | undefined) => {
    if (!cell) return '-';
    
    switch (displayMode) {
      case "per_agent":
        return cell.perAgentValue.toFixed(1);
      case "per_hour":
        return cell.perHourValue.toFixed(1);
      default:
        return cell.value;
    }
  };

  // Get title based on display mode
  const getTitle = () => {
    const metricName = selectedMetric === "total" ? "Activities" : selectedMetric.replace(/_/g, ' ').replace(/^\w/, c => c.toUpperCase());
    
    switch (displayMode) {
      case "per_agent":
        return `${metricName} Per Team Member`;
      case "per_hour":
        return `${metricName} Per Hour`;
      default:
        return `Total ${metricName}`;
    }
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col gap-4 sm:flex-row sm:justify-between sm:items-center">
          <CardTitle className="text-xl font-semibold">{getTitle()}</CardTitle>
          <div className="flex flex-col sm:flex-row gap-2">
            <select 
              className="bg-background border border-input rounded-md px-3 py-1"
              value={selectedMetric}
              onChange={(e) => setSelectedMetric(e.target.value)}
            >
              <option value="total">Total Activity</option>
              <option value="calls">Calls</option>
              <option value="emails">Emails</option>
              <option value="live_chat">Live Chat</option>
              <option value="escalations">Escalations</option>
              <option value="qa_assessments">QA Assessments</option>
              <option value="survey_tickets">Survey Tickets</option>
            </select>
            
            <select
              className="bg-background border border-input rounded-md px-3 py-1"
              value={displayMode}
              onChange={(e) => setDisplayMode(e.target.value as "total" | "per_agent" | "per_hour")}
            >
              <option value="total">Total Numbers</option>
              <option value="per_agent">Per Team Member</option>
              <option value="per_hour">Per Hour</option>
            </select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {heatmapData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-2 py-2 border">Team Lead</th>
                  {uniqueDates.map(date => (
                    <th key={date} className="px-2 py-2 border text-xs">{date}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {uniqueTeamLeads.map(teamLead => {
                  const teamLeadData = teamLeads.find(tl => tl.name === teamLead);
                  const agentCount = teamLeadData?.assigned_agents_count || AVG_TEAM_SIZE;
                  
                  return (
                    <tr key={teamLead}>
                      <td className="px-2 py-2 border font-medium">
                        <div className="flex items-center gap-1.5">
                          <span>{teamLead}</span>
                          <span className="text-xs text-muted-foreground flex items-center">
                            <Users size={12} className="mr-0.5" />
                            {agentCount}
                          </span>
                        </div>
                      </td>
                      {uniqueDates.map(date => {
                        const cell = heatmapData.find(
                          item => item.teamLeadName === teamLead && item.date === date
                        );
                        const cellValue = getCellValue(cell);
                        const displayValue = cell ? cellValue : '-';
                        const colorValue = cell 
                          ? displayMode === "per_agent" 
                            ? cell.perAgentValue 
                            : displayMode === "per_hour" 
                              ? cell.perHourValue 
                              : cell.value 
                          : 0;
                        
                        return (
                          <td 
                            key={`${teamLead}-${date}`} 
                            className="px-2 py-2 border text-center relative"
                            style={{ 
                              backgroundColor: cell ? getColorIntensity(colorValue) : 'transparent',
                              color: cell && colorValue > (maxValue * 0.7) ? 'white' : 'inherit'
                            }}
                            title={
                              cell 
                                ? `${teamLead} (${agentCount} members) on ${date}: 
                                  Total: ${cell.value}
                                  Per Member: ${cell.perAgentValue.toFixed(1)}
                                  Per Hour: ${cell.perHourValue.toFixed(1)}`
                                : 'No data'
                            }
                          >
                            {displayMode === "per_hour" && cell ? (
                              <span className="flex items-center justify-center gap-1">
                                {displayValue}
                                <Clock size={12} className="inline-block opacity-60" />
                              </span>
                            ) : displayValue}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="flex justify-center items-center h-[200px] text-muted-foreground">
            No data available
          </div>
        )}
      </CardContent>
    </Card>
  );
};
