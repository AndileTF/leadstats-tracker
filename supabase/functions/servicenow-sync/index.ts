import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ServiceNowTicket {
  sys_id: string;
  number: string;
  opened_at: string;
  state: string;
  assigned_to: string;
  priority: string;
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const servicenowUrl = Deno.env.get('SERVICENOW_INSTANCE_URL');
    const servicenowUsername = Deno.env.get('SERVICENOW_USERNAME');
    const servicenowPassword = Deno.env.get('SERVICENOW_PASSWORD');

    if (!servicenowUrl || !servicenowUsername || !servicenowPassword) {
      throw new Error('ServiceNow credentials not configured');
    }

    console.log('Starting ServiceNow sync...');

    // Fetch tickets from ServiceNow using Basic Auth
    const authHeader = 'Basic ' + btoa(`${servicenowUsername}:${servicenowPassword}`);
    
    const response = await fetch(
      `${servicenowUrl}/api/now/table/incident?sysparm_limit=100&sysparm_query=active=true`,
      {
        headers: {
          'Authorization': authHeader,
          'Accept': 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new Error(`ServiceNow API error: ${response.statusText}`);
    }

    const data = await response.json();
    const tickets: ServiceNowTicket[] = data.result || [];

    console.log(`Fetched ${tickets.length} tickets from ServiceNow`);

    // Process and store tickets
    let recordsSynced = 0;
    
    for (const ticket of tickets) {
      // Map ServiceNow ticket to internal format
      // This is a basic example - customize based on your needs
      
      // You can insert into appropriate tables here
      // For example, creating daily stats or escalations based on ticket data
      
      recordsSynced++;
    }

    // Log sync result
    const { error: logError } = await supabaseClient
      .from('servicenow_sync_log')
      .insert({
        sync_date: new Date().toISOString(),
        records_synced: recordsSynced,
        status: 'success',
      });

    if (logError) {
      console.error('Error logging sync:', logError);
    }

    console.log(`Sync completed: ${recordsSynced} records processed`);

    return new Response(
      JSON.stringify({
        success: true,
        records_synced: recordsSynced,
        message: 'ServiceNow sync completed successfully',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('ServiceNow sync error:', error);

    // Log failed sync
    try {
      const supabaseClient = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      await supabaseClient
        .from('servicenow_sync_log')
        .insert({
          sync_date: new Date().toISOString(),
          records_synced: 0,
          status: 'failed',
          error_message: error.message,
        });
    } catch (logError) {
      console.error('Error logging failed sync:', logError);
    }

    return new Response(
      JSON.stringify({
        success: false,
        error: error.message,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
