
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { TeamLeadOverview } from "@/types/teamLead";
import { dbClient } from "@/lib/database";

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

const validateExcelRow = (row: any): row is ExcelRowData => {
  if (!row.Name || typeof row.Name !== 'string') {
    console.error('Invalid or missing Name:', row);
    return false;
  }

  if (row.Date) {
    try {
      row.Date = new Date(row.Date).toISOString().split('T')[0];
    } catch (error) {
      console.error('Invalid date format for row:', row);
      return false;
    }
  }

  const numericFields = ['Calls', 'Emails', 'LiveChat', 'Escalations', 'QAAssessments', 'SurveyTickets'];
  for (const field of numericFields) {
    row[field] = Number(row[field]) || 0;
    if (row[field] < 0) {
      console.error(`Invalid negative value for ${field}:`, row);
      return false;
    }
  }

  row.SLAPercentage = Number(row.SLAPercentage) || 100;
  if (row.SLAPercentage < 0 || row.SLAPercentage > 100) {
    console.error('Invalid SLA percentage:', row);
    return false;
  }

  return true;
};

export const FileHandlers = ({ data }: FileHandlersProps) => {
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

        const jsonData = rawData.filter(validateExcelRow);

        if (jsonData.length === 0) {
          throw new Error('No valid data found in Excel file');
        }

        console.log('Validated data:', jsonData);

        for (const row of jsonData) {
          if (!row.Name) continue;

          // Check if team lead exists in local database
          const existingTeamLeads = await dbClient.executeQuery(
            'SELECT id FROM team_leads WHERE name = $1',
            [row.Name]
          );

          let teamLeadId = existingTeamLeads[0]?.id;

          // If team lead doesn't exist, create them in local database
          if (!teamLeadId) {
            const newTeamLeads = await dbClient.executeQuery(
              'INSERT INTO team_leads (name) VALUES ($1) RETURNING id',
              [row.Name]
            );
            teamLeadId = newTeamLeads[0].id;
          }

          // Use dbClient to insert stats into individual channel tables
          const statsToInsert = {
            calls: row.Calls || 0,
            emails: row.Emails || 0,
            live_chat: row.LiveChat || 0,
            escalations: row.Escalations || 0,
            qa_assessments: row.QAAssessments || 0,
            survey_tickets: row.SurveyTickets || 0,
          };

          await dbClient.insertStats(teamLeadId, statsToInsert);
        }

        toast({
          title: "Success",
          description: `Imported ${jsonData.length} rows successfully into individual channel tables`,
        });

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
