
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { useState, useEffect } from "react";

interface HeatmapProps {
  data: DailyStats[];
  teamLeads: { id: string; name: string }[];
}

interface HeatmapCell {
  teamLeadId: string;
  teamLeadName: string;
  date: string;
  value: number;
}

export const HeatmapChart = ({ data, teamLeads }: HeatmapProps) => {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [selectedMetric, setSelectedMetric] = useState<string>("total");

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
      
      grouped[teamLead.id][stat.date] = {
        teamLeadId: teamLead.id,
        teamLeadName: teamLead.name,
        date: stat.date,
        value: selectedMetric === "total" 
          ? total 
          : (stat[selectedMetric as keyof DailyStats] as number) || 0
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
  
  // Find max value for color scaling
  const maxValue = Math.max(...heatmapData.map(item => item.value), 1);

  // Color scaling function
  const getColorIntensity = (value: number) => {
    const normalizedValue = value / maxValue;
    return `rgba(76, 29, 149, ${normalizedValue.toFixed(2)})`;
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl font-semibold">Workload Heatmap</CardTitle>
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
                {uniqueTeamLeads.map(teamLead => (
                  <tr key={teamLead}>
                    <td className="px-2 py-2 border font-medium">{teamLead}</td>
                    {uniqueDates.map(date => {
                      const cell = heatmapData.find(
                        item => item.teamLeadName === teamLead && item.date === date
                      );
                      return (
                        <td 
                          key={`${teamLead}-${date}`} 
                          className="px-2 py-2 border text-center"
                          style={{ 
                            backgroundColor: cell ? getColorIntensity(cell.value) : 'transparent',
                            color: cell && cell.value > (maxValue * 0.7) ? 'white' : 'inherit'
                          }}
                          title={cell ? `${teamLead} on ${date}: ${cell.value}` : 'No data'}
                        >
                          {cell ? cell.value : '-'}
                        </td>
                      );
                    })}
                  </tr>
                ))}
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
