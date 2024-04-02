/* eslint-disable @typescript-eslint/no-explicit-any */
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type PlausibleService from 'ember-plausible/services/plausible';
import config from 'frontend-burgernabije-besluitendatabank/config/environment';
import { later } from '@ember/runloop';

export default class ApplicationRoute extends Route {
  @service declare plausible: PlausibleService;

  setupController(controller: any, model: any, transition: any) {
    super.setupController(controller, model, transition);

    later(() => {
      const iframe: any = document?.getElementById('jsd-widget');
      const doc: any = iframe.contentDocument || iframe.contentWindow.document;

      const observer: any = new MutationObserver((mutations) => {
        for (const mutation of mutations) {
          if (mutation.type === 'childList') {
            const input = doc.querySelector(
              'input[placeholder="How can we help?"]'
            );
            if (input) {
              input.placeholder = 'Hoe kunnen we helpen?';
              observer.disconnect(); // Stop observing once the change is made
              break;
            }
          }
        }
      });

      observer.observe(doc.body, { childList: true, subtree: true });
    }, 500);
  }

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
