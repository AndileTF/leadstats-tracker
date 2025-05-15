
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";

interface PerformanceOverviewProps {
  teamLead: TeamLead | null;
  stats: DailyStats[];
}

export const PerformanceOverview = ({ teamLead, stats }: PerformanceOverviewProps) => {
  const metricLabels: { [key: string]: string } = {
    calls: 'Calls',
    emails: 'Emails',
    live_chat: 'Live Chat',
    escalations: 'Escalations',
    qa_assessments: 'QA Assessments'
  };
  
  const getMetricTotal = (metric: string): number => {
    return stats.reduce((acc, curr) => acc + (curr[metric as keyof DailyStats] as number || 0), 0);
  };
  
  // Create daily stats data that matches the expected format for LineChart
  const dailyStatsForChart = stats.map(stat => ({
    date: stat.date,
    calls: stat.calls || 0,
    emails: stat.emails || 0,
    live_chat: stat.live_chat || 0,
    escalations: stat.escalations || 0,
    qa_assessments: stat.qa_assessments || 0,
  })) as DailyStats[];
  
  // Create a simplified format for PieChart that only includes necessary fields
  interface SimplePieChartData {
    name: string;
    total: number; // Using total instead of value to match TeamLeadOverview
  }
  
  const formatPieChartData = (metric: string): SimplePieChartData[] => {
    return [
      {
        name: metricLabels[metric] || metric,
        total: getMetricTotal(metric),
      }
    ];
  };
  
  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Team Lead Performance Overview</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {teamLead ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('calls')} 
                title="Call Volume" 
                description="Total number of calls handled"
                metric="total"
              />
              <PieChart 
                data={formatPieChartData('emails')} 
                title="Email Volume" 
                description="Total number of emails handled"
                metric="total"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('live_chat')} 
                title="Live Chat Volume" 
                description="Total number of live chats handled"
                metric="total"
              />
              <PieChart 
                data={formatPieChartData('escalations')} 
                title="Escalation Volume" 
                description="Total number of escalations handled"
                metric="total"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={formatPieChartData('qa_assessments')} 
                title="QA Assessments" 
                description="Total number of QA assessments performed"
                metric="total"
              />
            </div>
            
            <LineChart 
              data={dailyStatsForChart} 
              teamLeadName={teamLead.name} 
            />
          </>
        ) : (
          <p>No team lead selected.</p>
        )}
      </CardContent>
    </Card>
  );
};
