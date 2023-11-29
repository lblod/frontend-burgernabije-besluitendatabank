import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import SessionsIndexController from 'frontend-lokaalbeslist/controllers/sessions';
import SessionModel from 'frontend-lokaalbeslist/models/session';
import MunicipalityListService from 'frontend-lokaalbeslist/services/municipality-list';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-lokaalbeslist/utils/ember-data';

interface sessionsIndexParams {
  plannedStartMin?: string;
  plannedStartMax?: string;
  municipalityLabels?: string;
}

/** Generate Ember Data options to fetch more sessions based on the passed filters */
const getQuery = (
  page: number,
  plannedStartMin?: string,
  plannedStartMax?: string,
  locationIds?: string
) => ({
  filter: {
    'governing-body': {
      'is-time-specialization-of': {
        'administrative-unit': {
          location: {
            ':id:': locationIds ? locationIds : undefined,
          },
        },
      },
    },
    ':gt:planned-start': plannedStartMin ? plannedStartMin : undefined,
    ':lt:planned-start': plannedStartMax ? plannedStartMax : undefined,
  },
  include: [
    'governing-body.is-time-specialization-of.administrative-unit.location',
    'governing-body.administrative-unit.location',
    'agenda-items',
  ].join(','),
  sort: '-planned-start',
  page: {
    number: page,
  },
});

export default class SessionsIndexRoute extends Route {
  @service declare store: Store;
  @service declare municipalityList: MunicipalityListService;

  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
      refreshModel: true,
    },
    plannedStartMin: {
      as: 'begin',
      refreshModel: true,
    },
    plannedStartMax: {
      as: 'eind',
      refreshModel: true,
    },
  };

  // QueryParams
  @tracked municipalityLabels?: string;
  @tracked plannedStartMin?: string;
  @tracked plannedStartMax?: string;

  async model(params: sessionsIndexParams) {
    this.plannedStartMin = params.plannedStartMin;
    this.plannedStartMax = params.plannedStartMax || undefined;
    this.municipalityLabels = params.municipalityLabels || '';

    /**
     * Municipalities transform
     *
     */
    const locationIds = await this.municipalityList.getLocationIdsFromLabels(
      this.municipalityLabels
    );

    const currentPage = 0;
    const sessions: AdapterPopulatedRecordArrayWithMeta<SessionModel> =
      await this.store.query(
        'session',
        getQuery(
          currentPage,
          this.plannedStartMin,
          this.plannedStartMax,
          locationIds
        )
      );

    const count = getCount(sessions);

    return {
      sessions,
      currentPage: currentPage,
      getQuery,
      count,
    };
  }

  setupController(
    controller: SessionsIndexController,
    model: unknown,
    transition: Transition<unknown>
  ): void {
    super.setupController(controller, model, transition);
    controller.setup();
  }
}
