-- Insert sample agents and performance data for testing
INSERT INTO public.agents (id, name, team_lead_id, group_name) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', 'John Smith', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440002', 'Sarah Johnson', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440003', 'Mike Davis', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440004', 'Emily Brown', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440005', 'Alex Wilson', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440006', 'Lisa Garcia', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440007', 'David Miller', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440008', 'Jennifer Taylor', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-446655440009', 'Robert Anderson', (SELECT id FROM team_leads LIMIT 1), 'CSR'),
  ('550e8400-e29b-41d4-a716-44665544000A', 'Maria Rodriguez', (SELECT id FROM team_leads LIMIT 1), 'CSR')
ON CONFLICT (id) DO NOTHING;

-- Insert sample performance data for the past 7 days
INSERT INTO public.agent_performance_metrics (agent_id, date, calls, emails, live_chat, escalations, qa_assessments, walk_ins, customer_satisfaction) VALUES
  -- High performers
  ('550e8400-e29b-41d4-a716-446655440001', CURRENT_DATE, 45, 12, 8, 2, 3, 5, 4.8),
  ('550e8400-e29b-41d4-a716-446655440002', CURRENT_DATE, 42, 15, 10, 1, 4, 7, 4.9),
  ('550e8400-e29b-41d4-a716-446655440003', CURRENT_DATE, 38, 18, 12, 3, 2, 4, 4.7),
  
  -- Medium performers  
  ('550e8400-e29b-41d4-a716-446655440004', CURRENT_DATE, 32, 10, 6, 4, 2, 3, 4.2),
  ('550e8400-e29b-41d4-a716-446655440005', CURRENT_DATE, 30, 8, 5, 5, 1, 2, 4.0),
  ('550e8400-e29b-41d4-a716-446655440006', CURRENT_DATE, 28, 12, 4, 6, 3, 1, 3.8),
  ('550e8400-e29b-41d4-a716-446655440007', CURRENT_DATE, 25, 9, 7, 7, 1, 3, 3.5),
  
  -- Low performers
  ('550e8400-e29b-41d4-a716-446655440008', CURRENT_DATE, 20, 6, 3, 8, 1, 1, 3.2),
  ('550e8400-e29b-41d4-a716-446655440009', CURRENT_DATE, 18, 5, 2, 9, 0, 2, 3.0),
  ('550e8400-e29b-41d4-a716-44665544000A', CURRENT_DATE, 15, 4, 1, 10, 1, 0, 2.8)
ON CONFLICT (agent_id, date) DO NOTHING;