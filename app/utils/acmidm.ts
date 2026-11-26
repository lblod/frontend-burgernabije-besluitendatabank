import config from 'frontend-burgernabije-besluitendatabank/config/environment';

const STATE_KEY = 'acmidm-login-state';

// Values left as '{{...}}' were not filled in by the frontend container.
const isConfigured = (value: string | undefined): value is string =>
  Boolean(value) && !value!.startsWith('{{');

export function isAcmidmConfigured(): boolean {
  const { clientId, authUrl, redirectUrl } = config.login.acmidm;
  return (
    isConfigured(clientId) && isConfigured(authUrl) && isConfigured(redirectUrl)
  );
}

export function buildLoginUrl(): string {
  const { clientId, authUrl, redirectUrl, scope } = config.login.acmidm;
  const state = crypto.randomUUID();
  try {
    sessionStorage.setItem(STATE_KEY, state);
  } catch {
    // Without sessionStorage the state can't be checked on the callback.
  }
  const url = new URL(authUrl);
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('redirect_uri', redirectUrl);
  url.searchParams.set('state', state);
  if (isConfigured(scope)) {
    url.searchParams.set('scope', scope);
  }
  return url.href;
}

// False when the callback isn't the answer to the login this browser started.
export function isExpectedState(state: string | null): boolean {
  let expectedState: string | null = null;
  try {
    expectedState = sessionStorage.getItem(STATE_KEY);
    sessionStorage.removeItem(STATE_KEY);
  } catch {
    // Not available: the state can't be checked.
  }
  return !expectedState || expectedState === state;
}

// Logging out of ACM/IDM too, or the next login skips the ACM/IDM form. Null when not configured.
export function buildLogoutUrl(): string | null {
  const { logoutUrl } = config.login.acmidm;
  if (!isConfigured(logoutUrl)) return null;
  const url = new URL(logoutUrl);
  url.searchParams.set(
    'post_logout_redirect_uri',
    `${window.location.origin}/`,
  );
  return url.href;
}
