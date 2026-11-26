import Route from '@ember/routing/route';
import { service } from '@ember/service';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';

export default class ValidationReportsRoute extends Route {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  beforeModel() {
    if (!this.currentSession.isLoggedIn) {
      this.router.transitionTo('home');
    }
  }

  model() {
    return this.store.query('validation-report', {
      include: 'session.governing-body-abstract.administrative-unit',
      sort: '-created',
      page: { size: 100 },
    });
  }
}
