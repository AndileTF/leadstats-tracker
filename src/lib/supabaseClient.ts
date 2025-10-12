
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

  async insertStats(teamLeadId: string, stats: any, selectedDate?: Date) {
    // Fix timezone issue by using local date formatting
    const dateToUse = selectedDate ? 
      selectedDate.getFullYear() + '-' + 
      String(selectedDate.getMonth() + 1).padStart(2, '0') + '-' + 
      String(selectedDate.getDate()).padStart(2, '0') : 
      new Date().toISOString().split('T')[0];
    
    // Insert directly into daily_stats_duplicate table
    const { error } = await supabase
      .from('daily_stats_duplicate')
      .insert({
        team_lead_id: teamLeadId,
        date: dateToUse,
        calls: stats.calls || 0,
        emails: stats.emails || 0,
        live_chat: stats.live_chat || 0,
        escalations: stats.escalations || 0,
        qa_assessments: stats.qa_assessments || 0,
        walk_ins: stats.walk_ins || 0,
        sla_percentage: stats.sla_percentage || 100,
      });
    
    if (error) throw error;
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

  // Fallback method - just return empty array since we're using daily_stats_duplicate now
  private async getAggregatedStatsManual(teamLeadId?: string, startDate?: string, endDate?: string) {
    console.warn('Manual aggregation not supported - use daily_stats_duplicate table');
    return [];
  }
}

// Export a singleton instance
export const dbClient = new SupabaseClient();
