
import { supabase } from "@/integrations/supabase/client";

export class SupabaseClient {
  async executeQuery(query: string, params: any[] = []) {
    // For Supabase, we'll use the built-in query methods instead of raw SQL
    throw new Error('Use Supabase query methods instead of raw SQL');
  }

  // Team Leads methods
  async getTeamLeads() {
    const { data, error } = await supabase
      .from('team_leads')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  }

  // Get data from individual tables
  async getCalls(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('Calls').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('Date', startDate);
    }
    
    if (endDate) {
      query = query.lte('Date', endDate);
    }
    
    const { data, error } = await query.order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getEmails(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('Emails').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('Date', startDate);
    }
    
    if (endDate) {
      query = query.lte('Date', endDate);
    }
    
    const { data, error } = await query.order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getLiveChat(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('Live Chat').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('Date', startDate);
    }
    
    if (endDate) {
      query = query.lte('Date', endDate);
    }
    
    const { data, error } = await query.order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getEscalations(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('Escalations').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('Date', startDate);
    }
    
    if (endDate) {
      query = query.lte('Date', endDate);
    }
    
    const { data, error } = await query.order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getQAAssessments(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('QA Table').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('Date', startDate);
    }
    
    if (endDate) {
      query = query.lte('Date', endDate);
    }
    
    const { data, error } = await query.order('Date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async getSurveyTickets(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = supabase.from('After Call Survey Tickets').select('*');
    
    if (teamLeadId) {
      query = query.eq('team_lead_id', teamLeadId);
    }
    
    if (startDate) {
      query = query.gte('date', startDate);
    }
    
    if (endDate) {
      query = query.lte('date', endDate);
    }
    
    const { data, error } = await query.order('date', { ascending: false });
    
    if (error) throw error;
    return data;
  }

  async insertStats(teamLeadId: string, stats: any, selectedDate?: Date) {
    const dateToUse = selectedDate ? selectedDate.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
    
    // Get team lead name
    const { data: teamLeadData, error: teamLeadError } = await supabase
      .from('team_leads')
      .select('name')
      .eq('id', teamLeadId)
      .single();
    
    if (teamLeadError) throw teamLeadError;
    
    const teamLeadName = teamLeadData.name;
    const insertPromises = [];

    // Insert into individual tables based on the stats provided
    if (stats.calls > 0) {
      insertPromises.push(
        supabase.from('Calls').insert({
          Date: dateToUse,
          team_lead_id: teamLeadId,
          call_count: stats.calls,
          Name: teamLeadName
        })
      );
    }

    if (stats.emails > 0) {
      insertPromises.push(
        supabase.from('Emails').insert({
          Date: dateToUse,
          team_lead_id: teamLeadId,
          email_count: stats.emails,
          Name: teamLeadName
        })
      );
    }

    if (stats.live_chat > 0) {
      insertPromises.push(
        supabase.from('Live Chat').insert({
          Date: dateToUse,
          team_lead_id: teamLeadId,
          chat_count: stats.live_chat,
          Name: teamLeadName
        })
      );
    }

    if (stats.escalations > 0) {
      insertPromises.push(
        supabase.from('Escalations').insert({
          Date: dateToUse,
          team_lead_id: teamLeadId,
          escalation_count: stats.escalations,
          Name: teamLeadName
        })
      );
    }

    if (stats.qa_assessments > 0) {
      insertPromises.push(
        supabase.from('QA Table').insert({
          Date: dateToUse,
          team_lead_id: teamLeadId,
          assessment_count: stats.qa_assessments,
          Assessor: teamLeadName
        })
      );
    }

    if (stats.survey_tickets > 0) {
      insertPromises.push(
        supabase.from('After Call Survey Tickets').insert({
          date: dateToUse,
          team_lead_id: teamLeadId,
          ticket_count: stats.survey_tickets
        })
      );
    }

    const results = await Promise.all(insertPromises);
    
    // Check for errors
    results.forEach(result => {
      if (result.error) throw result.error;
    });
  }
}

// Export a singleton instance
export const dbClient = new SupabaseClient();
