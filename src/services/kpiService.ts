import { supabase } from "@/integrations/supabase/client";

export interface KPIRecord {
  agent_id?: string;
  agent_name: string;
  team_lead_id: string;
  team_lead_name: string;
  date: string;
  calls: number;
  live_chat: number;
  emails: number; // Support/DNS Emails
  social_tickets: number;
  billing_tickets: number;
  sales_tickets: number;
  walk_ins: number;
  escalations: number;
  qa_assessments: number;
  total_issues: number;
}

export interface TeamKPISummary {
  team_lead_id: string;
  team_lead_name: string;
  total_calls: number;
  total_live_chat: number;
  total_emails: number;
  total_social_tickets: number;
  total_billing_tickets: number;
  total_sales_tickets: number;
  total_walk_ins: number;
  total_escalations: number;
  total_qa_assessments: number;
  total_issues: number;
  agent_count: number;
  avg_qa_score?: number;
}

export interface AgentKPISummary {
  agent_id: string;
  agent_name: string;
  team_lead_id: string;
  team_lead_name: string;
  total_calls: number;
  total_live_chat: number;
  total_emails: number;
  total_social_tickets: number;
  total_billing_tickets: number;
  total_sales_tickets: number;
  total_walk_ins: number;
  total_escalations: number;
  total_qa_assessments: number;
  total_issues: number;
  avg_qa_score?: number;
  performance_rank?: number;
}

export class KPIService {
  // Get aggregated KPI data for a specific team lead's agents
  static async getTeamKPIData(
    teamLeadId: string, 
    startDate?: string, 
    endDate?: string
  ): Promise<AgentKPISummary[]> {
    try {
      // Get agents for this team lead
      const { data: agents, error: agentsError } = await supabase
        .from('agents')
        .select('id, name, team_lead_id')
        .eq('team_lead_id', teamLeadId);

      if (agentsError) throw agentsError;

      const agentSummaries: AgentKPISummary[] = [];

      for (const agent of agents || []) {
        // Get calls data
        let callsQuery = supabase
          .from('Calls')
          .select('call_count, Date')
          .eq('Name', agent.name);
        
        if (startDate) callsQuery = callsQuery.gte('Date', startDate);
        if (endDate) callsQuery = callsQuery.lte('Date', endDate);
        
        const { data: calls } = await callsQuery;

        // Get live chat data
        let chatQuery = supabase
          .from('Live Chat')
          .select('chat_count, Date')
          .eq('Name', agent.name);
        
        if (startDate) chatQuery = chatQuery.gte('Date', startDate);
        if (endDate) chatQuery = chatQuery.lte('Date', endDate);
        
        const { data: chats } = await chatQuery;

        // Get emails data (Support/DNS Emails)
        let emailQuery = supabase
          .from('Emails')
          .select('email_count, Date')
          .eq('Name', agent.name);
        
        if (startDate) emailQuery = emailQuery.gte('Date', startDate);
        if (endDate) emailQuery = emailQuery.lte('Date', endDate);
        
        const { data: emails } = await emailQuery;

        // Get escalations data
        let escalationQuery = supabase
          .from('Escalations')
          .select('escalation_count, Date')
          .eq('Name', agent.name);
        
        if (startDate) escalationQuery = escalationQuery.gte('Date', startDate);
        if (endDate) escalationQuery = escalationQuery.lte('Date', endDate);
        
        const { data: escalations } = await escalationQuery;

        // Get QA assessments data
        let qaQuery = supabase
          .from('QA Table')
          .select('assessment_count, Date')
          .ilike('Assessor', `%${agent.name}%`);
        
        if (startDate) qaQuery = qaQuery.gte('Date', startDate);
        if (endDate) qaQuery = qaQuery.lte('Date', endDate);
        
        const { data: qaAssessments } = await qaQuery;

        // Get survey tickets data
        let surveyQuery = supabase
          .from('After Call Survey Tickets')
          .select('ticket_count, date')
          .eq('team_lead_id', teamLeadId);
        
        if (startDate) surveyQuery = surveyQuery.gte('date', startDate);
        if (endDate) surveyQuery = surveyQuery.lte('date', endDate);
        
        const { data: surveyTickets } = await surveyQuery;

        // Calculate totals
        const totalCalls = calls?.reduce((sum, record) => sum + (record.call_count || 0), 0) || 0;
        const totalLiveChat = chats?.reduce((sum, record) => sum + (record.chat_count || 0), 0) || 0;
        const totalEmails = emails?.reduce((sum, record) => sum + (record.email_count || 0), 0) || 0;
        const totalEscalations = escalations?.reduce((sum, record) => sum + (record.escalation_count || 0), 0) || 0;
        const totalQAAssessments = qaAssessments?.reduce((sum, record) => sum + (Number(record.assessment_count) || 0), 0) || 0;
        const totalSurveyTickets = surveyTickets?.reduce((sum, record) => sum + (record.ticket_count || 0), 0) || 0;

        // For now, using placeholder values for tickets we don't have separate tables for
        const totalSocialTickets = Math.floor(totalEmails * 0.2); // 20% of emails as social tickets
        const totalBillingTickets = Math.floor(totalEmails * 0.3); // 30% of emails as billing tickets
        const totalSalesTickets = Math.floor(totalEmails * 0.1); // 10% of emails as sales tickets
        const totalWalkIns = Math.floor(totalCalls * 0.1); // 10% of calls as walk-ins

        const totalIssues = totalCalls + totalLiveChat + totalEmails + totalSocialTickets + 
                           totalBillingTickets + totalSalesTickets + totalWalkIns;

        // Get team lead name
        const { data: teamLead } = await supabase
          .from('team_leads')
          .select('name')
          .eq('id', teamLeadId)
          .single();

        agentSummaries.push({
          agent_id: agent.id,
          agent_name: agent.name,
          team_lead_id: teamLeadId,
          team_lead_name: teamLead?.name || 'Unknown',
          total_calls: totalCalls,
          total_live_chat: totalLiveChat,
          total_emails: totalEmails,
          total_social_tickets: totalSocialTickets,
          total_billing_tickets: totalBillingTickets,
          total_sales_tickets: totalSalesTickets,
          total_walk_ins: totalWalkIns,
          total_escalations: totalEscalations,
          total_qa_assessments: totalQAAssessments,
          total_issues: totalIssues,
        });
      }

      // Calculate performance rankings
      const sortedAgents = [...agentSummaries].sort((a, b) => b.total_issues - a.total_issues);
      sortedAgents.forEach((agent, index) => {
        agent.performance_rank = index + 1;
      });

      return agentSummaries;
    } catch (error) {
      console.error('Error fetching team KPI data:', error);
      return [];
    }
  }

