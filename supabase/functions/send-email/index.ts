// Supabase Edge Function for sending transactional emails via Brevo
// Deploy with: supabase functions deploy send-email --no-verify-jwt

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

interface EmailPayload {
  to: string
  toName?: string
  subject: string
  htmlContent: string
  params?: Record<string, string>
}

interface BrevoResponse {
  messageId?: string
  code?: string
  message?: string
}

const BREVO_API_KEY = Deno.env.get('BREVO_API_KEY') || ''
const BREVO_SENDER_EMAIL = Deno.env.get('BREVO_SENDER_EMAIL') || ''
const BREVO_SENDER_NAME = Deno.env.get('BREVO_SENDER_NAME') || 'CalorieTracker'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }

  try {
    const payload: EmailPayload = await req.json()

    if (!payload.to || !payload.subject || !payload.htmlContent) {
      return new Response(JSON.stringify({ error: 'Missing required fields: to, subject, htmlContent' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    if (!BREVO_API_KEY) {
      return new Response(JSON.stringify({ error: 'Brevo API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const brevoResponse = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': BREVO_API_KEY,
      },
      body: JSON.stringify({
        sender: {
          email: BREVO_SENDER_EMAIL,
          name: BREVO_SENDER_NAME,
        },
        to: [
          {
            email: payload.to,
            name: payload.toName || payload.to,
          },
        ],
        subject: payload.subject,
        htmlContent: payload.htmlContent,
        params: payload.params || {},
      }),
    })

    const result: BrevoResponse = await brevoResponse.json()

    if (!brevoResponse.ok) {
      console.error('Brevo API error:', result)
      return new Response(JSON.stringify({
        success: false,
        error: result.message || 'Failed to send email',
        code: result.code,
      }), {
        status: brevoResponse.status,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    console.log(`Email sent to ${payload.to}: ${payload.subject} (ID: ${result.messageId})`)

    return new Response(JSON.stringify({
      success: true,
      messageId: result.messageId,
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  } catch (error) {
    console.error('Send email error:', error)
    return new Response(JSON.stringify({
      success: false,
      error: error instanceof Error ? error.message : 'Internal server error',
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
