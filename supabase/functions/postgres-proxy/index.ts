
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { Client } from "https://deno.land/x/postgres@v0.17.0/mod.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, params } = await req.json()

    // Connect to your local PostgreSQL database
    const client = new Client({
      user: "cx_user",
      hostname: "10.169.39.64",
      database: "cx_dashboard_db",
      password: "@lquid#pass321",
      port: 5432,
    })

    await client.connect()

    const result = await client.queryObject(query, params)
    
    await client.end()

    return new Response(
      JSON.stringify({ data: result.rows, success: true }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Database error:', error)
    return new Response(
      JSON.stringify({ error: error.message, success: false }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})
