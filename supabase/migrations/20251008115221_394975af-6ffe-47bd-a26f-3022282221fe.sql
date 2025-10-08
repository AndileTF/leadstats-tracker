-- Create import_history table for tracking Excel imports
CREATE TABLE IF NOT EXISTS public.import_history (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  imported_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  filename text NOT NULL,
  file_path text,
  rows_imported integer NOT NULL DEFAULT 0,
  import_date timestamptz NOT NULL DEFAULT now(),
  status text NOT NULL DEFAULT 'completed',
  can_rollback boolean DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.import_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for import_history
CREATE POLICY "Admins can view all import history"
ON public.import_history FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can view their own imports"
ON public.import_history FOR SELECT
USING (
  has_role(auth.uid(), 'team_lead'::app_role) 
  AND imported_by = auth.uid()
);

CREATE POLICY "Users can insert their own imports"
ON public.import_history FOR INSERT
WITH CHECK (imported_by = auth.uid());

-- Create storage bucket for Excel imports
INSERT INTO storage.buckets (id, name, public)
VALUES ('excel-imports', 'excel-imports', false)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for excel-imports bucket
CREATE POLICY "Authenticated users can upload Excel files"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'excel-imports' 
  AND auth.uid() IS NOT NULL
);

CREATE POLICY "Users can view their own Excel files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'excel-imports' 
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins can view all Excel files"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'excel-imports' 
  AND has_role(auth.uid(), 'admin'::app_role)
);

-- Create servicenow_sync_log table
CREATE TABLE IF NOT EXISTS public.servicenow_sync_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  sync_date timestamptz NOT NULL DEFAULT now(),
  records_synced integer DEFAULT 0,
  status text NOT NULL,
  error_message text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.servicenow_sync_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies for servicenow_sync_log
CREATE POLICY "Admins can manage sync logs"
ON public.servicenow_sync_log FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Team leads can view sync logs"
ON public.servicenow_sync_log FOR SELECT
USING (has_role(auth.uid(), 'team_lead'::app_role));