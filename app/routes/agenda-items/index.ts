/* eslint-disable ember/no-controller-access-in-routes */
import Store from '@ember-data/store';
import Error from '@ember/error';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgendaItemsIndexController from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

interface AgendaItemsParams {
  keyword: string;
  municipalityLabels: string;
  plannedStartMin: string;
  plannedStartMax: string;
}

const getQuery = ({
  page,
  keyword,
  locationIds,
  plannedStartMin,
  plannedStartMax,
}: {
  page: number;
  keyword?: string;
  locationIds?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
}): AgendaItemsRequestInterface => ({
  include: [
    'sessions.governing-body.is-time-specialization-of.administrative-unit.location',
    'sessions.governing-body.administrative-unit.location',
  ].join(','),
  sort: '-sessions.planned-start',
  filter: {
    sessions: {
      ':gt:planned-start': plannedStartMin ? plannedStartMin : undefined,
      ':lt:planned-start': plannedStartMax ? plannedStartMax : undefined,
      'governing-body': {
        'is-time-specialization-of': {
          'administrative-unit': {
            location: {
              ':id:': locationIds ? locationIds : undefined,
            },
          },
        },
      },
    },
    ':or:': {
      title: keyword ? keyword : undefined,
      description: keyword ? keyword : undefined,
    },
  },
  page: {
    number: page,
    size: 10,
  },
});

interface AgendaItemsRequestInterface {
  page: {
    number: number;
    size: number;
  };
  include: string;
  sort?: string;
  filter?: {
    ':or:'?: object;
    sessions?: {
      ':gt:planned-start'?: string;
      ':lt:planned-start'?: string;
      'governing-body'?: {
        'is-time-specialization-of'?: {
          'administrative-unit': {
            location?: object;
          };
        };
      };
    };
  };
}
export default class AgendaItemsIndexRoute extends Route {
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;
  @service declare municipalityList: MunicipalityListService;

  queryParams = {
    municipalityLabels: {
      as: 'gemeentes',
      refreshModel: true,
    },
    sort: {
      as: 'sorteren',
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
    keyword: {
      as: 'trefwoord',
      refreshModel: true,
    },
  };

  @tracked municipalityLabels?: string;
  @tracked plannedStartMin?: string;
  @tracked plannedStartMax?: string;

  @action
  error(error: Error) {
    const controller: AgendaItemsIndexController = this.controllerFor(
      'agenda-items.index'
    ) as AgendaItemsIndexController;
    controller.set('errorMsg', error.message);
    return true;
  }

  @action
  loading(transition: Transition) {
    const controller: AgendaItemsIndexController = this.controllerFor(
      'agenda-items.index'
    ) as AgendaItemsIndexController;

    controller.set('loading', true);
    transition.promise.finally(() => {
      controller.set('loading', false);
    });
  }

  async model(params: AgendaItemsParams) {
    const controller: AgendaItemsIndexController = this.controllerFor(
      'agenda-items.index'
    ) as AgendaItemsIndexController;

    if (
      controller.agendaItems?.length > 0 &&
      params.keyword === this.keywordStore.keyword &&
      params.municipalityLabels === this.municipalityLabels &&
      params.plannedStartMin === this.plannedStartMin &&
      params.plannedStartMax === this.plannedStartMax
    ) {
      return null;
    }
    this.keywordStore.keyword = params.keyword || '';
    this.municipalityLabels = params.municipalityLabels || undefined;
    this.plannedStartMin = params.plannedStartMin || '';
    this.plannedStartMax = params.plannedStartMax || '';

    // Check if the parameters have changed compared to the last time

    const locationIds = await this.municipalityList.getLocationIdsFromLabels(
      this.municipalityLabels
    );

    const currentPage = 0;
    const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query(
        'agenda-item',
        getQuery({
          page: currentPage,

          locationIds: locationIds,

          keyword: params.keyword ? params.keyword : undefined,
          plannedStartMin: params.plannedStartMin
            ? params.plannedStartMin
            : undefined,
          plannedStartMax: params.plannedStartMax
            ? params.plannedStartMax
            : undefined,
        })
      );

    const count = getCount(agendaItems);

    return {
      agendaItems,
      currentPage,
      getQuery,
      count,
    };
  }

  setupController(
    controller: AgendaItemsIndexController,
    model: unknown,
    transition: Transition<unknown>
  ): void {
    super.setupController(controller, model, transition);
    controller.setup();
  }
}
