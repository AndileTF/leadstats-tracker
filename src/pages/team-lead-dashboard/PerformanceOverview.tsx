
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart } from "@/components/dashboard/PieChart";
import { LineChart } from "@/components/dashboard/LineChart";
import { TeamLeadOverview, DailyStats, TeamLead } from "@/types/teamLead";

interface PerformanceOverviewProps {
  teamLead: TeamLead | null;
  stats: DailyStats[];
}

// Define a new interface for the pie chart data to avoid type conflicts
interface PieChartData {
  name: string;
  value: number;
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
  
  // Create our simplified PieChartData for the components
  const createPieChartData = (metric: string, title: string): PieChartData[] => {
    return [
      {
        name: metricLabels[metric] || metric,
        value: getMetricTotal(metric)
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
                data={createPieChartData('calls', 'Call Volume')} 
                title="Call Volume" 
                description="Total number of calls handled"
                metric="value"
              />
              <PieChart 
                data={createPieChartData('emails', 'Email Volume')} 
                title="Email Volume" 
                description="Total number of emails handled"
                metric="value"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={createPieChartData('live_chat', 'Live Chat Volume')} 
                title="Live Chat Volume" 
                description="Total number of live chats handled"
                metric="value"
              />
              <PieChart 
                data={createPieChartData('escalations', 'Escalation Volume')} 
                title="Escalation Volume" 
                description="Total number of escalations handled"
                metric="value"
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <PieChart 
                data={createPieChartData('qa_assessments', 'QA Assessments')} 
                title="QA Assessments" 
                description="Total number of QA assessments performed"
                metric="value"
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
