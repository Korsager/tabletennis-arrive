-- Add past tournaments for testing the Previous Tournaments feature
INSERT INTO tournaments (name, description, start_date, end_date, active) VALUES
  ('Winter 2024 League', 'Winter season tournament', '2024-10-01', '2024-12-31', false),
  ('Fall 2024 League', 'Fall season tournament', '2024-08-01', '2024-09-30', false),
  ('Summer 2024 League', 'Summer season tournament', '2024-06-01', '2024-07-31', false)
ON CONFLICT DO NOTHING;
