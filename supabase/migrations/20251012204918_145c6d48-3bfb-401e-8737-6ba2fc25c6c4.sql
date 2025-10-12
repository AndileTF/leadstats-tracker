-- Drop unused tables to clean up the database
-- Keeping only tables that are actively used by the application

-- Drop old/unused tables
DROP TABLE IF EXISTS "After Call Survey Tickets" CASCADE;
DROP TABLE IF EXISTS "Calls" CASCADE;
DROP TABLE IF EXISTS "Emails" CASCADE;
DROP TABLE IF EXISTS "Escalations" CASCADE;
DROP TABLE IF EXISTS "Live Chat" CASCADE;
DROP TABLE IF EXISTS "QA Table" CASCADE;
DROP TABLE IF EXISTS csr_agent_proflie CASCADE;
DROP TABLE IF EXISTS daily_stats CASCADE;
DROP TABLE IF EXISTS leadstats_kpi_records CASCADE;
DROP TABLE IF EXISTS leadstats_performance_goals CASCADE;
DROP TABLE IF EXISTS leadstats_qa_scores CASCADE;
DROP TABLE IF EXISTS leadstats_teams CASCADE;
DROP TABLE IF EXISTS leadstats_users CASCADE;
DROP TABLE IF EXISTS profile CASCADE;

-- Tables retained (actively used by the application):
-- 1. agents - Agent management
-- 2. agent_performance_metrics - Agent performance tracking
-- 3. daily_stats_duplicate - Daily statistics for team leads
-- 4. team_leads - Team lead information
-- 5. profiles - User profiles
-- 6. user_roles - Role-based access control
-- 7. import_history - Excel import tracking
-- 8. servicenow_sync_log - ServiceNow integration logs