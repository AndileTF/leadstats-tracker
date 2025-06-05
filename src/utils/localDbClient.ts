
export class LocalDbClient {
  private async executeQuery(query: string, params: any[] = []) {
    try {
      const response = await fetch('/api/postgres-proxy', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query, params })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      if (!data.success) throw new Error(data.error);

      return data.data;
    } catch (error) {
      console.error('Local DB query error:', error);
      throw error;
    }
  }

  async getTeamLeads() {
    return this.executeQuery('SELECT * FROM team_leads ORDER BY name');
  }

  async getDailyStats(teamLeadId?: string) {
    let query = 'SELECT * FROM daily_stats';
    let params: any[] = [];
    
    if (teamLeadId) {
      query += ' WHERE team_lead_id = $1';
      params = [teamLeadId];
    }
    
    query += ' ORDER BY date DESC';
    return this.executeQuery(query, params);
  }

  async getCalls(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "Calls"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('"Date" >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('"Date" <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY "Date" DESC';
    return this.executeQuery(query, params);
  }

  async getEmails(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "Emails"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('"Date" >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('"Date" <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY "Date" DESC';
    return this.executeQuery(query, params);
  }

  async getLiveChat(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "Live Chat"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('"Date" >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('"Date" <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY "Date" DESC';
    return this.executeQuery(query, params);
  }

  async getEscalations(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "Escalations"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('"Date" >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('"Date" <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY "Date" DESC';
    return this.executeQuery(query, params);
  }

  async getQAAssessments(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "QA Table"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('"Date" >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('"Date" <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY "Date" DESC';
    return this.executeQuery(query, params);
  }

  async getSurveyTickets(teamLeadId?: string, startDate?: string, endDate?: string) {
    let query = 'SELECT * FROM "After Call Survey Tickets"';
    let params: any[] = [];
    let whereConditions: string[] = [];
    
    if (teamLeadId) {
      whereConditions.push('team_lead_id = $' + (params.length + 1));
      params.push(teamLeadId);
    }
    
    if (startDate) {
      whereConditions.push('date >= $' + (params.length + 1));
      params.push(startDate);
    }
    
    if (endDate) {
      whereConditions.push('date <= $' + (params.length + 1));
      params.push(endDate);
    }
    
    if (whereConditions.length > 0) {
      query += ' WHERE ' + whereConditions.join(' AND ');
    }
    
    query += ' ORDER BY date DESC';
    return this.executeQuery(query, params);
  }

  async insertStats(teamLeadId: string, stats: any) {
    const currentDate = new Date().toISOString().split('T')[0];
    
    // Get team lead name
    const teamLeadResult = await this.executeQuery(
      'SELECT name FROM team_leads WHERE id = $1',
      [teamLeadId]
    );
    
    if (!teamLeadResult.length) {
      throw new Error('Team lead not found');
    }
    
    const teamLeadName = teamLeadResult[0].name;
    const insertPromises = [];

    // Insert into individual tables based on the stats provided
    if (stats.calls > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "Calls" ("Date", team_lead_id, call_count, "Name") VALUES ($1, $2, $3, $4)',
          [currentDate, teamLeadId, stats.calls, teamLeadName]
        )
      );
    }

    if (stats.emails > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "Emails" ("Date", team_lead_id, email_count, "Name") VALUES ($1, $2, $3, $4)',
          [currentDate, teamLeadId, stats.emails, teamLeadName]
        )
      );
    }

    if (stats.live_chat > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "Live Chat" ("Date", team_lead_id, chat_count, "Name") VALUES ($1, $2, $3, $4)',
          [currentDate, teamLeadId, stats.live_chat, teamLeadName]
        )
      );
    }

    if (stats.escalations > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "Escalations" ("Date", team_lead_id, escalation_count, "Name") VALUES ($1, $2, $3, $4)',
          [currentDate, teamLeadId, stats.escalations, teamLeadName]
        )
      );
    }

    if (stats.qa_assessments > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "QA Table" ("Date", team_lead_id, assessment_count, "Assessor") VALUES ($1, $2, $3, $4)',
          [currentDate, teamLeadId, stats.qa_assessments, teamLeadName]
        )
      );
    }

    if (stats.survey_tickets > 0) {
      insertPromises.push(
        this.executeQuery(
          'INSERT INTO "After Call Survey Tickets" (date, team_lead_id, ticket_count) VALUES ($1, $2, $3)',
          [currentDate, teamLeadId, stats.survey_tickets]
        )
      );
    }

    await Promise.all(insertPromises);
  }
}

export const localDbClient = new LocalDbClient();
