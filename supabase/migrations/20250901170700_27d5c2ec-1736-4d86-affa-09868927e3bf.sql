-- Enable real-time updates for all stats tables
ALTER PUBLICATION supabase_realtime ADD TABLE "Calls";
ALTER PUBLICATION supabase_realtime ADD TABLE "Emails"; 
ALTER PUBLICATION supabase_realtime ADD TABLE "Live Chat";
ALTER PUBLICATION supabase_realtime ADD TABLE "Escalations";
ALTER PUBLICATION supabase_realtime ADD TABLE "QA Table";
ALTER PUBLICATION supabase_realtime ADD TABLE "After Call Survey Tickets";
ALTER PUBLICATION supabase_realtime ADD TABLE "daily_stats_duplicate";
ALTER PUBLICATION supabase_realtime ADD TABLE "agents";
ALTER PUBLICATION supabase_realtime ADD TABLE "team_leads";

-- Set replica identity for proper real-time updates
ALTER TABLE "Calls" REPLICA IDENTITY FULL;
ALTER TABLE "Emails" REPLICA IDENTITY FULL;
ALTER TABLE "Live Chat" REPLICA IDENTITY FULL;
ALTER TABLE "Escalations" REPLICA IDENTITY FULL;
ALTER TABLE "QA Table" REPLICA IDENTITY FULL;
ALTER TABLE "After Call Survey Tickets" REPLICA IDENTITY FULL;
ALTER TABLE "daily_stats_duplicate" REPLICA IDENTITY FULL;
ALTER TABLE "agents" REPLICA IDENTITY FULL;
ALTER TABLE "team_leads" REPLICA IDENTITY FULL;