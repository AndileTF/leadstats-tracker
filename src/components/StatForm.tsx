
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
    survey_tickets: 0,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const currentDate = new Date().toISOString().split('T')[0];
      
      // Get team lead name for the individual tables
      const { data: teamLead, error: teamLeadError } = await supabase
        .from('team_leads')
        .select('name')
        .eq('id', teamLeadId)
        .single();

      if (teamLeadError) throw teamLeadError;

      const insertPromises = [];

      // Insert into Calls table if calls > 0
      if (stats.calls > 0) {
        insertPromises.push(
          supabase.from('Calls').insert({
            Date: currentDate,
            team_lead_id: teamLeadId,
            call_count: stats.calls,
            Name: teamLead.name
          })
        );
      }

      // Insert into Emails table if emails > 0
      if (stats.emails > 0) {
        insertPromises.push(
          supabase.from('Emails').insert({
            Date: currentDate,
            team_lead_id: teamLeadId,
            email_count: stats.emails,
            Name: teamLead.name
          })
        );
      }

      // Insert into Live Chat table if live_chat > 0
      if (stats.live_chat > 0) {
        insertPromises.push(
          supabase.from('Live Chat').insert({
            Date: currentDate,
            team_lead_id: teamLeadId,
            chat_count: stats.live_chat,
            Name: teamLead.name
          })
        );
      }

      // Insert into Escalations table if escalations > 0
      if (stats.escalations > 0) {
        insertPromises.push(
          supabase.from('Escalations').insert({
            Date: currentDate,
            team_lead_id: teamLeadId,
            escalation_count: stats.escalations,
            Name: teamLead.name
          })
        );
      }

      // Insert into QA Table if qa_assessments > 0
      if (stats.qa_assessments > 0) {
        insertPromises.push(
          supabase.from('QA Table').insert({
            Date: currentDate,
            team_lead_id: teamLeadId,
            assessment_count: stats.qa_assessments,
            Assessor: teamLead.name
          })
        );
      }

      // Insert into After Call Survey Tickets table if survey_tickets > 0
      if (stats.survey_tickets > 0) {
        insertPromises.push(
          supabase.from('After Call Survey Tickets').insert({
            date: currentDate,
            team_lead_id: teamLeadId,
            ticket_count: stats.survey_tickets
          })
        );
      }

      // Execute all insertions
      const results = await Promise.allSettled(insertPromises);
      
      // Check for any failed insertions
      const failures = results.filter(result => result.status === 'rejected');
      if (failures.length > 0) {
        console.error('Some insertions failed:', failures);
        throw new Error(`Failed to insert data into ${failures.length} table(s)`);
      }

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
