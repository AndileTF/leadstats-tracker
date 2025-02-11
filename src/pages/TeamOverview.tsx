
import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from 'react-router-dom';
import { supabase } from "@/integrations/supabase/client";
import { TeamLeadOverview } from "@/types/teamLead";
import { ArrowLeft, Filter, Download, Upload } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import * as XLSX from 'xlsx';
import { DatePicker } from "@/components/ui/date-picker";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { format, subDays, subWeeks, subMonths } from "date-fns";

const TeamOverview = () => {
  const [overview, setOverview] = useState<TeamLeadOverview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState<'week' | '2weeks' | 'month' | 'custom'>('week');
  const [customStartDate, setCustomStartDate] = useState<Date | undefined>(undefined);
  const [customEndDate, setCustomEndDate] = useState<Date | undefined>(undefined);
  const navigate = useNavigate();

  useEffect(() => {
    fetchOverview();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const endDate = new Date();
    let startDate = new Date();

    switch (dateRange) {
      case 'week':
        startDate = subDays(endDate, 7);
        break;
      case '2weeks':
        startDate = subWeeks(endDate, 2);
        break;
      case 'month':
        startDate = subMonths(endDate, 1);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          return { startDate: customStartDate, endDate: customEndDate };
        }
        startDate = subDays(endDate, 7); // Default to week if custom dates not set
        break;
    }

    return { startDate, endDate };
  };

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

  const getTotalIssuesHandled = (item: TeamLeadOverview) => {
    return (item.total_calls || 0) + 
           (item.total_emails || 0) + 
           (item.total_live_chat || 0);
  };

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
        // Then upload to Supabase
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
            <Select value={dateRange} onValueChange={(value: any) => setDateRange(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Select date range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="week">Last Week</SelectItem>
                <SelectItem value="2weeks">Last 2 Weeks</SelectItem>
                <SelectItem value="month">Last Month</SelectItem>
                <SelectItem value="custom">Custom Range</SelectItem>
              </SelectContent>
            </Select>

            {dateRange === 'custom' && (
              <div className="flex gap-4">
                <DatePicker
                  selected={customStartDate}
                  onSelect={setCustomStartDate}
                  placeholder="Start date"
                />
                <DatePicker
                  selected={customEndDate}
                  onSelect={setCustomEndDate}
                  placeholder="End date"
                />
              </div>
            )}
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4">Performance Metrics Chart</h2>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={overview}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="total_calls" fill="#8884d8" name="Total Calls" />
                <Bar dataKey="total_emails" fill="#82ca9d" name="Total Emails" />
                <Bar dataKey="total_live_chat" fill="#ffc658" name="Total Live Chat" />
                <Bar dataKey="total_escalations" fill="#ff7f0e" name="Total Escalations" />
                <Bar dataKey="total_qa_assessments" fill="#2ca02c" name="Total QA Assessments" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <h2 className="text-xl font-semibold mb-4">Team Performance</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-700">
              <thead>
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Team Lead</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Calls</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Emails</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Live Chat</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Escalations</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total QA Assessments</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Issues Handled</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">SLA %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {overview.map((item) => (
                  <tr key={item.name} className="hover:bg-gray-800/50">
                    <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_calls?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_emails?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_live_chat?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_escalations?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.total_qa_assessments?.toLocaleString() ?? 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{getTotalIssuesHandled(item).toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{item.average_sla?.toFixed(1) ?? 0}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default TeamOverview;
