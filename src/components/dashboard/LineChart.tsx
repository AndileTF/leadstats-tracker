
import { useState, useEffect } from 'react';
import { LineChart as RechartsLineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DailyStats } from "@/types/teamLead";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";

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
  { key: 'survey_tickets', name: 'Survey Tickets', color: '#d62728' },
];

// Target constants
const TARGETS = {
  daily: 20,
  weekly: 120,
  monthly: 480
};

type TimeRange = 'daily' | 'weekly' | 'monthly';

export const LineChart = ({ data, teamLeadName }: LineChartProps) => {
  const [visibleMetrics, setVisibleMetrics] = useState(METRICS.map(m => m.key));
  const [timeRange, setTimeRange] = useState<TimeRange>('daily');
  const [processedData, setProcessedData] = useState<any[]>([]);

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
        calls: stat.calls || 0,
        emails: stat.emails || 0,
        live_chat: stat.live_chat || 0,
        escalations: stat.escalations || 0,
        qa_assessments: stat.qa_assessments || 0,
        survey_tickets: stat.survey_tickets || 0,
        total: (stat.calls || 0) + (stat.emails || 0) + (stat.live_chat || 0) + 
               (stat.escalations || 0) + (stat.qa_assessments || 0) + (stat.survey_tickets || 0)
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
            calls: 0,
            emails: 0,
            live_chat: 0,
            escalations: 0,
            qa_assessments: 0,
            survey_tickets: 0,
            total: 0
          };
        }
        
        // Add a rolling 7-day total for each date
        const last7Days = sortedData.slice(Math.max(0, index - 6), index + 1);
        
        weeklyData[weekKey] = {
          date: weekKey,
          calls: last7Days.reduce((sum, d) => sum + (d.calls || 0), 0),
          emails: last7Days.reduce((sum, d) => sum + (d.emails || 0), 0),
          live_chat: last7Days.reduce((sum, d) => sum + (d.live_chat || 0), 0),
          escalations: last7Days.reduce((sum, d) => sum + (d.escalations || 0), 0),
          qa_assessments: last7Days.reduce((sum, d) => sum + (d.qa_assessments || 0), 0),
          survey_tickets: last7Days.reduce((sum, d) => sum + (d.survey_tickets || 0), 0),
        };
        
        weeklyData[weekKey].total = 
          weeklyData[weekKey].calls + 
          weeklyData[weekKey].emails + 
          weeklyData[weekKey].live_chat + 
          weeklyData[weekKey].escalations + 
          weeklyData[weekKey].qa_assessments + 
          weeklyData[weekKey].survey_tickets;
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
            calls: 0,
            emails: 0,
            live_chat: 0,
            escalations: 0,
            qa_assessments: 0,
            survey_tickets: 0,
            total: 0
          };
        }
        
        // Add a rolling 30-day total for each date
        const last30Days = sortedData.slice(Math.max(0, index - 29), index + 1);
        
        monthlyData[monthKey] = {
          date: monthKey,
          calls: last30Days.reduce((sum, d) => sum + (d.calls || 0), 0),
          emails: last30Days.reduce((sum, d) => sum + (d.emails || 0), 0),
          live_chat: last30Days.reduce((sum, d) => sum + (d.live_chat || 0), 0),
          escalations: last30Days.reduce((sum, d) => sum + (d.escalations || 0), 0),
          qa_assessments: last30Days.reduce((sum, d) => sum + (d.qa_assessments || 0), 0),
          survey_tickets: last30Days.reduce((sum, d) => sum + (d.survey_tickets || 0), 0),
        };
        
        monthlyData[monthKey].total = 
          monthlyData[monthKey].calls + 
          monthlyData[monthKey].emails + 
          monthlyData[monthKey].live_chat + 
          monthlyData[monthKey].escalations + 
          monthlyData[monthKey].qa_assessments + 
          monthlyData[monthKey].survey_tickets;
      });
      
      formattedData = Object.values(monthlyData);
    }

    // Sort the processed data by date in descending order for display
    setProcessedData(formattedData.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    ));
  }, [data, timeRange]);

  const toggleMetric = (metric: string) => {
    if (visibleMetrics.includes(metric)) {
      setVisibleMetrics(visibleMetrics.filter(m => m !== metric));
    } else {
      setVisibleMetrics([...visibleMetrics, metric]);
    }
  };

  // Get the current target based on selected time range
  const currentTarget = TARGETS[timeRange];

  // Calculate if the team lead is meeting targets
  const isTargetMet = () => {
    if (processedData.length === 0) return false;
    
    // Check the most recent data point against the target
    return processedData[0].total >= currentTarget;
  };

  const targetMet = isTargetMet();

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <CardTitle className="text-xl font-semibold">
            Performance Trends - {teamLeadName}
          </CardTitle>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <ToggleGroup type="single" value={timeRange} onValueChange={(value) => value && setTimeRange(value as TimeRange)}>
              <ToggleGroupItem value="daily" aria-label="Toggle daily view">
                Daily (Target: {TARGETS.daily})
              </ToggleGroupItem>
              <ToggleGroupItem value="weekly" aria-label="Toggle weekly view">
                Weekly (Target: {TARGETS.weekly})
              </ToggleGroupItem>
              <ToggleGroupItem value="monthly" aria-label="Toggle monthly view">
                Monthly (Target: {TARGETS.monthly})
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
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={400}>
          <RechartsLineChart data={processedData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="bg-background border rounded-md shadow-md p-2">
                      <p className="font-semibold">{label}</p>
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
                <Line
                  key={metric.key}
                  type="monotone"
                  dataKey={metric.key}
                  stroke={metric.color}
                  name={metric.name}
                  activeDot={{ r: 8 }}
                />
              )
            ))}
          </RechartsLineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
};
