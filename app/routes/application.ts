import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type PlausibleService from 'ember-plausible/services/plausible';
import config from 'frontend-lokaalbeslist/config/environment';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;

  beforeModel(): void {
    this.startAnalytics();
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
}
