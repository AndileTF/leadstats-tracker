import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { 
  User, 
  Phone, 
  Mail, 
  MessageSquare, 
  AlertTriangle, 
  Star,
  TrendingUp,
  TrendingDown,
  Minus,
  BarChart3,
  Eye
} from 'lucide-react';
import { AgentPerformanceSummary } from '@/types/agentPerformance';

interface AgentPerformanceTableProps {
  summaries: AgentPerformanceSummary[];
  isLoading: boolean;
  onViewDetails?: (agentId: string) => void;
}

export const AgentPerformanceTable = ({ 
  summaries, 
  isLoading, 
  onViewDetails 
}: AgentPerformanceTableProps) => {
  
  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-red-500" />;
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  const getTrendBadgeVariant = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'default';
      case 'down':
        return 'destructive';
      case 'stable':
        return 'secondary';
    }
  };

  const getEfficiencyColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getCustomerSatisfactionStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />);
      } else if (i === fullStars && hasHalfStar) {
        stars.push(<Star key={i} className="h-4 w-4 text-yellow-400" />);
      } else {
        stars.push(<Star key={i} className="h-4 w-4 text-gray-300" />);
      }
    }
    
    return <div className="flex items-center gap-1">{stars}</div>;
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-3">Loading agent performance data...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!summaries.length) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center py-8">
            <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Performance Data</h3>
            <p className="text-muted-foreground">
              No agent performance data found for the selected criteria.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <User className="h-5 w-5" />
          Agent Performance Overview
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Phone className="h-4 w-4" />
                    Calls
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <Mail className="h-4 w-4" />
                    Emails
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <MessageSquare className="h-4 w-4" />
                    Live Chat
                  </div>
                </TableHead>
                <TableHead className="text-center">
                  <div className="flex items-center justify-center gap-1">
                    <AlertTriangle className="h-4 w-4" />
                    Escalations
                  </div>
                </TableHead>
                <TableHead>Customer Satisfaction</TableHead>
                <TableHead>Efficiency Score</TableHead>
                <TableHead>Trend</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {summaries.map((summary) => (
                <TableRow key={summary.agent_id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{summary.agent_name}</span>
                      <span className="text-sm text-muted-foreground">
                        {summary.days_active} days active
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{summary.total_calls}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(summary.total_calls / summary.days_active)}/day
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{summary.total_emails}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(summary.total_emails / summary.days_active)}/day
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold">{summary.total_live_chat}</span>
                      <span className="text-xs text-muted-foreground">
                        {Math.round(summary.total_live_chat / summary.days_active)}/day
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell className="text-center">
                    <div className="flex flex-col items-center">
                      <span className="font-semibold text-red-600">{summary.total_escalations}</span>
                      <span className="text-xs text-muted-foreground">
                        {((summary.total_escalations / (summary.total_calls + summary.total_emails + summary.total_live_chat)) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col items-center gap-1">
                      {getCustomerSatisfactionStars(summary.avg_customer_satisfaction)}
                      <span className="text-sm font-medium">
                        {summary.avg_customer_satisfaction.toFixed(1)}
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <div className="flex flex-col items-center gap-2">
                      <Progress 
                        value={summary.efficiency_score} 
                        className="w-16 h-2" 
                      />
                      <span className={`text-sm font-medium ${getEfficiencyColor(summary.efficiency_score)}`}>
                        {summary.efficiency_score}%
                      </span>
                    </div>
                  </TableCell>
                  
                  <TableCell>
                    <Badge 
                      variant={getTrendBadgeVariant(summary.trend)}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getTrendIcon(summary.trend)}
                      {summary.trend}
                    </Badge>
                  </TableCell>
                  
                  <TableCell>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onViewDetails?.(summary.agent_id)}
                      className="flex items-center gap-1"
                    >
                      <Eye className="h-4 w-4" />
                      Details
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        
        {/* Summary Statistics */}
        <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-primary">
              {summaries.length}
            </div>
            <div className="text-sm text-muted-foreground">Total Agents</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {summaries.reduce((acc, s) => acc + s.total_calls, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Calls</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {summaries.reduce((acc, s) => acc + s.total_emails, 0)}
            </div>
            <div className="text-sm text-muted-foreground">Total Emails</div>
          </div>
          
          <div className="text-center p-4 bg-muted/50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">
              {(summaries.reduce((acc, s) => acc + s.avg_customer_satisfaction, 0) / summaries.length).toFixed(1)}
            </div>
            <div className="text-sm text-muted-foreground">Avg. Satisfaction</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};