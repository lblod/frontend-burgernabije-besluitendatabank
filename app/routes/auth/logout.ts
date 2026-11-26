import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Transition from '@ember/routing/transition';
import type AppSessionService from 'frontend-burgernabije-besluitendatabank/services/session';
import { buildLogoutUrl } from 'frontend-burgernabije-besluitendatabank/utils/acmidm';

export default class AuthLogoutRoute extends Route {
  @service declare session: AppSessionService;

  async beforeModel(transition: Transition) {
    if (!this.session.requireAuthentication(transition, 'home')) return;

    const wasMockLoginSession = this.session.isMockLoginSession;
    try {
      await this.session.invalidate();
    } catch (error) {
      // The session may already have ended on the server.
      console.error('Could not end the session', error);
    }
    const logoutUrl = wasMockLoginSession ? null : buildLogoutUrl();
    // Reload the app so it starts from a clean store.
    window.location.replace(logoutUrl ?? '/');
  }
}
