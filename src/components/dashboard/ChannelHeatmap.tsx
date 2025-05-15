
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats, TeamLead } from "@/types/teamLead";
import { useState, useEffect } from "react";
import { Phone, Mail, MessageSquare, AlertTriangle, FileCheck, Ticket } from "lucide-react";

interface ChannelHeatmapProps {
  data: DailyStats[];
  teamLeads: TeamLead[];
}

type Channel = "calls" | "emails" | "live_chat" | "escalations" | "qa_assessments" | "survey_tickets";

interface ChannelData {
  id: string;
  name: string;
  channels: {
    [key in Channel]: {
      total: number;
      perHour: number;
    }
  };
  assigned_agents_count: number;
}

export const ChannelHeatmap = ({ data, teamLeads }: ChannelHeatmapProps) => {
  const [channelData, setChannelData] = useState<ChannelData[]>([]);
  const [sortBy, setSortBy] = useState<Channel>("calls");
  
  // Constants
  const WORK_HOURS_PER_DAY = 8;
  const AVG_TEAM_SIZE = 3;
  
  // Channel configurations with icons and display names
  const channels: { key: Channel; label: string; icon: React.ReactNode }[] = [
    { key: "calls", label: "Calls", icon: <Phone size={16} /> },
    { key: "emails", label: "Emails", icon: <Mail size={16} /> },
    { key: "live_chat", label: "Live Chat", icon: <MessageSquare size={16} /> },
    { key: "escalations", label: "Escalations", icon: <AlertTriangle size={16} /> },
    { key: "qa_assessments", label: "QA Assessments", icon: <FileCheck size={16} /> },
    { key: "survey_tickets", label: "Survey Tickets", icon: <Ticket size={16} /> },
  ];

  useEffect(() => {
    // Group by team lead and calculate average per hour
    const teamLeadTotals: { [key: string]: { [key in Channel]: number } } = {};
    const teamLeadDays: { [key: string]: number } = {};
    
    data.forEach(stat => {
      const teamLeadId = stat.team_lead_id;
      
      if (!teamLeadTotals[teamLeadId]) {
        teamLeadTotals[teamLeadId] = {
          calls: 0,
          emails: 0,
          live_chat: 0,
          escalations: 0,
          qa_assessments: 0,
          survey_tickets: 0
        };
        teamLeadDays[teamLeadId] = 0;
      }
      
      // Increment day count
      teamLeadDays[teamLeadId]++;
      
      // Sum all channels
      channels.forEach(channel => {
        teamLeadTotals[teamLeadId][channel.key] += (stat[channel.key] as number) || 0;
      });
    });
    
    // Calculate averages and build result
    const result = teamLeads.map(teamLead => {
      const totals = teamLeadTotals[teamLead.id] || {
        calls: 0,
        emails: 0,
        live_chat: 0,
        escalations: 0, 
        qa_assessments: 0,
        survey_tickets: 0
      };
      
      const days = teamLeadDays[teamLead.id] || 1; // Avoid division by zero
      const hoursWorked = days * WORK_HOURS_PER_DAY;
      const agentCount = teamLead.assigned_agents_count || AVG_TEAM_SIZE;
      
      // Calculate per hour rates for each channel
      const channelData: { [key in Channel]: { total: number; perHour: number } } = {} as any;
      
      channels.forEach(channel => {
        const total = totals[channel.key];
        channelData[channel.key] = {
          total,
          perHour: total / hoursWorked
        };
      });
      
      return {
        id: teamLead.id,
        name: teamLead.name,
        channels: channelData,
        assigned_agents_count: agentCount
      };
    });
    
    // Sort by the selected channel's per hour rate
    result.sort((a, b) => b.channels[sortBy].perHour - a.channels[sortBy].perHour);
    
    setChannelData(result);
  }, [data, teamLeads, sortBy]);

  // Color scaling function - get color based on value intensity
  const getColorIntensity = (value: number, max: number) => {
    const normalized = Math.min(value / max, 1); // Cap at 1 to avoid super dark colors
    return `rgba(139, 92, 246, ${normalized.toFixed(2)})`;
  };

  // Find maximum values for each channel for color scaling
  const maxValues: { [key in Channel]: number } = {} as any;
  
  channels.forEach(channel => {
    maxValues[channel.key] = Math.max(
      ...channelData.map(data => data.channels[channel.key].perHour),
      0.1 // Minimum to avoid division by zero
    );
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">Average Issues Per Hour by Channel</CardTitle>
          <select
            className="bg-background border border-input rounded-md px-3 py-1"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as Channel)}
          >
            {channels.map(channel => (
              <option key={channel.key} value={channel.key}>
                Sort by {channel.label}
              </option>
            ))}
          </select>
        </div>
      </CardHeader>
      <CardContent>
        {channelData.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse">
              <thead>
                <tr>
                  <th className="px-3 py-2 border text-left">Team Lead</th>
                  {channels.map(channel => (
                    <th key={channel.key} className="px-3 py-2 border">
                      <div className="flex items-center justify-center gap-1.5">
                        {channel.icon}
                        <span>{channel.label}</span>
                      </div>
                    </th>
                  ))}
                  <th className="px-3 py-2 border">Total Per Hour</th>
                </tr>
              </thead>
              <tbody>
                {channelData.map(teamData => {
                  // Calculate total issues per hour across all channels
                  const totalPerHour = channels.reduce(
                    (sum, channel) => sum + teamData.channels[channel.key].perHour, 
                    0
                  );
                  
                  return (
                    <tr key={teamData.id}>
                      <td className="px-3 py-2 border">
                        <div className="flex flex-col">
                          <span className="font-medium">{teamData.name}</span>
                          <span className="text-xs text-muted-foreground">
                            {teamData.assigned_agents_count} team members
                          </span>
                        </div>
                      </td>
                      
                      {channels.map(channel => {
                        const channelData = teamData.channels[channel.key];
                        const perHour = channelData.perHour;
                        const max = maxValues[channel.key];
                        const backgroundColor = getColorIntensity(perHour, max);
                        const textColor = perHour > (max * 0.7) ? 'white' : 'inherit';
                        
                        return (
                          <td 
                            key={`${teamData.id}-${channel.key}`}
                            className="px-3 py-2 border text-center"
                            style={{ backgroundColor, color: textColor }}
                            title={`${teamData.name}: ${perHour.toFixed(2)} ${channel.label} per hour
                                    Total: ${channelData.total}`}
                          >
                            {perHour.toFixed(2)}
                          </td>
                        );
                      })}
                      
                      <td className="px-3 py-2 border text-center font-medium">
                        {totalPerHour.toFixed(2)}
                      </td>
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
