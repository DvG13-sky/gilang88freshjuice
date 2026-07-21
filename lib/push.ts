import { supabase } from './supabase/client';

// Ambil dari env — jangan hardcode di source code
const VAPID_PUBLIC_KEY =
  process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ||
  'BAPUe4B8WVjazZ4G8ukncjsmrZkh-6nWjW-RXyubZp6a5ZxFXH_2Arm8IxQ4weDY2POsRasSLQjUOWSOjQ5iYN8';

function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

export async function subscribePush(userId: string): Promise<boolean> {
  console.log('[Push] subscribePush called for userId:', userId);

  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    console.error('[Push] Push not supported on this browser');
    return false;
  }
  console.log('[Push] Browser supports ServiceWorker & PushManager ✓');

  try {
    const permission = await Notification.requestPermission();
    console.log('[Push] Notification permission:', permission);
    if (permission !== 'granted') {
      console.warn('[Push] Permission denied by user');
      return false;
    }

    console.log('[Push] Waiting for ServiceWorker to be ready...');
    const registration = await navigator.serviceWorker.ready;
    console.log('[Push] ServiceWorker ready ✓, scope:', registration.scope);

    let subscription = await registration.pushManager.getSubscription();
    console.log('[Push] Existing subscription:', subscription ? 'found' : 'none');

    if (!subscription) {
      console.log('[Push] Creating new subscription with VAPID key...');
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
      });
      console.log('[Push] Subscription created ✓:', subscription.endpoint);
    } else {
      console.log('[Push] Reusing existing subscription:', subscription.endpoint);
    }

    const subscriptionJSON = subscription.toJSON();
    console.log('[Push] Saving subscription to Supabase for userId:', userId);

    const { error } = await supabase
      .from('profiles')
      .update({ push_subscription: subscriptionJSON })
      .eq('id', userId);

    if (error) {
      console.error('[Push] Failed to save subscription to Supabase:', error.message, error.details);
      return false;
    }

    console.log('[Push] Subscription saved to Supabase ✓');
    return true;
  } catch (err) {
    console.error('[Push] Push subscription failed:', err);
    return false;
  }
}

export async function unsubscribePush(userId: string): Promise<boolean> {
  console.log('[Push] unsubscribePush called for userId:', userId);
  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      await subscription.unsubscribe();
      console.log('[Push] Unsubscribed from PushManager ✓');
    } else {
      console.log('[Push] No active subscription found');
    }

    const { error } = await supabase
      .from('profiles')
      .update({ push_subscription: null })
      .eq('id', userId);

    if (error) {
      console.error('[Push] Failed to clear subscription in Supabase:', error.message);
      return false;
    }

    console.log('[Push] Subscription cleared in Supabase ✓');
    return true;
  } catch (err) {
    console.error('[Push] Unsubscribe failed:', err);
    return false;
  }
}
