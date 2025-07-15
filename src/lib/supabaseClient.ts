
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
    // Fix timezone issue by using local date formatting
    const dateToUse = selectedDate ? 
      selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0') : 
      new Date().toISOString().split('T')[0];
    
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

  // Optimized aggregation using temporary table approach
  async getAggregatedStats(teamLeadId?: string, startDate?: string, endDate?: string) {
    try {
      // First try to use the daily_stats_duplicate table for better performance
      let query = supabase
        .from('daily_stats_duplicate')
        .select('*');

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
      return data || [];
    } catch (error) {
      console.error('Daily stats not available, using optimized individual table aggregation');
      return this.getAggregatedStatsManual(teamLeadId, startDate, endDate);
    }
  }

  // Optimized manual aggregation with temporary results map
  private async getAggregatedStatsManual(teamLeadId?: string, startDate?: string, endDate?: string) {
    // Create a temporary results map for efficient aggregation
    const tempResults = new Map<string, any>();

    // Fetch all data in parallel with date filters for better performance
    const [calls, emails, liveChat, escalations, qaAssessments, surveyTickets] = await Promise.all([
      this.getCalls(teamLeadId, startDate, endDate),
      this.getEmails(teamLeadId, startDate, endDate),
      this.getLiveChat(teamLeadId, startDate, endDate),
      this.getEscalations(teamLeadId, startDate, endDate),
      this.getQAAssessments(teamLeadId, startDate, endDate),
      this.getSurveyTickets(teamLeadId, startDate, endDate),
    ]);

    // Optimized processing function
    const processData = (records: any[], dateField: string, countField: string, statType: string) => {
      records?.forEach(record => {
        const date = record[dateField];
        const key = `${date}-${record.team_lead_id || teamLeadId}`;
        
        if (!tempResults.has(key)) {
          tempResults.set(key, {
            id: `temp-${key}`,
            team_lead_id: record.team_lead_id || teamLeadId,
            date: date,
            calls: 0,
            emails: 0,
            live_chat: 0,
            escalations: 0,
            qa_assessments: 0,
            survey_tickets: 0,
            sla_percentage: 100,
            created_at: new Date().toISOString(),
          });
        }

        const existing = tempResults.get(key);
        existing[statType] += record[countField] || 0;
      });
    };

    // Process all data types efficiently
    processData(calls, 'Date', 'call_count', 'calls');
    processData(emails, 'Date', 'email_count', 'emails');
    processData(liveChat, 'Date', 'chat_count', 'live_chat');
    processData(escalations, 'Date', 'escalation_count', 'escalations');
    processData(qaAssessments, 'Date', 'assessment_count', 'qa_assessments');
    processData(surveyTickets, 'date', 'ticket_count', 'survey_tickets');

    // Convert to array and sort by date
    return Array.from(tempResults.values()).sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }
}

// Export a singleton instance
export const dbClient = new SupabaseClient();
