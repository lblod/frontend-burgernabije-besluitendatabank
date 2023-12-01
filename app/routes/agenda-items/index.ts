import Route from '@ember/routing/route';
import { service } from '@ember/service';
import FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';

export default class AgendaItemsIndexRoute extends Route {
  @service declare features: FeaturesService;

  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
    },
    provinceLabels: {
      as: 'provincies',
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
}
