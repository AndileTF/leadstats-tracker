
import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { ArrowUpRight, BarChart3, Mail, MessageSquare, Phone, Shield } from "lucide-react";

interface TeamLeadStats {
  calls: number;
  emails: number;
  liveChat: number;
  escalations: number;
  qaAssessments: number;
}

const initialStats: TeamLeadStats = {
  calls: 0,
  emails: 0,
  liveChat: 0,
  escalations: 0,
  qaAssessments: 0,
};

const Index = () => {
  const [showForm, setShowForm] = useState(false);
  const [stats, setStats] = useState<TeamLeadStats>(initialStats);
  const [dailyStats, setDailyStats] = useState<TeamLeadStats[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDailyStats([...dailyStats, stats]);
    setStats(initialStats);
    setShowForm(false);
    toast({
      title: "Stats Added",
      description: "Daily stats have been successfully recorded.",
    });
  };

  const totalStats = dailyStats.reduce((acc, curr) => ({
    calls: acc.calls + curr.calls,
    emails: acc.emails + curr.emails,
    liveChat: acc.liveChat + curr.liveChat,
    escalations: acc.escalations + curr.escalations,
    qaAssessments: acc.qaAssessments + curr.qaAssessments,
  }), initialStats);

  return (
    <div className="min-h-screen p-6 animate-fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Team Lead Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Track and analyze your team's performance metrics</p>
          </div>
          <Button 
            onClick={() => setShowForm(!showForm)}
            className="bg-primary/20 hover:bg-primary/30 text-primary"
          >
            {showForm ? 'Close Form' : 'Add Daily Stats'}
          </Button>
        </div>

        {showForm && (
          <Card className="glass-card p-6 animate-scale-in">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Calls</label>
                  <Input
                    type="number"
                    value={stats.calls}
                    onChange={(e) => setStats({ ...stats, calls: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Emails</label>
                  <Input
                    type="number"
                    value={stats.emails}
                    onChange={(e) => setStats({ ...stats, emails: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Live Chat</label>
                  <Input
                    type="number"
                    value={stats.liveChat}
                    onChange={(e) => setStats({ ...stats, liveChat: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">Escalations</label>
                  <Input
                    type="number"
                    value={stats.escalations}
                    onChange={(e) => setStats({ ...stats, escalations: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm text-muted-foreground">QA Assessments</label>
                  <Input
                    type="number"
                    value={stats.qaAssessments}
                    onChange={(e) => setStats({ ...stats, qaAssessments: parseInt(e.target.value) || 0 })}
                    className="form-input"
                    min="0"
                  />
                </div>
              </div>
              <Button type="submit" className="w-full bg-primary/20 hover:bg-primary/30 text-primary">
                Submit Daily Stats
              </Button>
            </form>
          </Card>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
            value={totalStats.liveChat}
            icon={<MessageSquare className="w-5 h-5" />}
          />
          <StatCard
            title="Escalations"
            value={totalStats.escalations}
            icon={<ArrowUpRight className="w-5 h-5" />}
          />
          <StatCard
            title="QA Assessments"
            value={totalStats.qaAssessments}
            icon={<Shield className="w-5 h-5" />}
          />
          <StatCard
            title="Total Interactions"
            value={totalStats.calls + totalStats.emails + totalStats.liveChat}
            icon={<BarChart3 className="w-5 h-5" />}
            highlight
          />
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ 
  title, 
  value, 
  icon, 
  highlight = false 
}: { 
  title: string; 
  value: number; 
  icon: React.ReactNode;
  highlight?: boolean;
}) => (
  <Card className={`stat-card ${highlight ? 'border-primary/30 bg-primary/5' : ''}`}>
    <div className="flex justify-between items-start mb-4">
      <p className="text-muted-foreground font-medium">{title}</p>
      <div className="p-2 rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
    </div>
    <div className="flex items-end justify-between">
      <h3 className="text-3xl font-bold animated-number">
        {value.toLocaleString()}
      </h3>
      <div className="flex items-center text-green-400 text-sm">
        <span className="ml-1">Today</span>
      </div>
    </div>
  </Card>
);

export default Index;
