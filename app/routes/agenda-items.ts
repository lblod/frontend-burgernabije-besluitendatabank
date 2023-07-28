/* eslint-disable ember/no-controller-access-in-routes */
import Store from '@ember-data/store';
import Error from '@ember/error';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgendaItemsController from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items';
import AgendaItemModel, {
  AgendaItemMuSearch,
} from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import MuSearchService, {
  DataMapper,
  MuSearchData,
  MuSearchResponse,
  PageableRequest,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
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

export default class AgendaItemsRoute extends Route {
  @service declare store: Store;
  @service declare muSearch: MuSearchService;
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
    const controller: AgendaItemsController = this.controllerFor(
      'agenda-items'
    ) as AgendaItemsController;
    controller.set('errorMsg', error.message);
    return true;
  }

  getMuSearchQuery({
    index,
    page,
    keyword,
    locationIds,
    plannedStartMin,
    plannedStartMax,
  }: {
    index: string;
    page: number;
    keyword?: string;
    locationIds?: string;
    plannedStartMin?: string;
    plannedStartMax?: string;
  }): PageableRequest<AgendaItemMuSearch> {
    const filters = {} as { [key: string]: string };
    const request: PageableRequest<AgendaItemMuSearch> =
      {} as PageableRequest<AgendaItemMuSearch>;
    request.sort = '-session_planned_start';
    request.index = index;
    if (plannedStartMin) {
      filters[
        ':query:session_planned_start'
      ] = `(session_planned_start:[${plannedStartMin} TO
           ${plannedStartMax || '*'}] ) `;
    }

    if (locationIds) {
      filters['location_id'] = locationIds;
    }
    if (keyword) {
      filters[
        ':query:title'
      ] = `(title:${keyword})  OR (description:${keyword}) `;
    }
    request.page = page;
    request.size = 10;
    request.filters = filters;

    const dataMapping: DataMapper<AgendaItemMuSearch> = (
      data: MuSearchData
    ) => {
      const entry = data['attributes'] as any;
      const uuid = entry['uuid'];
      const dataResponse = new AgendaItemMuSearch();
      dataResponse.id = Array.isArray(uuid) ? uuid[0] : uuid;

      dataResponse.locationId = entry['location_id'];
      dataResponse.timeSpecizalizationLocationName =
        entry['time_specialization_location_name'];
      dataResponse.governingBodyLocationName =
        entry['governing_body_location_name'];
      dataResponse.timeSpecializationName = entry['time_specialization_name'];
      dataResponse.governingBodyName = entry['governing_body_name'];
      dataResponse.sessionPlannedStart = entry['session_planned_start']
        ? new Date(entry['session_planned_start'])
        : undefined;
      dataResponse.sessionEndedAt = entry['session_ended_at']
        ? new Date(entry['session_ended_at'])
        : undefined;
      dataResponse.sessionStartedAt = entry['session_started_at']
        ? new Date(entry['session_started_at'])
        : undefined;
      dataResponse.title = entry['title'];
      dataResponse.description = entry['description'];
      return dataResponse;
    };
    request.dataMapping = dataMapping;
    return request;
  }

  @action
  loading(transition: Transition) {
    const controller: AgendaItemsController = this.controllerFor(
      'agenda-items'
    ) as AgendaItemsController;

    controller.set('loading', true);
    transition.promise.finally(() => {
      controller.set('loading', false);
    });
  }

  async model(params: AgendaItemsParams) {
    const controller: AgendaItemsController = this.controllerFor(
      'agenda-items'
    ) as AgendaItemsController;

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

    const agendaItems: MuSearchResponse<AgendaItemMuSearch> =
      await this.muSearch.search(
        this.getMuSearchQuery({
          index: 'agenda-items',
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

    const count = agendaItems.count;

    return {
      agendaItems: agendaItems.items,
      currentPage,
      getQuery,
      getQueryMuSearch: this.getMuSearchQuery,
      count,
    };
  }

  setupController(
    controller: AgendaItemsController,
    model: unknown,
    transition: Transition<unknown>
  ): void {
    super.setupController(controller, model, transition);
    controller.setup();
  }
}
