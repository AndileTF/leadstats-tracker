import { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import * as XLSX from 'xlsx';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/hooks/use-toast';
import { Upload, FileSpreadsheet, CheckCircle, XCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { dbClient } from '@/lib/supabaseClient';

interface ImportStep {
  step: 'upload' | 'processing' | 'complete';
  progress: number;
  processedRows: number;
  totalRows: number;
  errors: string[];
}

export const ExcelImportWizard = ({ onImportComplete }: { onImportComplete?: () => void }) => {
  const [importState, setImportState] = useState<ImportStep>({
    step: 'upload',
    progress: 0,
    processedRows: 0,
    totalRows: 0,
    errors: [],
  });

  const processExcelFile = async (file: File) => {
    try {
      setImportState({
        step: 'processing',
        progress: 0,
        processedRows: 0,
        totalRows: 0,
        errors: [],
      });

      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const rawData = XLSX.utils.sheet_to_json(worksheet);

      const totalRows = rawData.length;
      setImportState((prev) => ({ ...prev, totalRows }));

      // Store original file in Supabase Storage
      const fileName = `imports/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('excel-imports')
        .upload(fileName, file);

      if (uploadError && uploadError.message !== 'The resource already exists') {
        throw uploadError;
      }

      const errors: string[] = [];
      const BATCH_SIZE = 100;
      
      for (let i = 0; i < rawData.length; i += BATCH_SIZE) {
        const batch = rawData.slice(i, i + BATCH_SIZE);
        
        for (const row of batch) {
          try {
            const rowData = row as any;
            
            if (!rowData.Name) {
              errors.push(`Row ${i + batch.indexOf(row) + 2}: Missing team lead name`);
              continue;
            }

            // Get or create team lead
            const { data: existingTeamLeads } = await supabase
              .from('team_leads')
              .select('id')
              .eq('name', rowData.Name);

            let teamLeadId = existingTeamLeads?.[0]?.id;

            if (!teamLeadId) {
              const { data: newTeamLead, error: createError } = await supabase
                .from('team_leads')
                .insert({ name: rowData.Name })
                .select('id')
                .single();

              if (createError) throw createError;
              teamLeadId = newTeamLead.id;
            }

            // Insert stats
            await dbClient.insertStats(teamLeadId, {
              calls: Number(rowData.Calls) || 0,
              emails: Number(rowData.Emails) || 0,
              live_chat: Number(rowData.LiveChat) || 0,
              escalations: Number(rowData.Escalations) || 0,
              qa_assessments: Number(rowData.QAAssessments) || 0,
              survey_tickets: Number(rowData.SurveyTickets) || 0,
            });

          } catch (error) {
            errors.push(`Row ${i + batch.indexOf(row) + 2}: ${error instanceof Error ? error.message : 'Unknown error'}`);
          }
        }

        const processed = Math.min(i + BATCH_SIZE, totalRows);
        setImportState((prev) => ({
          ...prev,
          processedRows: processed,
          progress: (processed / totalRows) * 100,
        }));
      }

      // Record import history
      const { data: userData } = await supabase.auth.getUser();
      if (userData.user) {
        await supabase.from('import_history').insert({
          imported_by: userData.user.id,
          filename: file.name,
          file_path: fileName,
          rows_imported: totalRows - errors.length,
          status: errors.length > 0 ? 'completed_with_errors' : 'completed',
        });
      }

      setImportState({
        step: 'complete',
        progress: 100,
        processedRows: totalRows,
        totalRows,
        errors,
      });

      toast({
        title: 'Import Complete',
        description: `Successfully imported ${totalRows - errors.length} out of ${totalRows} rows`,
      });

      if (onImportComplete) {
        onImportComplete();
      }

    } catch (error) {
      toast({
        title: 'Import Failed',
        description: error instanceof Error ? error.message : 'Unknown error occurred',
        variant: 'destructive',
      });
      setImportState({ step: 'upload', progress: 0, processedRows: 0, totalRows: 0, errors: [] });
    }
  };

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      processExcelFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/vnd.ms-excel': ['.xls'],
    },
    maxFiles: 1,
  });

  const resetImport = () => {
    setImportState({ step: 'upload', progress: 0, processedRows: 0, totalRows: 0, errors: [] });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Excel Import Wizard</CardTitle>
        <CardDescription>
          Import performance data from Excel files with progress tracking
        </CardDescription>
      </CardHeader>
      <CardContent>
        {importState.step === 'upload' && (
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'
            }`}
          >
            <input {...getInputProps()} />
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            {isDragActive ? (
              <p className="text-lg">Drop the Excel file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop an Excel file here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
              </div>
            )}
          </div>
        )}

        {importState.step === 'processing' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet className="h-8 w-8 text-primary animate-pulse" />
              <div className="flex-1">
                <p className="font-medium">Processing Excel file...</p>
                <p className="text-sm text-muted-foreground">
                  {importState.processedRows} / {importState.totalRows} rows processed
                </p>
              </div>
            </div>
            <Progress value={importState.progress} />
          </div>
        )}

        {importState.step === 'complete' && (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <CheckCircle className="h-8 w-8 text-green-600" />
              <div>
                <p className="font-medium">Import Complete!</p>
                <p className="text-sm text-muted-foreground">
                  {importState.processedRows - importState.errors.length} rows imported successfully
                </p>
              </div>
            </div>

            {importState.errors.length > 0 && (
              <div className="mt-4 p-4 bg-destructive/10 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <XCircle className="h-5 w-5 text-destructive" />
                  <p className="font-medium text-destructive">
                    {importState.errors.length} errors occurred
                  </p>
                </div>
                <div className="max-h-48 overflow-y-auto space-y-1">
                  {importState.errors.map((error, idx) => (
                    <p key={idx} className="text-sm text-muted-foreground">
                      {error}
                    </p>
                  ))}
                </div>
              </div>
            )}

            <Button onClick={resetImport} className="w-full">
              Import Another File
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
