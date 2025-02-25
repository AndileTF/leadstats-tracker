
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { TeamLeadOverview } from "@/types/teamLead";

interface GaugeChartProps {
  data: TeamLeadOverview[];
  title: string;
  description?: string;
}

// Calculate average daily issues per agent
const calculateAvgDailyIssuesPerAgent = (data: TeamLeadOverview[]): number => {
  if (data.length === 0) return 0;
  
  let totalIssues = 0;
  let totalDays = 0;
  
  data.forEach(item => {
    totalIssues += (item.total_calls || 0) + 
                  (item.total_emails || 0) + 
                  (item.total_live_chat || 0) + 
                  (item.total_escalations || 0);
    totalDays += item.total_days || 0;
  });
  
  // Average per agent per day
  const agentCount = data.length;
  if (totalDays === 0 || agentCount === 0) return 0;
  
  return totalIssues / totalDays / agentCount;
};

export const GaugeChart = ({ data, title, description }: GaugeChartProps) => {
  // Calculate daily issues per agent
  const avgDailyIssuesPerAgent = calculateAvgDailyIssuesPerAgent(data);
  
  // Define target (this could be configurable in a real app)
  const targetIssuesPerDay = 20;
  const issuePercentage = Math.min(100, Math.max(0, (avgDailyIssuesPerAgent / targetIssuesPerDay) * 100));

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent>
        <div className="flex flex-col items-center justify-center">
          <h3 className="text-lg font-semibold mb-2">Issues Per Agent Per Day</h3>
          <div className="flex items-center space-x-2 mb-1">
            <span className="text-3xl font-bold">{avgDailyIssuesPerAgent.toFixed(1)}</span>
            <span className="text-sm text-muted-foreground">/ {targetIssuesPerDay} target</span>
          </div>
          
          {/* Gauge representation */}
          <div className="relative w-64 h-32 mb-6 mt-4">
            {/* Gauge background */}
            <div className="absolute w-full h-full bg-gray-200 rounded-t-full overflow-hidden"></div>
            
            {/* Gauge fill */}
            <div 
              className={`absolute w-full h-full rounded-t-full overflow-hidden ${
                issuePercentage >= 100 ? 'bg-green-500' : 
                issuePercentage >= 80 ? 'bg-yellow-500' : 
                'bg-orange-500'
              }`}
              style={{ 
                clipPath: `polygon(0% 100%, 100% 100%, 100% ${100 - issuePercentage}%, 0% ${100 - issuePercentage}%)` 
              }}
            ></div>
            
            {/* Gauge needle */}
            <div 
              className="absolute top-full left-1/2 w-1 h-32 -mt-1 -ml-0.5 bg-gray-800 origin-top"
              style={{ transform: `rotate(${(issuePercentage / 100) * 180 - 90}deg)` }}
            ></div>
            
            {/* Gauge center point */}
            <div className="absolute bottom-0 left-1/2 w-3 h-3 -ml-1.5 rounded-full bg-gray-800"></div>
          </div>
          
          {/* Percentage display */}
          <div className="text-2xl font-bold mb-2">{issuePercentage.toFixed(1)}%</div>
          
          {/* Gauge labels */}
          <div className="w-64 flex justify-between mt-2">
            <span className="text-xs">0%</span>
            <span className="text-xs">50%</span>
            <span className="text-xs">100%</span>
          </div>
          
          <div className="text-sm text-muted-foreground mt-4">
            {issuePercentage >= 100 
              ? 'Exceeding target' 
              : issuePercentage >= 80 
              ? 'Near target' 
              : 'Below target'}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
