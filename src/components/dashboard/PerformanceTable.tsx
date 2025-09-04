
import { TeamLeadOverview } from "@/types/teamLead";

interface PerformanceTableProps {
  data: TeamLeadOverview[];
}

/**
 * Calculates total issues handled for a team lead
 * @param item - Team lead overview data
 * @returns Total number of issues handled
 */
const getTotalIssuesHandled = (item: TeamLeadOverview) => {
  return (item.total_calls || 0) + 
         (item.total_emails || 0) + 
         (item.total_live_chat || 0) + 
         (item.total_escalations || 0) + 
         (item.total_qa_assessments || 0) + 
         (item.total_walk_ins || 0);
};

/**
 * PerformanceTable component displays team performance metrics in a table
 * @param data - Array of team lead overview data
 */
export const PerformanceTable = ({ data }: PerformanceTableProps) => {
  return (
    <div>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Walk-ins</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">Total Issues Handled</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {data.map((item) => (
              <tr key={item.name} className="hover:bg-gray-800/50">
                <td className="px-6 py-4 whitespace-nowrap">{item.name}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_calls?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_emails?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_live_chat?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_escalations?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_qa_assessments?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{item.total_walk_ins?.toLocaleString() ?? 0}</td>
                <td className="px-6 py-4 whitespace-nowrap">{getTotalIssuesHandled(item).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
