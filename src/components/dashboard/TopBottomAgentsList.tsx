import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, Users, Phone, Mail, MessageCircle, AlertTriangle, ClipboardCheck, MapPin } from "lucide-react";
import { AgentRanking } from "@/types/agentPerformance";

interface TopBottomAgentsListProps {
  topAgents: AgentRanking[];
  bottomAgents: AgentRanking[];
  isLoading?: boolean;
}

export const TopBottomAgentsList = ({ topAgents, bottomAgents, isLoading }: TopBottomAgentsListProps) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-500" />
              Top 5 Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-500" />
              Bottom 5 Performers
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[...Array(5)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="h-16 bg-muted rounded"></div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const StatBadge = ({ icon: Icon, value, label, color }: { 
    icon: any, value: number, label: string, color?: string 
  }) => (
    <div className={`flex items-center gap-1 px-2 py-1 rounded text-xs ${color || 'bg-muted'}`}>
      <Icon className="h-3 w-3" />
      <span className="font-medium">{value}</span>
      <span className="text-muted-foreground">{label}</span>
    </div>
  );

  const AgentCard = ({ agent, rank, isTop }: { agent: AgentRanking, rank: number, isTop: boolean }) => (
    <div className={`p-4 rounded-lg border ${isTop ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
      <div className="flex justify-between items-start mb-3">
        <div>
          <div className="flex items-center gap-2">
            <Badge variant={isTop ? "default" : "destructive"} className="text-xs">
              #{rank}
            </Badge>
            <h4 className="font-semibold text-sm">{agent.agent_name}</h4>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Efficiency Score: {agent.efficiency_score.toFixed(1)}
          </p>
        </div>
        <div className="text-right">
          <p className="text-xs text-muted-foreground">Customer Satisfaction</p>
          <p className="font-bold text-sm">{agent.avg_customer_satisfaction.toFixed(1)}/5</p>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-2">
        <StatBadge icon={Phone} value={agent.total_calls} label="calls" />
        <StatBadge icon={Mail} value={agent.total_emails} label="emails" />
        <StatBadge icon={MessageCircle} value={agent.total_live_chat} label="chats" />
        <StatBadge icon={AlertTriangle} value={agent.total_escalations} label="esc." color="bg-orange-100 text-orange-700" />
        <StatBadge icon={ClipboardCheck} value={agent.total_qa_assessments} label="QA" />
        <StatBadge icon={MapPin} value={agent.total_walk_ins} label="walk-ins" />
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-500" />
            Top 5 Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {topAgents.length > 0 ? (
              topAgents.map((agent, index) => (
                <AgentCard 
                  key={agent.agent_id} 
                  agent={agent} 
                  rank={index + 1} 
                  isTop={true} 
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-500" />
            Bottom 5 Performers
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {bottomAgents.length > 0 ? (
              bottomAgents.map((agent, index) => (
                <AgentCard 
                  key={agent.agent_id} 
                  agent={agent} 
                  rank={topAgents.length + bottomAgents.length - index} 
                  isTop={false} 
                />
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Users className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No performance data available</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};