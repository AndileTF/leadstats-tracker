
import { localDbClient } from "./localDbClient";

export interface AggregatedData {
  id: string;
  team_lead_id: string;
  date: string;
  calls: number;
  emails: number;
  live_chat: number;
  escalations: number;
  qa_assessments: number;
  survey_tickets: number;
  sla_percentage: number;
  created_at: string;
}

export const aggregateDataFromAllTables = async (
  startDate?: string,
  endDate?: string,
  teamLeadId?: string
): Promise<AggregatedData[]> => {
  try {
    console.log('Aggregating data from all tables for:', { teamLeadId, startDate, endDate });

    // Fetch data from all tables
    const [calls, emails, liveChat, escalations, qaAssessments, surveyTickets] = await Promise.all([
      localDbClient.getCalls(teamLeadId, startDate, endDate),
      localDbClient.getEmails(teamLeadId, startDate, endDate),
      localDbClient.getLiveChat(teamLeadId, startDate, endDate),
      localDbClient.getEscalations(teamLeadId, startDate, endDate),
      localDbClient.getQAAssessments(teamLeadId, startDate, endDate),
      localDbClient.getSurveyTickets(teamLeadId, startDate, endDate),
    ]);

    console.log('Raw data fetched:', { calls, emails, liveChat, escalations, qaAssessments, surveyTickets });

    // Create a map to aggregate data by date
    const aggregatedMap = new Map<string, AggregatedData>();

    // Process calls data
    calls.forEach((record: any) => {
      const date = record.Date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.calls += record.call_count || 0;
    });

    // Process emails data
    emails.forEach((record: any) => {
      const date = record.Date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.emails += record.email_count || 0;
    });

    // Process live chat data
    liveChat.forEach((record: any) => {
      const date = record.Date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.live_chat += record.chat_count || 0;
    });

    // Process escalations data
    escalations.forEach((record: any) => {
      const date = record.Date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.escalations += record.escalation_count || 0;
    });

    // Process QA assessments data
    qaAssessments.forEach((record: any) => {
      const date = record.Date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.qa_assessments += record.assessment_count || 0;
    });

    // Process survey tickets data
    surveyTickets.forEach((record: any) => {
      const date = record.date;
      if (!aggregatedMap.has(date)) {
        aggregatedMap.set(date, {
          id: `aggregated-${date}-${teamLeadId || 'all'}`,
          team_lead_id: teamLeadId || record.team_lead_id || '',
          date,
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
      const existing = aggregatedMap.get(date)!;
      existing.survey_tickets += record.ticket_count || 0;
    });

    // Convert map to array and sort by date
    const result = Array.from(aggregatedMap.values()).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    console.log('Aggregated result:', result);
    return result;
  } catch (error) {
    console.error('Error aggregating data from all tables:', error);
    return [];
  }
};
