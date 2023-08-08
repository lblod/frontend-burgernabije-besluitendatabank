import Route from '@ember/routing/route';
import Controller from '@ember/controller';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';

export default class AgendaItemsIndexRoute extends Route {
  @service declare features: FeaturesService;

  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
    },
    plannedStartMin: {
      as: 'begin',
    },
    plannedStartMax: {
      as: 'eind',
    },
    keyword: {
      as: 'trefwoord',
    },
  };

  async setupController(
    controller: Controller,
    model: unknown,
    transition: Transition
  ) {
    // if mu-search-agenda-items feature is enabled display the mu-search agenda items
    // otherwise display the default agenda items
    if (this.features.isEnabled('mu-search-agenda-items')) {
      console.log(
        'mu-search-agenda-items feature is enabled, but no visible change yet'
      );
      // this.controllerName = 'agenda-items/mu-search';
      // this.templateName = 'agenda-items/mu-search';
    }

    super.setupController(controller, model, transition);
  }
}
