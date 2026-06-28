/**
 * analytics.ts
 * Lightweight, fire-and-forget analytics tracking utility.
 * All calls are fully silent — errors never bubble up to the UI.
 */

const API_BASE = 'http://localhost:5001/api';

type AnalyticsEventType =
  | 'page_view'
  | 'quote_started'
  | 'quote_priced'
  | 'quote_abandoned'
  | 'quote_ordered'
  | 'explore_model_opened'
  | 'modeling_request_submitted'
  | 'contact_form_submitted';

/** Returns a stable session ID for this browser session */
function getSessionId(): string {
  const key = 'analytics_session_id';
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = 'sess_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 9);
    sessionStorage.setItem(key, id);
  }
  return id;
}

/** Fire-and-forget event tracker. Never throws. */
export function trackEvent(
  eventType: AnalyticsEventType,
  payload?: Record<string, any>,
  page?: string
): void {
  try {
    const language = document.documentElement.lang || localStorage.getItem('language') || 'en';
    fetch(`${API_BASE}/analytics/event`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        eventType,
        sessionId: getSessionId(),
        page: page || getCurrentPage(),
        language,
        payload: payload || {}
      }),
      // Use keepalive so the request completes even if the page unloads
      keepalive: true
    }).catch(() => { /* silent */ });
  } catch {
    // Never propagate analytics errors
  }
}

/** Infer the current page name from the URL and document state */
function getCurrentPage(): string {
  if (window.location.pathname === '/management') return 'management';
  return 'home'; // SPA — actual page name should be passed explicitly
}
