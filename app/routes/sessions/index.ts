import Route from '@ember/routing/route';
import { service } from '@ember/service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';
import type FeaturesService from 'frontend-burgernabije-besluitendatabank/services/features';

export default class SessionsIndexRoute extends Route {
  @service declare features: FeaturesService;

  queryParams = {
    municipalityLabels: {
      as: QueryParameterKeys.municipalities,
    },
    provinceLabels: {
      as: QueryParameterKeys.provinces,
    },
    governingBodyClassifications: {
      as: QueryParameterKeys.governingBodies,
    },
    plannedStartMin: {
      as: QueryParameterKeys.start,
    },
    plannedStartMax: {
      as: QueryParameterKeys.end,
    },
    keyword: {
      as: QueryParameterKeys.keyword,
    },
    dateSort: {
      as: QueryParameterKeys.dateSort,
    },
  };
}
