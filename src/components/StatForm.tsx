
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { localDbClient } from "@/utils/localDbClient";

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
    survey_tickets: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await localDbClient.insertStats(teamLeadId, stats);

      toast({
        title: "Stats Added",
        description: "Daily stats have been successfully recorded in the individual channel tables.",
      });
      
      onSuccess();
      setStats({
        calls: 0,
        emails: 0,
        live_chat: 0,
        escalations: 0,
        qa_assessments: 0,
        survey_tickets: 0,
      });
    } catch (error) {
      console.error('Error adding stats:', error);
      toast({
        title: "Error",
        description: "Failed to add stats. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
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
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Emails</label>
            <Input
              type="number"
              value={stats.emails}
              onChange={(e) => setStats({ ...stats, emails: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Live Chat</label>
            <Input
              type="number"
              value={stats.live_chat}
              onChange={(e) => setStats({ ...stats, live_chat: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Escalations</label>
            <Input
              type="number"
              value={stats.escalations}
              onChange={(e) => setStats({ ...stats, escalations: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">QA Assessments</label>
            <Input
              type="number"
              value={stats.qa_assessments}
              onChange={(e) => setStats({ ...stats, qa_assessments: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm text-muted-foreground">Survey Tickets</label>
            <Input
              type="number"
              value={stats.survey_tickets}
              onChange={(e) => setStats({ ...stats, survey_tickets: parseInt(e.target.value) || 0 })}
              min="0"
              disabled={isSubmitting}
            />
          </div>
        </div>
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Daily Stats'}
        </Button>
      </form>
    </Card>
  );
};
