
import { StatCard } from "./StatCard";
import {
  ArrowUpRight, Phone, Mail, MessageSquare,
  Shield, ClipboardList, Calculator
} from "lucide-react";

interface StatsGridProps {
  totalStats: {
    calls: number;
    emails: number;
    live_chat: number;
    escalations: number;
    qa_assessments: number;
    survey_tickets: number;
  };
  statsCount: number;
}

export const StatsGrid = ({ totalStats, statsCount }: StatsGridProps) => {
  const totalIssuesHandled = 
    totalStats.calls + 
    totalStats.emails + 
    totalStats.live_chat + 
    totalStats.escalations + 
    totalStats.qa_assessments + 
    totalStats.survey_tickets;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
      <StatCard
        title="Calls"
        value={totalStats.calls}
        icon={<Phone className="w-5 h-5" />}
      />
      <StatCard
        title="Emails"
        value={totalStats.emails}
        icon={<Mail className="w-5 h-5" />}
      />
      <StatCard
        title="Live Chat"
        value={totalStats.live_chat}
        icon={<MessageSquare className="w-5 h-5" />}
      />
      <StatCard
        title="Escalations"
        value={totalStats.escalations}
        icon={<ArrowUpRight className="w-5 h-5" />}
      />
      <StatCard
        title="QA Assessments"
        value={totalStats.qa_assessments}
        icon={<Shield className="w-5 h-5" />}
      />
      <StatCard
        title="Survey Tickets"
        value={totalStats.survey_tickets}
        icon={<ClipboardList className="w-5 h-5" />}
      />
      <StatCard
        title="Total Issues Handled"
        value={totalIssuesHandled}
        icon={<Calculator className="w-5 h-5" />}
        highlight
      />
    </div>
  );
};
