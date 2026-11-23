import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';

type CallbackParams = { code?: string; state?: string; error?: string };

export default class AuthorizationCallbackRoute extends Route {
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    code: { refreshModel: false },
    state: { refreshModel: false },
    error: { refreshModel: false },
  };

  async model(params: CallbackParams) {
    await this.currentSession.load();
    if (this.currentSession.isLoggedIn) {
      this.router.transitionTo('home');
      return { error: null };
    }
    if (params.error || !params.code) {
      return { error: params.error ?? 'missing_code' };
    }
    try {
      await this.currentSession.acmidmLogin(params.code, params.state ?? null);
      return { error: null };
    } catch (error) {
      console.error(error);
      return { error: (error as Error).message };
    }
  }
}
