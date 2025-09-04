import { dbClient } from "@/lib/supabaseClient";

export interface AggregatedData {
  id: string;
  team_lead_id: string;
  date: string;
  calls: number;
  emails: number;
  live_chat: number;
  escalations: number;
  qa_assessments: number;
  walk_ins: number;
  sla_percentage: number;
  created_at: string;
}

export const aggregateDataFromAllTables = async (
  startDate?: string,
  endDate?: string,
  teamLeadId?: string
): Promise<AggregatedData[]> => {
  try {
    console.log('Using optimized aggregation for:', { teamLeadId, startDate, endDate });

    // Use the optimized aggregation method from supabase client
    const result = await dbClient.getAggregatedStats(teamLeadId, startDate, endDate);
    
    console.log('Optimized aggregation result:', result);
    return result as AggregatedData[];
  } catch (error) {
    console.error('Error in optimized aggregation:', error);
    return [];
  }
};
