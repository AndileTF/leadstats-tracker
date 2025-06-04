
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { TeamLeadOverview } from "@/types/teamLead";
import { supabase } from "@/integrations/supabase/client";
import { localDbClient } from "@/utils/localDbClient";

interface FileHandlersProps {
  data: TeamLeadOverview[];
}

interface ExcelRowData {
  Name: string;
  Date: string;
  Calls: number;
  Emails: number;
  LiveChat: number;
  Escalations: number;
  QAAssessments: number;
  SurveyTickets: number;
  SLAPercentage: number;
}

/**
 * Validates the Excel row data
 * @param row - Row data from Excel
 * @returns boolean indicating if the row is valid
 */
const validateExcelRow = (row: any): row is ExcelRowData => {
  if (!row.Name || typeof row.Name !== 'string') {
    console.error('Invalid or missing Name:', row);
    return false;
  }

  // Convert date string to proper format if needed
  if (row.Date) {
    try {
      row.Date = new Date(row.Date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Invalid date format for row:', row);
      return false;
    }
  }

  // Ensure numeric fields are numbers and non-negative
  const numericFields = ['Calls', 'Emails', 'LiveChat', 'Escalations', 'QAAssessments', 'SurveyTickets'];
  for (const field of numericFields) {
    row[field] = Number(row[field]) || 0;
    if (row[field] < 0) {
      console.error(`Invalid negative value for ${field}:`, row);
      return false;
    }
  }

  // Validate SLA percentage
  row.SLAPercentage = Number(row.SLAPercentage) || 100;
  if (row.SLAPercentage < 0 || row.SLAPercentage > 100) {
    console.error('Invalid SLA percentage:', row);
    return false;
  }

  return true;
};

/**
 * Component for handling file import and export functionality
 * @param data - Array of team lead overview data for exporting
 */
export const FileHandlers = ({ data }: FileHandlersProps) => {
  /**
   * Handles Excel file upload and database insertion
   * @param event - File input change event
   */
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const rawData = XLSX.utils.sheet_to_json(worksheet);

        console.log('Raw Excel data:', rawData);

        // Validate and clean the data
        const jsonData = rawData.filter(validateExcelRow);

        if (jsonData.length === 0) {
          throw new Error('No valid data found in Excel file');
        }

        console.log('Validated data:', jsonData);

        // First, ensure team lead exists and get/create team lead ID
        for (const row of jsonData) {
          if (!row.Name) continue;

          // Check if team lead exists
          const { data: existingTeamLead } = await supabase
            .from('team_leads')
            .select('id')
            .eq('name', row.Name)
            .single();

          let teamLeadId = existingTeamLead?.id;

          // If team lead doesn't exist, create them
          if (!teamLeadId) {
            const { data: newTeamLead, error: createError } = await supabase
              .from('team_leads')
              .insert({ name: row.Name })
              .select('id')
              .single();

            if (createError) throw createError;
            teamLeadId = newTeamLead.id;
          }

          // Use localDbClient to insert stats into individual channel tables
          const statsToInsert = {
            calls: row.Calls || 0,
            emails: row.Emails || 0,
            live_chat: row.LiveChat || 0,
            escalations: row.Escalations || 0,
            qa_assessments: row.QAAssessments || 0,
            survey_tickets: row.SurveyTickets || 0,
          };

          await localDbClient.insertStats(teamLeadId, statsToInsert);
        }

        toast({
          title: "Success",
          description: `Imported ${jsonData.length} rows successfully into individual channel tables`,
        });

        // Refresh the page to show new data
        window.location.reload();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to import stats",
        variant: "destructive",
      });
    }
  };

  /**
   * Exports overview data to Excel file
   */
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Team Overview");
    XLSX.writeFile(wb, "team-overview.xlsx");
  };

  return (
    <div className="flex gap-4">
      <Input
        type="file"
        accept=".xlsx,.xls"
        onChange={handleFileUpload}
        className="hidden"
        id="file-upload"
      />
      <label htmlFor="file-upload">
        <Button variant="outline" asChild>
          <span>
            <Upload className="h-4 w-4 mr-2" />
            Import Excel
          </span>
        </Button>
      </label>
      <Button variant="outline" onClick={exportToExcel}>
        <Download className="h-4 w-4 mr-2" />
        Export Excel
      </Button>
    </div>
  );
};
