
import { supabase } from "@/integrations/supabase/client";
import { DailyStats } from "@/types/teamLead";

export interface AggregatedData {
  team_lead_id: string;
  date: string;
  calls: number;
  emails: number;
  live_chat: number;
  escalations: number;
  qa_assessments: number;
  survey_tickets: number;
}

export const aggregateDataFromAllTables = async (
  startDate: string,
  endDate: string,
  teamLeadId?: string
): Promise<DailyStats[]> => {
  try {
    console.log('Aggregating data from all tables for date range:', { startDate, endDate, teamLeadId });

    // Create date range array
    const dateArray = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      dateArray.push(date.toISOString().split('T')[0]);
    }

    // Build base query conditions
    const baseConditions = {
      gte: { Date: startDate },
      lte: { Date: endDate }
    };

    if (teamLeadId) {
      (baseConditions as any).eq = { team_lead_id: teamLeadId };
    }

    // Fetch data from all individual tables
    const [callsData, emailsData, liveChatData, escalationsData, qaData, surveyData] = await Promise.all([
      supabase.from('Calls').select('*')
        .gte('Date', startDate)
        .lte('Date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('Calls').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('Date', startDate)
            .lte('Date', endDate) : result),
      
      supabase.from('Emails').select('*')
        .gte('Date', startDate)
        .lte('Date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('Emails').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('Date', startDate)
            .lte('Date', endDate) : result),
      
      supabase.from('Live Chat').select('*')
        .gte('Date', startDate)
        .lte('Date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('Live Chat').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('Date', startDate)
            .lte('Date', endDate) : result),
      
      supabase.from('Escalations').select('*')
        .gte('Date', startDate)
        .lte('Date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('Escalations').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('Date', startDate)
            .lte('Date', endDate) : result),
      
      supabase.from('QA Table').select('*')
        .gte('Date', startDate)
        .lte('Date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('QA Table').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('Date', startDate)
            .lte('Date', endDate) : result),
      
      supabase.from('After Call Survey Tickets').select('*')
        .gte('date', startDate)
        .lte('date', endDate)
        .then(result => teamLeadId ? 
          supabase.from('After Call Survey Tickets').select('*')
            .eq('team_lead_id', teamLeadId)
            .gte('date', startDate)
            .lte('date', endDate) : result)
    ]);

    // Check for errors
    if (callsData.error) console.error('Calls data error:', callsData.error);
    if (emailsData.error) console.error('Emails data error:', emailsData.error);
    if (liveChatData.error) console.error('Live Chat data error:', liveChatData.error);
    if (escalationsData.error) console.error('Escalations data error:', escalationsData.error);
    if (qaData.error) console.error('QA data error:', qaData.error);
    if (surveyData.error) console.error('Survey data error:', surveyData.error);

    // Create aggregated data for each date
    const aggregatedStats: DailyStats[] = dateArray.map(date => {
      // Aggregate calls for this date
      const callsForDate = callsData.data?.filter((call: any) => call.Date === date) || [];
      const totalCalls = callsForDate.reduce((sum: number, call: any) => sum + (call.call_count || 0), 0);

      // Aggregate emails for this date
      const emailsForDate = emailsData.data?.filter((email: any) => email.Date === date) || [];
      const totalEmails = emailsForDate.reduce((sum: number, email: any) => sum + (email.email_count || 0), 0);

      // Aggregate live chat for this date
      const liveChatForDate = liveChatData.data?.filter((chat: any) => chat.Date === date) || [];
      const totalLiveChat = liveChatForDate.reduce((sum: number, chat: any) => sum + (chat.chat_count || 0), 0);

      // Aggregate escalations for this date
      const escalationsForDate = escalationsData.data?.filter((escalation: any) => escalation.Date === date) || [];
      const totalEscalations = escalationsForDate.reduce((sum: number, escalation: any) => sum + (escalation.escalation_count || 0), 0);

      // Aggregate QA assessments for this date
      const qaForDate = qaData.data?.filter((qa: any) => qa.Date === date) || [];
      const totalQA = qaForDate.reduce((sum: number, qa: any) => sum + (qa.assessment_count || 0), 0);

      // Aggregate survey tickets for this date
      const surveyForDate = surveyData.data?.filter((survey: any) => survey.date === date) || [];
      const totalSurvey = surveyForDate.reduce((sum: number, survey: any) => sum + (survey.ticket_count || 0), 0);

      return {
        id: `aggregated-${teamLeadId || 'all'}-${date}`,
        team_lead_id: teamLeadId || '',
        date: date,
        calls: totalCalls,
        emails: totalEmails,
        live_chat: totalLiveChat,
        escalations: totalEscalations,
        qa_assessments: totalQA,
        survey_tickets: totalSurvey,
        sla_percentage: 0, // Will need to be calculated separately if needed
        created_at: new Date().toISOString()
      };
    });

    console.log('Aggregated stats from all tables:', aggregatedStats);
    return aggregatedStats;

  } catch (error) {
    console.error('Error aggregating data from all tables:', error);
    throw error;
  }
};
