import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface SendAlertPayload {
  to: string[];
  message: string;
  channel: 'sms' | 'whatsapp';
  senderId: string;
}

serve(async (req: Request) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: CORS });
  }

  try {
    const TWILIO_SID = Deno.env.get('TWILIO_ACCOUNT_SID') ?? '';
    const TWILIO_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN') ?? '';
    const TWILIO_FROM = Deno.env.get('TWILIO_FROM_NUMBER') ?? '';

    if (!TWILIO_SID || !TWILIO_TOKEN || !TWILIO_FROM) {
      return new Response(
        JSON.stringify({ error: 'Twilio credentials not configured' }),
        { status: 503, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const { to, message, channel, senderId } = await req.json() as SendAlertPayload;

    if (!to?.length || !message || !channel) {
      return new Response(
        JSON.stringify({ error: 'to, message and channel are required' }),
        { status: 400, headers: { ...CORS, 'Content-Type': 'application/json' } },
      );
    }

    const base64Creds = btoa(`${TWILIO_SID}:${TWILIO_TOKEN}`);
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;

    let successCount = 0;
    let failCount = 0;

    for (const recipient of to) {
      const toNumber = channel === 'whatsapp' ? `whatsapp:${recipient}` : recipient;
      const fromNumber = channel === 'whatsapp' ? `whatsapp:${TWILIO_FROM}` : TWILIO_FROM;

      const body = new URLSearchParams({
        To: toNumber,
        From: fromNumber,
        Body: message,
      });

      const res = await fetch(twilioUrl, {
        method: 'POST',
        headers: {
          Authorization: `Basic ${base64Creds}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: body.toString(),
      });

      if (res.ok) {
        successCount++;
      } else {
        failCount++;
        const err = await res.text();
        console.error(`Failed to send to ${recipient}:`, err);
      }
    }

    // Log to broadcast_log
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    if (supabaseUrl && supabaseKey) {
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from('broadcast_log').insert({
        sender_id: senderId,
        recipients_count: to.length,
        message,
        channel,
        status: failCount === 0 ? 'sent' : successCount > 0 ? 'sent' : 'failed',
      });
    }

    return new Response(
      JSON.stringify({ success: successCount, failed: failCount }),
      { headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: msg }),
      { status: 500, headers: { ...CORS, 'Content-Type': 'application/json' } },
    );
  }
});
