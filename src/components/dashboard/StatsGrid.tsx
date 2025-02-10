
import { StatCard } from "./StatCard";
import {
  ArrowUpRight, BarChart3, Calendar, Mail, MessageSquare,
  Phone, Shield, Clock, Timer, AlertCircle, CheckCircle2
} from "lucide-react";

interface StatsGridProps {
  totalStats: {
    calls: number;
    emails: number;
    live_chat: number;
    escalations: number;
    qa_assessments: number;
    average_handling_time: number;
    average_wait_time: number;
    abandon_rate: number;
    sla_percentage: number;
  };
  statsCount: number;
}

export const StatsGrid = ({ totalStats, statsCount }: StatsGridProps) => {
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
        title="Average Handle Time"
        value={totalStats.average_handling_time / statsCount}
        suffix=" min"
        icon={<Clock className="w-5 h-5" />}
      />
      <StatCard
        title="Average Wait Time"
        value={totalStats.average_wait_time / statsCount}
        suffix=" min"
        icon={<Timer className="w-5 h-5" />}
      />
      <StatCard
        title="Abandon Rate"
        value={totalStats.abandon_rate / statsCount}
        suffix="%"
        icon={<AlertCircle className="w-5 h-5" />}
      />
      <StatCard
        title="SLA Percentage"
        value={totalStats.sla_percentage / statsCount}
        suffix="%"
        icon={<CheckCircle2 className="w-5 h-5" />}
        highlight
      />
    </div>
  );
};
