
import { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Progress } from "@/components/ui/progress";
import { differenceInDays } from 'date-fns';
import { useDateRange } from '@/context/DateContext';

interface LineChartProps {
  data: DailyStats[];
  teamLeadName: string;
}

const METRICS = [
  { key: 'calls', name: 'Calls', color: '#8884d8' },
  { key: 'emails', name: 'Emails', color: '#82ca9d' },
  { key: 'live_chat', name: 'Live Chat', color: '#ffc658' },
  { key: 'escalations', name: 'Escalations', color: '#ff7f0e' },
  { key: 'qa_assessments', name: 'QA Assessments', color: '#2ca02c' },
  { key: 'walk_ins', name: 'Walk-ins', color: '#d62728' },
];

// Base target values per day
const DAILY_TARGET = 20;
const WEEKLY_TARGET = 120; // ~17 per day
const MONTHLY_TARGET = 480; // ~16 per day

type TimeRange = 'daily' | 'weekly' | 'monthly';

export const LineChart = ({ data, teamLeadName }: LineChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState(METRICS.map(m => m.key));
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [processedData, setProcessedData] = useState<any[]>([]);
  const { dateRange } = useDateRange();
  
  // Calculate the target based on the selected date range
  const calculateTarget = () => {
    const start = new Date(dateRange.startDate);
    const end = new Date(dateRange.endDate);
    const daysDifference = differenceInDays(end, start) + 1; // +1 to include both start and end dates
    
    if (timeRange === 'daily') {
      return DAILY_TARGET;
    } else if (timeRange === 'weekly') {
      // If the date range is less than 7 days, prorate the weekly target
      return daysDifference < 7 
        ? Math.round((daysDifference / 7) * WEEKLY_TARGET) 
        : WEEKLY_TARGET;
    } else if (timeRange === 'monthly') {
      // If the date range is less than 30 days, prorate the monthly target
      return daysDifference < 30 
        ? Math.round((daysDifference / 30) * MONTHLY_TARGET) 
        : MONTHLY_TARGET;
    }
    return DAILY_TARGET; // Default fallback
  };

  // Calculate current target
  const currentTarget = calculateTarget();

  // Process data whenever time range changes or data updates
  useEffect(() => {
    if (!data || data.length === 0) return;

    // Sort data by date in ascending order to ensure correct accumulation
    const sortedData = [...data].sort((a, b) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );

    let formattedData;
    
    if (timeRange === 'daily') {
      // For daily view, just use the sorted data with totals calculated
      formattedData = sortedData.map(stat => ({
        date: stat.date,
        name: teamLeadName, // Replace date with team lead name
        calls: stat.calls || 0,
        emails: stat.emails || 0,
        live_chat: stat.live_chat || 0,
        escalations: stat.escalations || 0,
        qa_assessments: stat.qa_assessments || 0,
        walk_ins: stat.walk_ins || 0,
        total: (stat.calls || 0) + (stat.emails || 0) + (stat.live_chat || 0) + 
               (stat.escalations || 0) + (stat.qa_assessments || 0) + (stat.walk_ins || 0)
      }));
    } 
    else if (timeRange === 'weekly') {
      // Group by week and accumulate values
      const weeklyData: Record<string, any> = {};
      
      sortedData.forEach((stat, index) => {
        // Use the week's start date as the key (simplification: use the date as is)
        const weekKey = stat.date;
        
        if (!weeklyData[weekKey]) {
          weeklyData[weekKey] = {
            date: weekKey,
            name: teamLeadName, // Replace date with team lead name
            calls: 0,
            emails: 0,
            live_chat: 0,
            escalations: 0,
            qa_assessments: 0,
            walk_ins: 0,
            total: 0
          };
        }
        
        // Add a rolling 7-day total for each date
        const last7Days = sortedData.slice(Math.max(0, index - 6), index + 1);
        
        weeklyData[weekKey] = {
          date: weekKey,
          name: teamLeadName, // Replace date with team lead name
          calls: last7Days.reduce((sum, d) => sum + (d.calls || 0), 0),
          emails: last7Days.reduce((sum, d) => sum + (d.emails || 0), 0),
          live_chat: last7Days.reduce((sum, d) => sum + (d.live_chat || 0), 0),
          escalations: last7Days.reduce((sum, d) => sum + (d.escalations || 0), 0),
          qa_assessments: last7Days.reduce((sum, d) => sum + (d.qa_assessments || 0), 0),
          walk_ins: last7Days.reduce((sum, d) => sum + (d.walk_ins || 0), 0),
        };
        
        weeklyData[weekKey].total = 
          weeklyData[weekKey].calls + 
          weeklyData[weekKey].emails + 
          weeklyData[weekKey].live_chat + 
          weeklyData[weekKey].escalations + 
          weeklyData[weekKey].qa_assessments + 
          weeklyData[weekKey].walk_ins;
      });
      
      formattedData = Object.values(weeklyData);
    } 
    else if (timeRange === 'monthly') {
      // Group by month and accumulate values
      const monthlyData: Record<string, any> = {};
      
      sortedData.forEach((stat, index) => {
        // Use the month's start date as the key
        const monthKey = stat.date;
        
        if (!monthlyData[monthKey]) {
          monthlyData[monthKey] = {
            date: monthKey,
            name: teamLeadName, // Replace date with team lead name
            calls: 0,
            emails: 0,
            live_chat: 0,
            escalations: 0,
            qa_assessments: 0,
            walk_ins: 0,
            total: 0
          };
        }
        
        // Add a rolling 30-day total for each date
        const last30Days = sortedData.slice(Math.max(0, index - 29), index + 1);
        
        monthlyData[monthKey] = {
          date: monthKey,
          name: teamLeadName, // Replace date with team lead name
          calls: last30Days.reduce((sum, d) => sum + (d.calls || 0), 0),
          emails: last30Days.reduce((sum, d) => sum + (d.emails || 0), 0),
          live_chat: last30Days.reduce((sum, d) => sum + (d.live_chat || 0), 0),
          escalations: last30Days.reduce((sum, d) => sum + (d.escalations || 0), 0),
          qa_assessments: last30Days.reduce((sum, d) => sum + (d.qa_assessments || 0), 0),
          walk_ins: last30Days.reduce((sum, d) => sum + (d.walk_ins || 0), 0),
        };
        
        monthlyData[monthKey].total = 
          monthlyData[monthKey].calls + 
          monthlyData[monthKey].emails + 
          monthlyData[monthKey].live_chat + 
          monthlyData[monthKey].escalations + 
          monthlyData[monthKey].qa_assessments + 
          monthlyData[monthKey].walk_ins;
      });
      
      formattedData = Object.values(monthlyData);
    }

    // Sort the processed data by date in descending order for display
    setProcessedData(formattedData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [data, timeRange, teamLeadName]);

  const toggleMetric = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      setVisibleMetrics(visibleMetrics.filter(m => m !== metric));
    } else {
      setVisibleMetrics([...visibleMetrics, metric]);
    }
  };

  // Calculate if the team lead is meeting targets
  const isTargetMet = () => {
    if (processedData.length === 0) return false;
    
    // Check the most recent data point against the target
    return processedData[0].total >= currentTarget;
  };

  const targetMet = isTargetMet();
  
  // Calculate percentage of target completion
  const calculateTargetPercentage = () => {
    if (processedData.length === 0) return 0;
    const latestTotal = processedData[0].total;
    return Math.min(Math.round((latestTotal / currentTarget) * 100), 100);
  };

  const targetPercentage = calculateTargetPercentage();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            Performance Bar - {teamLeadName}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
              <ToggleGroupItem value="daily" aria-label="Toggle daily view">
                Daily (Target: {DAILY_TARGET})
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Toggle weekly view">
                Weekly (Target: {timeRange === 'weekly' ? currentTarget : WEEKLY_TARGET})
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Toggle monthly view">
                Monthly (Target: {timeRange === 'monthly' ? currentTarget : MONTHLY_TARGET})
              </ToggleGroupItem>
            </ToggleGroup>

            <div className={`text-sm font-medium px-3 py-1 rounded-full ${targetMet ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
              {targetMet ? 'Target Met' : 'Target Not Met'}
            </div>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-2">
          {METRICS.map(metric => (
            <Button
              key={metric.key}
              variant={visibleMetrics.includes(metric.key) ? "default" : "outline"}
              size="sm"
              onClick={() => toggleMetric(metric.key)}
              style={{
                backgroundColor: visibleMetrics.includes(metric.key) ? metric.color : '',
                color: visibleMetrics.includes(metric.key) ? 'white' : '',
                borderColor: metric.color
              }}
            >
              {metric.name}
            </Button>
          ))}
        </div>
        
        {/* Target progress indicator */}
        <div className="mt-4">
          <div className="flex justify-between mb-1">
            <span className="text-sm font-medium">Target Progress ({targetPercentage}%)</span>
            <span className="text-sm font-medium">{currentTarget} items</span>
          </div>
          <Progress value={targetPercentage} className="h-2" />
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <BarChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-md shadow-md p-2">
                      <p className="font-semibold">{teamLeadName} - {label}</p>
                      {payload.map((entry) => (
                        <p key={entry.name} style={{ color: entry.color }}>
                          {entry.name}: {entry.value}
                        </p>
                      ))}
                      <p className="border-t mt-1 pt-1">
                        <span className="font-semibold">Target ({timeRange}):</span> {currentTarget}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            {/* Add reference line for current target */}
            <ReferenceLine 
              y={currentTarget} 
              label={{
                value: `${timeRange.charAt(0).toUpperCase() + timeRange.slice(1)} Target: ${currentTarget}`,
                position: 'insideTopRight',
                fill: 'red'
              }}
              stroke="red" 
              strokeDasharray="3 3" 
            />
            {METRICS.map(metric => (
              visibleMetrics.includes(metric.key) && (
                <Bar
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  fill={metric.color}
                  name={metric.name}
                />
              )
            ))}
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
