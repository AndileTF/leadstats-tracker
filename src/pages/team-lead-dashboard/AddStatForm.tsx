
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamLead } from "@/types/teamLead";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DatePicker } from "@/components/ui/date-picker";
import { AlertCircle } from "lucide-react";
import { format, parse } from "date-fns";

interface AddStatFormProps {
  teamLeads: TeamLead[];
  preselectedTeamLeadId?: string | null;
  onSuccess: () => void;
}

export const AddStatForm = ({ teamLeads, preselectedTeamLeadId, onSuccess }: AddStatFormProps) => {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedTeamLead, setSelectedTeamLead] = useState(preselectedTeamLeadId || "");
  const [stats, setStats] = useState({
    calls: 0,
    emails: 0,
    live_chat: 0,
    escalations: 0,
    qa_assessments: 0,
    sla_percentage: 0,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleStatsChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0;
    setStats({ ...stats, [field]: value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (!selectedTeamLead) {
      setError("Please select a team lead");
      setLoading(false);
      return;
    }

    if (!selectedDate) {
      setError("Please select a date");
      setLoading(false);
      return;
    }

    try {
      const formattedDate = format(selectedDate, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('daily_stats')
        .insert([
          {
            team_lead_id: selectedTeamLead,
            date: formattedDate,
            calls: stats.calls,
            emails: stats.emails,
            live_chat: stats.live_chat,
            escalations: stats.escalations,
            qa_assessments: stats.qa_assessments,
            sla_percentage: stats.sla_percentage
          }
        ]);

      if (error) throw error;
      
      onSuccess();
      
      // Reset form
      setStats({
        calls: 0,
        emails: 0,
        live_chat: 0,
        escalations: 0,
        qa_assessments: 0,
        sla_percentage: 0,
      });
      
    } catch (err: any) {
      console.error("Error adding stats:", err);
      setError(err.message || "An error occurred while saving the statistics");
    } finally {
      setLoading(false);
    }
  };

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="bg-destructive/20 text-destructive p-3 rounded-md flex items-start gap-2">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <p className="text-sm">{error}</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="team-lead">Team Lead</Label>
          <Select 
            value={selectedTeamLead} 
            onValueChange={setSelectedTeamLead}
            disabled={!!preselectedTeamLeadId}
          >
            <SelectTrigger id="team-lead">
              <SelectValue placeholder="Select team lead" />
            </SelectTrigger>
            <SelectContent>
              {teamLeads.map((teamLead) => (
                <SelectItem key={teamLead.id} value={teamLead.id}>
                  {teamLead.name || `Team Lead ID: ${teamLead.id}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Date</Label>
          <DatePicker
            selected={selectedDate}
            onSelect={handleDateSelect}
            placeholder="Select date"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="calls">Calls</Label>
          <Input
            id="calls"
            type="number"
            min="0"
            value={stats.calls}
            onChange={handleStatsChange('calls')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="emails">Emails</Label>
          <Input
            id="emails"
            type="number"
            min="0"
            value={stats.emails}
            onChange={handleStatsChange('emails')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="live_chat">Live Chat</Label>
          <Input
            id="live_chat"
            type="number"
            min="0"
            value={stats.live_chat}
            onChange={handleStatsChange('live_chat')}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label htmlFor="escalations">Escalations</Label>
          <Input
            id="escalations"
            type="number"
            min="0"
            value={stats.escalations}
            onChange={handleStatsChange('escalations')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="qa_assessments">QA Assessments</Label>
          <Input
            id="qa_assessments"
            type="number"
            min="0"
            value={stats.qa_assessments}
            onChange={handleStatsChange('qa_assessments')}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="sla_percentage">SLA Percentage</Label>
          <Input
            id="sla_percentage"
            type="number"
            min="0"
            max="100"
            value={stats.sla_percentage}
            onChange={handleStatsChange('sla_percentage')}
          />
        </div>
      </div>

      <Button type="submit" disabled={loading}>
        {loading ? "Saving..." : "Add Statistics"}
      </Button>
    </form>
  );
};