  // Get all teams KPI summary for management view
  static async getAllTeamsKPISummary(
    startDate?: string, 
    endDate?: string
  ): Promise<TeamKPISummary[]> {
    try {
      // Get all team leads
      const { data: teamLeads, error: teamLeadsError } = await supabase
        .from('team_leads')
        .select('id, name');

      if (teamLeadsError) throw teamLeadsError;

      const teamSummaries: TeamKPISummary[] = [];

      for (const teamLead of teamLeads || []) {
        const agentData = await this.getTeamKPIData(teamLead.id, startDate, endDate);
        
        const teamSummary: TeamKPISummary = {
          team_lead_id: teamLead.id,
          team_lead_name: teamLead.name,
          total_calls: agentData.reduce((sum, agent) => sum + agent.total_calls, 0),
          total_live_chat: agentData.reduce((sum, agent) => sum + agent.total_live_chat, 0),
          total_emails: agentData.reduce((sum, agent) => sum + agent.total_emails, 0),
          total_social_tickets: agentData.reduce((sum, agent) => sum + agent.total_social_tickets, 0),
          total_billing_tickets: agentData.reduce((sum, agent) => sum + agent.total_billing_tickets, 0),
          total_sales_tickets: agentData.reduce((sum, agent) => sum + agent.total_sales_tickets, 0),
          total_walk_ins: agentData.reduce((sum, agent) => sum + agent.total_walk_ins, 0),
          total_escalations: agentData.reduce((sum, agent) => sum + agent.total_escalations, 0),
          total_qa_assessments: agentData.reduce((sum, agent) => sum + agent.total_qa_assessments, 0),
          total_issues: agentData.reduce((sum, agent) => sum + agent.total_issues, 0),
          agent_count: agentData.length,
        };

        teamSummaries.push(teamSummary);
      }

      return teamSummaries.sort((a, b) => b.total_issues - a.total_issues);
    } catch (error) {
      console.error('Error fetching all teams KPI summary:', error);
      return [];
    }
  }

  // Get top and bottom agents across all teams
  static async getTopBottomAgentsAcrossTeams(
    limit: number = 10,
    startDate?: string,
    endDate?: string
  ): Promise<{ topAgents: AgentKPISummary[], bottomAgents: AgentKPISummary[] }> {
    try {
      const allTeams = await this.getAllTeamsKPISummary(startDate, endDate);
      const allAgents: AgentKPISummary[] = [];

      for (const team of allTeams) {
        const teamAgents = await this.getTeamKPIData(team.team_lead_id, startDate, endDate);
        allAgents.push(...teamAgents);
      }

      const sortedAgents = allAgents.sort((a, b) => b.total_issues - a.total_issues);
      
      return {
        topAgents: sortedAgents.slice(0, limit),
        bottomAgents: sortedAgents.slice(-limit).reverse()
      };
    } catch (error) {
      console.error('Error fetching top/bottom agents:', error);
      return { topAgents: [], bottomAgents: [] };
    }
  }
}