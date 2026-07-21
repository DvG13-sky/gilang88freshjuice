import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const supabaseUrl = Deno.env.get('SUPABASE_URL') || 'https://dwxbtedloguqgpsyahjc.supabase.co';
const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';
const vapidPrivateKey = Deno.env.get('VAPID_PRIVATE_KEY') || '';
const vapidPublicKey = Deno.env.get('VAPID_PUBLIC_KEY') || 'BAPUe4B8WVjazZ4G8ukncjsmrZkh-6nWjW-RXyubZp6a5ZxFXH_2Arm8IxQ4weDY2POsRasSLQjUOWSOjQ5iYN8';
const vapidSubject = Deno.env.get('VAPID_SUBJECT') || 'mailto:admin@gilangfreshjuice.com';

const supabase = createClient(supabaseUrl, supabaseKey);

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  try {
    const { user_id, title, body, data, tag = 'default' } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: 'user_id required' }), { 
        status: 400,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('push_subscription')
      .eq('id', user_id)
      .single();

    if (error || !profile?.push_subscription) {
      return new Response(JSON.stringify({ error: 'No push subscription' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    // Send push via Web Push Protocol
    const subscription = profile.push_subscription;
    const endpoint = subscription.endpoint;
    const keys = subscription.keys;

    // Simple payload
    const payload = JSON.stringify({
      title,
      body,
      data: { ...data, url: data?.url || '/' },
      tag,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-72x72.png',
      requireInteraction: tag === 'stock_out',
    });

    // For MVP, we'll use a simpler approach
    // In production, implement proper VAPID JWT signing
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        'TTL': '60',
      },
      body: payload,
    });

    if (response.status === 410) {
      await supabase.from('profiles').update({ push_subscription: null }).eq('id', user_id);
      return new Response(JSON.stringify({ error: 'Subscription expired' }), {
        status: 410,
        headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });

  } catch (err: any) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' },
    });
  }
});
