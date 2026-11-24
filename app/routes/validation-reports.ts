import Route from '@ember/routing/route';

import { service } from '@ember/service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type Store from '@ember-data/store';
import type RouterService from '@ember/routing/router-service';
import type Transition from '@ember/routing/transition';
import type CurrentSessionService from 'frontend-burgernabije-besluitendatabank/services/current-session';
import type ValidationReportsController from 'frontend-burgernabije-besluitendatabank/controllers/validation-reports';

export default class ValidationReportsRoute extends Route {
  @service declare store: Store;
  @service declare router: RouterService;
  @service declare currentSession: CurrentSessionService;

  queryParams = {
    municipalityLabels: { as: QueryParameterKeys.municipalities },
    provinceLabels: { as: QueryParameterKeys.provinces },
    governingBodyClassifications: { as: QueryParameterKeys.governingBodies },
  };

  async beforeModel() {
    await this.currentSession.load();
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

  async setupController(
    controller: ValidationReportsController,
    model: Awaited<ReturnType<ValidationReportsRoute['model']>>,
    transition: Transition,
  ) {
    super.setupController(controller, model, transition);
    controller.governingBodyOptions = await this.governingBodyOptions();
  }

  private async governingBodyOptions() {
    const codes = await this.store.query('governing-body-classification-code', {
      page: { size: 999 },
      sort: 'label',
    });

    const seen = new Set<string>();
    return codes
      .filter((code) => {
        if (!code.label || seen.has(code.label)) {
          return false;
        }
        seen.add(code.label);
        return true;
      })
      .map((code) => ({
        id: code.id,
        label: code.label,
        type: QueryParameterKeys.governingBodies,
      }));
  }
}
