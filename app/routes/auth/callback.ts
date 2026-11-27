import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type AppSessionService from 'frontend-burgernabije-besluitendatabank/services/session';
import { isExpectedState } from 'frontend-burgernabije-besluitendatabank/utils/acmidm';

type CallbackParams = { code?: string; state?: string; error?: string };

// ACM/IDM redirects here after logging in.
export default class AuthCallbackRoute extends Route {
  @service declare session: AppSessionService;

  queryParams = {
    code: { refreshModel: false },
    state: { refreshModel: false },
    error: { refreshModel: false },
  };

  beforeModel() {
    this.session.prohibitAuthentication('home');
  }

  async model(params: CallbackParams) {
    if (params.error || !params.code) {
      return { error: params.error ?? 'missing_code' };
    }
    if (!isExpectedState(params.state ?? null)) {
      return { error: 'state_mismatch' };
    }
    try {
      // On success, the session service reloads the app.
      await this.session.authenticate('authenticator:acm-idm', params.code);
      return { error: null };
    } catch (error) {
      // A 403: the organisation of the user (vo_orgcode) isn't a known bestuur.
      console.error('Could not log in with ACM/IDM', error);
      return { error: 'login_failed' };
    }
  }
}
