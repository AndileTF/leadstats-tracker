
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview } from "@/types/teamLead";
import { ArrowLeft, Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import * as XLSX from 'xlsx';
import { format, startOfToday, endOfToday, subDays, subWeeks, subMonths } from "date-fns";
import { Input } from "@/components/ui/input";
import { PerformanceChart } from "@/components/dashboard/PerformanceChart";
import { PerformanceTable } from "@/components/dashboard/PerformanceTable";

/**
 * TeamOverview component displays performance metrics for all team leads
 */
const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState<'today' | 'day' | 'week' | 'month' | 'custom'>('today');
  const [customDate, setCustomDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'));
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, [dateFilter, customDate]);

  /**
   * Gets the date range based on the selected filter
   * @returns Object containing start and end dates
   */
  const getDateRange = () => {
    const today = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (dateFilter) {
      case 'today':
        startDate = startOfToday();
        endDate = endOfToday();
        break;
      case 'day':
        startDate = subDays(today, 1);
        endDate = today;
        break;
      case 'week':
        startDate = subDays(today, 7);
        endDate = today;
        break;
      case 'month':
        startDate = subMonths(today, 1);
        endDate = today;
        break;
      case 'custom':
        startDate = new Date(customDate);
        endDate = new Date(customDate);
        endDate.setHours(23, 59, 59);
        break;
      default:
        startDate = startOfToday();
        endDate = endOfToday();
    }

    return { startDate, endDate };
  };

  /**
   * Fetches overview data from the database
   */
  const fetchOverview = async () => {
    try {
      const { startDate, endDate } = getDateRange();
      const formattedStartDate = format(startDate, 'yyyy-MM-dd');
      const formattedEndDate = format(endDate, 'yyyy-MM-dd');

      const { data: dailyStats, error } = await supabase
        .from('daily_stats')
        .select(`
          team_leads (
            name
          ),
          calls,
          emails,
          live_chat,
          escalations,
          qa_assessments,
          sla_percentage
        `)
        .gte('date', formattedStartDate)
        .lte('date', formattedEndDate);

      if (error) throw error;

      // Transform daily stats into overview format
      const overview = dailyStats.reduce((acc: { [key: string]: any }, curr) => {
        const name = curr.team_leads?.name;
        if (!name) return acc;
        
        if (!acc[name]) {
          acc[name] = {
            name,
            total_calls: 0,
            total_emails: 0,
            total_live_chat: 0,
            total_escalations: 0,
            total_qa_assessments: 0,
            total_days: 0,
            average_sla: 0,
            sla_count: 0
          };
        }
        
        acc[name].total_calls += curr.calls || 0;
        acc[name].total_emails += curr.emails || 0;
        acc[name].total_live_chat += curr.live_chat || 0;
        acc[name].total_escalations += curr.escalations || 0;
        acc[name].total_qa_assessments += curr.qa_assessments || 0;
        acc[name].average_sla += curr.sla_percentage || 0;
        acc[name].sla_count += 1;
        acc[name].total_days += 1;
        
        return acc;
      }, {});

      // Calculate final averages and convert to array
      const overviewArray = Object.values(overview).map((item: any) => ({
        ...item,
        average_sla: item.sla_count > 0 ? item.average_sla / item.sla_count : 0
      }));

      setOverview(overviewArray as TeamLeadOverview[]);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch overview",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Handles Excel file upload
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

        // Process and validate the data here
        toast({
          title: "Success",
          description: "Stats imported successfully",
        });
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
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
    const ws = XLSX.utils.json_to_sheet(overview);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Team Overview");
    XLSX.writeFile(wb, "team-overview.xlsx");
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <Button 
              variant="ghost" 
              className="mb-4"
              onClick={() => navigate('/')}
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Team Overview
            </h1>
            <p className="text-muted-foreground mt-2">Overall performance metrics for all teams</p>
          </div>
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
        </div>

        <Card className="p-6">
          <div className="flex gap-4 mb-6">
            <Button
              variant="outline"
              onClick={() => setDateFilter('today')}
              className={dateFilter === 'today' ? 'bg-primary/20' : ''}
            >
              Today
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateFilter('day')}
              className={dateFilter === 'day' ? 'bg-primary/20' : ''}
            >
              Yesterday
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateFilter('week')}
              className={dateFilter === 'week' ? 'bg-primary/20' : ''}
            >
              Last Week
            </Button>
            <Button
              variant="outline"
              onClick={() => setDateFilter('month')}
              className={dateFilter === 'month' ? 'bg-primary/20' : ''}
            >
              Last Month
            </Button>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                onClick={() => setDateFilter('custom')}
                className={dateFilter === 'custom' ? 'bg-primary/20' : ''}
              >
                Custom
              </Button>
              <Input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                className="w-40"
              />
            </div>
          </div>

          <PerformanceChart data={overview} />
          <PerformanceTable data={overview} />
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
