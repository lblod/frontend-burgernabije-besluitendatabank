import Service, { service } from '@ember/service';
import type Store from '@ember-data/store';
import { tracked } from '@glimmer/tracking';
import type AdministrativeUnitModel from 'frontend-burgernabije-besluitendatabank/models/administrative-unit';
import type AccountModel from 'frontend-burgernabije-besluitendatabank/models/account';
import type AppSessionService from 'frontend-burgernabije-besluitendatabank/services/session';
import { ROLES } from 'frontend-burgernabije-besluitendatabank/constants/roles';

// The user behind the authenticated session (see the session service).
export default class CurrentSessionService extends Service {
  @service declare session: AppSessionService;
  @service declare store: Store;

  // The name to show for the user, or null when it can't be read.
  @tracked userLabel: string | null = null;
  @tracked roles: string[] = [];
  @tracked groupId: string | null = null;
  @tracked accountId: string | null = null;

  get isLoggedIn(): boolean {
    return this.session.isAuthenticated && Boolean(this.accountId);
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

  async load(): Promise<void> {
    if (!this.session.isAuthenticated) return;

    const authenticated = this.session.data.authenticated;
    const relationships =
      authenticated.data?.relationships ?? authenticated.relationships;
    this.accountId = relationships?.account?.data?.id ?? null;
    this.groupId = relationships?.group?.data?.id ?? null;
    this.roles = authenticated.data?.attributes?.roles ?? [];
    this.userLabel = await this.#loadUserLabel();
  }

  async #loadUserLabel(): Promise<string | null> {
    if (this.session.isMockLoginSession && this.accountId) {
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
    if (this.isSupplier || !this.groupId) return null;
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
      return null;
    }
  }
}

declare module '@ember/service' {
  interface Registry {
    'current-session': CurrentSessionService;
  }
}
