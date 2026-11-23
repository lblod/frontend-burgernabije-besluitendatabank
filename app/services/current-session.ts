import Service, { service } from '@ember/service';
import type Store from '@ember-data/store';
import type AdministrativeUnitModel from 'frontend-burgernabije-besluitendatabank/models/administrative-unit';
import type AccountModel from 'frontend-burgernabije-besluitendatabank/models/account';
import { tracked } from '@glimmer/tracking';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';

export const ROLES = {
  abb: 'LokaalBeslist-ABB',
  bestuur: 'LokaalBeslist-bestuur',
  supplier: 'LokaalBeslist-leverancier',
};

const JSON_API = 'application/vnd.api+json';
const STATE_KEY = 'acmidm-login-state';
const LOAD_TIMEOUT_MS = 5000;
// The login service (acmidm-login-service), also in a dev build.
const ACMIDM_SESSIONS_PATH = '/sessions';

// Values left as '{{...}}' were not filled in by the frontend container.
const isConfigured = (value: string | undefined) =>
  Boolean(value) && !value!.startsWith('{{');

type SessionRelationships = {
  account?: { data?: { id: string } };
  group?: { data?: { id: string } };
};

// The mock login puts the relationships next to data, ACM/IDM inside it.
type SessionResponse = {
  data?: {
    id: string;
    attributes?: { roles?: string[] };
    relationships?: SessionRelationships;
  };
  relationships?: SessionRelationships;
};

export default class CurrentSessionService extends Service {
  @service declare store: Store;

  @tracked isLoaded = false;
  @tracked userLabel: string | null = null;
  @tracked roles: string[] = [];
  @tracked groupId: string | null = null;
  @tracked accountId: string | null = null;

  get sessionsPath(): string {
    return config.login.sessionsPath;
  }

  get isMockLogin(): boolean {
    return config.login.mock;
  }

  get acmidm() {
    return config.login.acmidm;
  }

  get isAcmidmConfigured(): boolean {
    return (
      isConfigured(this.acmidm.clientId) &&
      isConfigured(this.acmidm.authUrl) &&
      isConfigured(this.acmidm.redirectUrl)
    );
  }

  get isLoggedIn(): boolean {
    return Boolean(this.accountId);
  }

  get isAbb(): boolean {
    return this.roles.includes(ROLES.abb);
  }

  get isBestuur(): boolean {
    return this.roles.includes(ROLES.bestuur);
  }

  get isSupplier(): boolean {
    return this.roles.includes(ROLES.supplier);
  }

  get roleLabel(): string {
    if (this.isAbb) return 'ABB';
    if (this.isSupplier) return 'Leverancier';
    if (this.isBestuur) return 'Bestuur';
    return 'Aangemeld';
  }

  #loading: Promise<void> | null = null;

  // The app renders without waiting for this; what needs the session awaits it.
  load(): Promise<void> {
    this.#loading ??= this.#load();
    return this.#loading;
  }

  async #load(): Promise<void> {
    try {
      const response = await fetch(`${this.sessionsPath}/current`, {
        headers: { Accept: JSON_API },
        signal: AbortSignal.timeout(LOAD_TIMEOUT_MS),
      });
      if (response.ok) {
        this.#setSession((await response.json()) as SessionResponse);
        this.userLabel = await this.#loadUserLabel();
      } else {
        this.#clear();
      }
    } catch (error) {
      console.error('Could not load the current session', error);
      this.#clear();
    } finally {
      this.isLoaded = true;
    }
  }

  login(): void {
    const state = crypto.randomUUID();
    try {
      sessionStorage.setItem(STATE_KEY, state);
    } catch {
      // Without sessionStorage the state can't be checked on the callback.
    }
    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.acmidm.clientId,
      redirect_uri: this.acmidm.redirectUrl,
      state,
    });
    if (isConfigured(this.acmidm.scope)) {
      params.set('scope', this.acmidm.scope);
    }
    window.location.assign(`${this.acmidm.authUrl}?${params.toString()}`);
  }

  async acmidmLogin(code: string, state: string | null): Promise<void> {
    let expectedState: string | null = null;
    try {
      expectedState = sessionStorage.getItem(STATE_KEY);
      sessionStorage.removeItem(STATE_KEY);
    } catch {
      // Not available: the state can't be checked.
    }
    if (expectedState && expectedState !== state) {
      throw new Error('Login failed (state does not match)');
    }
    const response = await fetch(ACMIDM_SESSIONS_PATH, {
      method: 'POST',
      headers: { 'Content-Type': JSON_API, Accept: JSON_API },
      body: JSON.stringify({
        data: { type: 'sessions', attributes: { authorizationCode: code } },
      }),
    });
    if (!response.ok) {
      // 403: the organisation of the user (vo_orgcode) isn't a known bestuur.
      throw new Error(`Login failed (${response.status})`);
    }
    this.#reloadApp();
  }

  async mockLogin(accountId: string, groupId: string): Promise<void> {
    const response = await fetch(this.sessionsPath, {
      method: 'POST',
      headers: { 'Content-Type': JSON_API, Accept: JSON_API },
      body: JSON.stringify({
        data: {
          type: 'sessions',
          relationships: {
            account: { data: { type: 'accounts', id: accountId } },
            group: { data: { type: 'groups', id: groupId } },
          },
        },
      }),
    });
    if (!response.ok) {
      throw new Error(`Login failed (${response.status})`);
    }
    this.#reloadApp();
  }

  async logout(): Promise<void> {
    await fetch(`${this.sessionsPath}/current`, { method: 'DELETE' });
    // Also end the ACM/IDM session, or the next login skips the ACM/IDM form.
    if (!this.isMockLogin && isConfigured(this.acmidm.logoutUrl)) {
      const params = new URLSearchParams({
        post_logout_redirect_uri: `${window.location.origin}/`,
      });
      window.location.assign(`${this.acmidm.logoutUrl}?${params.toString()}`);
      return;
    }
    this.#reloadApp();
  }

  #setSession(response: SessionResponse) {
    const relationships =
      response.data?.relationships ?? response.relationships;
    this.accountId = relationships?.account?.data?.id ?? null;
    this.groupId = relationships?.group?.data?.id ?? null;
    this.roles = response.data?.attributes?.roles ?? [];
  }

  async #loadUserLabel(): Promise<string> {
    if (this.isMockLogin && this.accountId) {
      try {
        const account: AccountModel = await this.store.findRecord(
          'account',
          this.accountId,
          { include: 'user' },
        );
        const name = (await account.user)?.fullName;
        if (name) return name;
      } catch (error) {
        console.error('Could not load the mock user', error);
      }
    }
    // A supplier logs in with one of its besturen; its own name isn't readable.
    if (this.isSupplier || !this.groupId) return this.roleLabel;
    try {
      const unit: AdministrativeUnitModel = await this.store.findRecord(
        'administrative-unit',
        this.groupId,
        { include: 'classification' },
      );
      const classification = (await unit.classification)?.label;
      return classification ? `${classification} ${unit.name}` : unit.name;
    } catch (error) {
      console.error('Could not load the bestuur of the user', error);
      return this.roleLabel;
    }
  }

  #clear() {
    this.userLabel = null;
    this.accountId = null;
    this.groupId = null;
    this.roles = [];
  }

  // What the user may read changes with the session: start from a clean store.
  #reloadApp() {
    window.location.assign('/');
  }
}

declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
