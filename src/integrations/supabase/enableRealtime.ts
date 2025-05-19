
import { supabase } from "./client";

export const enableRealtimeForTables = async () => {
  try {
    // Set up channel subscriptions for the tables we need
    const channel = supabase.channel('db-changes')
      // Listen for changes to agents table
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'agents'
      }, payload => {
        console.log('Agent change received:', payload);
      })
      // Listen for changes to team_leads table
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'team_leads'
      }, payload => {
        console.log('Team lead change received:', payload);
      })
      // Listen for changes to daily_stats table
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'daily_stats'
      }, payload => {
        console.log('Daily stats change received:', payload);
      });

    // Subscribe to the channel
    await channel.subscribe();
    
    console.log("Realtime functionality enabled for required tables");
    return true;
  } catch (error) {
    console.error("Failed to enable realtime:", error);
    return false;
  }
};
