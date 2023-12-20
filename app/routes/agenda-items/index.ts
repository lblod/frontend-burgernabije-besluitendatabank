import Route from '@ember/routing/route';
import { service } from '@ember/service';
import CONSTANTS from 'frontend-burgernabije-besluitendatabank/config/constants';
import FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';

export default class AgendaItemsIndexRoute extends Route {
  @service declare features: FeaturesService;

  queryParams: any = {
    municipalityLabels: {
      as: CONSTANTS['municipalities'],
    },
    provinceLabels: {
      as: CONSTANTS['provinces'],
    },
    governingBodyClassifications: {
      as: 'bestuursorganen',
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
    dateSort: {
      as: 'datumsortering',
    },
  };
}
