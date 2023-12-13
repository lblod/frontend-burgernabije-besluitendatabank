import Route from '@ember/routing/route';
import { service } from '@ember/service';
import ENV from 'frontend-burgernabije-besluitendatabank/config/environment';
import FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';
export default class AgendaItemsIndexRoute extends Route {
  @service declare features: FeaturesService;

  queryParams: any = {
    municipalityLabels: {
      as: ENV.APP['municipalities'],
    },
    provinceLabels: {
      as: ENV.APP['provinces'],
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
