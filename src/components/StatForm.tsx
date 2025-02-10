
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface StatFormProps {
  teamLeadId: string;
  onSuccess: () => void;
}

export const StatForm = ({ teamLeadId, onSuccess }: StatFormProps) => {
  const [stats, setStats] = useState({
    calls: 0,
    emails: 0,
    live_chat: 0,
    escalations: 0,
    qa_assessments: 0,
    average_handling_time: '00:00:00',
    average_wait_time: '00:00:00',
    abandon_rate: 0,
    sla_percentage: 0,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase
        .from('daily_stats')
        .insert([
          {
            team_lead_id: teamLeadId,
            ...stats,
          },
        ]);

      if (error) throw error;

      toast({
        title: "Stats Added",
        description: "Daily stats have been successfully recorded.",
      });
      
      onSuccess();
      setStats({
        calls: 0,
        emails: 0,
        live_chat: 0,
        escalations: 0,
        qa_assessments: 0,
        average_handling_time: '00:00:00',
        average_wait_time: '00:00:00',
        abandon_rate: 0,
        sla_percentage: 0,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add stats. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="p-6 animate-scale-in">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Calls</label>
            <Input
              type="number"
              value={stats.calls}
              onChange={(e) => setStats({ ...stats, calls: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Emails</label>
            <Input
              type="number"
              value={stats.emails}
              onChange={(e) => setStats({ ...stats, emails: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Live Chat</label>
            <Input
              type="number"
              value={stats.live_chat}
              onChange={(e) => setStats({ ...stats, live_chat: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Escalations</label>
            <Input
              type="number"
              value={stats.escalations}
              onChange={(e) => setStats({ ...stats, escalations: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">QA Assessments</label>
            <Input
              type="number"
              value={stats.qa_assessments}
              onChange={(e) => setStats({ ...stats, qa_assessments: parseInt(e.target.value) || 0 })}
              min="0"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Average Handling Time (HH:MM:SS)</label>
            <Input
              type="time"
              step="1"
              value={stats.average_handling_time}
              onChange={(e) => setStats({ ...stats, average_handling_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Average Wait Time (HH:MM:SS)</label>
            <Input
              type="time"
              step="1"
              value={stats.average_wait_time}
              onChange={(e) => setStats({ ...stats, average_wait_time: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Abandon Rate (%)</label>
            <Input
              type="number"
              step="0.01"
              value={stats.abandon_rate}
              onChange={(e) => setStats({ ...stats, abandon_rate: parseFloat(e.target.value) || 0 })}
              min="0"
              max="100"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">SLA Percentage (%)</label>
            <Input
              type="number"
              step="0.01"
              value={stats.sla_percentage}
              onChange={(e) => setStats({ ...stats, sla_percentage: parseFloat(e.target.value) || 0 })}
              min="0"
              max="100"
            />
          </div>
        </div>
        <Button type="submit" className="w-full">Submit Daily Stats</Button>
      </form>
    </Card>
  );
};
