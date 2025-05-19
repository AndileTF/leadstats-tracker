
import { supabase } from "./client";

export const enableRealtimeForTables = async () => {
  try {
    // Enable realtime for the agents table
    await supabase.rpc('enable_realtime', { table_name: 'agents' });
    
    // Enable realtime for the team_leads table
    await supabase.rpc('enable_realtime', { table_name: 'team_leads' });
    
    // Enable realtime for the daily_stats table
    await supabase.rpc('enable_realtime', { table_name: 'daily_stats' });
    
    console.log("Realtime functionality enabled for required tables");
    return true;
  } catch (error) {
    console.error("Failed to enable realtime:", error);
    return false;
  }
};
