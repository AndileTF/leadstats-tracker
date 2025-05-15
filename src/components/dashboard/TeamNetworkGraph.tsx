
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TeamLeadOverview, TeamLead } from "@/types/teamLead";

interface TeamNetworkGraphProps {
  data: TeamLeadOverview[] | any[];
  teamLeads?: TeamLead[];
  currentTeamLeadId?: string | null;
}

export const TeamNetworkGraph = ({ data, teamLeads = [], currentTeamLeadId }: TeamNetworkGraphProps) => {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">Team Network</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-4 justify-center items-center min-h-[300px]">
          {data.map((team) => {
            const isCurrentTeam = currentTeamLeadId && team.team_lead_id === currentTeamLeadId;
            const callCount = team.total_calls || 0;
            
            return (
              <div 
                key={team.team_lead_id || team.id || Math.random().toString()} 
                className={`flex flex-col items-center justify-center p-4 rounded-full 
                  ${isCurrentTeam ? 'border-2 border-primary bg-primary/10' : 'border-2 border-primary/30 bg-primary/5'}`}
                style={{
                  width: `${Math.max(80, Math.min(160, 80 + (callCount) / 10))}px`,
                  height: `${Math.max(80, Math.min(160, 80 + (callCount) / 10))}px`,
                }}
              >
                <span className="font-semibold text-center">{team.name}</span>
                <span className="text-xs text-muted-foreground mt-1">{callCount} calls</span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};
