
-- Needed for the DataTroubleshooter component
CREATE OR REPLACE FUNCTION get_row_count(table_name TEXT)
RETURNS INTEGER AS $$
DECLARE
  count_result INTEGER;
  query TEXT;
BEGIN
  query := 'SELECT COUNT(*) FROM "' || table_name || '"';
  EXECUTE query INTO count_result;
  RETURN count_result;
EXCEPTION WHEN others THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
