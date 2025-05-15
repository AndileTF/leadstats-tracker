
import { useState, useEffect } from "react";
import { TeamLead } from "@/types/teamLead";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Users } from "lucide-react";

interface TeamLeadSelectorProps {
  teamLeads: TeamLead[];
  selectedTeamLead: string | null;
  setSelectedTeamLead: (id: string) => void;
}

export const TeamLeadSelector = ({ 
  teamLeads, 
  selectedTeamLead, 
  setSelectedTeamLead 
}: TeamLeadSelectorProps) => {
  const [selectedName, setSelectedName] = useState<string>("Select Team Lead");

  useEffect(() => {
    // Update the displayed name when selectedTeamLead changes
    if (selectedTeamLead) {
      const teamLead = teamLeads.find(t => t.id === selectedTeamLead);
      if (teamLead) {
        setSelectedName(teamLead.name || `Team Lead ${teamLead.id.substring(0, 8)}`);
      }
    } else if (teamLeads.length > 0) {
      // Auto-select the first team lead if none is selected and there are team leads available
      setSelectedTeamLead(teamLeads[0].id);
    }
  }, [selectedTeamLead, teamLeads, setSelectedTeamLead]);

  if (teamLeads.length === 0) {
    return (
      <div className="p-2 border border-dashed rounded-md text-muted-foreground text-sm">
        No team leads available
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={selectedTeamLead || ''} onValueChange={setSelectedTeamLead}>
        <SelectTrigger className="w-[250px] max-w-full">
          <SelectValue placeholder={selectedName} />
        </SelectTrigger>
        <SelectContent>
          {teamLeads.map((teamLead) => (
            <SelectItem 
              key={teamLead.id} 
              value={teamLead.id}
              className="flex justify-between"
            >
              <div className="flex items-center justify-between w-full">
                <span>{teamLead.name || `Team Lead ${teamLead.id.substring(0, 8)}`}</span>
                {teamLead.assigned_agents_count !== undefined && (
                  <Badge variant="outline" className="ml-2 flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    <span>{teamLead.assigned_agents_count}</span>
                  </Badge>
                )}
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};
