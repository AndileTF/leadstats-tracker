
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { TeamLeadOverview } from "@/types/teamLead";
import { supabase } from "@/integrations/supabase/client";

interface FileHandlersProps {
  data: TeamLeadOverview[];
}

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
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        // First, ensure team lead exists
        for (const row of jsonData) {
          const name = row.Name as string;
          if (!name) continue;

          // Check if team lead exists
          const { data: existingTeamLead } = await supabase
            .from('team_leads')
            .select('id')
            .eq('name', name)
            .single();

          let teamLeadId = existingTeamLead?.id;

          // If team lead doesn't exist, create them
          if (!teamLeadId) {
            const { data: newTeamLead, error: createError } = await supabase
              .from('team_leads')
              .insert({ name })
              .select('id')
              .single();

            if (createError) throw createError;
            teamLeadId = newTeamLead.id;
          }

          // Insert daily stats
          const { error: statsError } = await supabase
            .from('daily_stats')
            .insert({
              team_lead_id: teamLeadId,
              date: row.Date || new Date().toISOString().split('T')[0],
              calls: row.Calls || 0,
              emails: row.Emails || 0,
              live_chat: row.LiveChat || 0,
              escalations: row.Escalations || 0,
              qa_assessments: row.QAAssessments || 0,
              survey_tickets: row.SurveyTickets || 0,
              sla_percentage: row.SLAPercentage || 100
            });

          if (statsError) throw statsError;
        }

        toast({
          title: "Success",
          description: "Stats imported successfully",
        });

        // Refresh the page to show new data
        window.location.reload();
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      console.error('Import error:', error);
      toast({
        title: "Error",
        description: "Failed to import stats",
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
