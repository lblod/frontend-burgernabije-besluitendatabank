import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type PlausibleService from 'ember-plausible/services/plausible';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type AppSessionService from 'frontend-burgernabije-besluitendatabank/services/session';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;
  @service declare session: AppSessionService;
  @service declare currentSession: CurrentSessionService;

  async beforeModel(): Promise<void> {
    this.startAnalytics();
    this.setGoverningBodyDisabledList();
    // Only does requests for a user who logged in before.
    await this.session.setup();
    await this.currentSession.load();
  }

  startAnalytics(): void {
    const { domain, apiHost } = config.plausible;

    if (!domain.startsWith('{{') && !apiHost.startsWith('{{')) {
      this.plausible.enable({
        domain,
        apiHost,
      });
    }
  }

  setGoverningBodyDisabledList(): void {
    this.governingBodyDisabledList.disabledList = !config[
      'governing-body-disabled'
    ].startsWith('{{')
      ? config['governing-body-disabled'].split(',')
      : [];
  }
}
