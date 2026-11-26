import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type RouterService from '@ember/routing/router-service';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import type AppSessionService from 'frontend-burgernabije-besluitendatabank/services/session';
import {
  buildLoginUrl,
  isAcmidmConfigured,
} from 'frontend-burgernabije-besluitendatabank/utils/acmidm';

export default class AuthLoginRoute extends Route {
  @service declare router: RouterService;
  @service declare session: AppSessionService;

  beforeModel() {
    if (!this.session.prohibitAuthentication('home')) return;

    if (config.login.mock) {
      this.router.replaceWith('mock-login');
    } else if (isAcmidmConfigured()) {
      window.location.replace(buildLoginUrl());
    } else {
      this.router.replaceWith('home');
    }
  }
}
