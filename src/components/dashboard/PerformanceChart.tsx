
import { TeamLeadOverview } from "@/types/teamLead";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface PerformanceChartProps {
  data: TeamLeadOverview[];
}

/**
 * PerformanceChart component displays team performance metrics in a bar chart
 * @param data - Array of team lead overview data
 */
export const PerformanceChart = ({ data }: PerformanceChartProps) => {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Performance Metrics Chart</h2>
      <ResponsiveContainer width="100%" height={400}>
        <BarChart data={data}>
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
  );
};
