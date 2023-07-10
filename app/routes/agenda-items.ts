/* eslint-disable ember/no-controller-access-in-routes */
import Store from '@ember-data/store';
import Error from '@ember/error';
import { action } from '@ember/object';
import Route from '@ember/routing/route';
import Transition from '@ember/routing/transition';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import AgendaItemsController from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items';
import { seperator } from 'frontend-burgernabije-besluitendatabank/helpers/constants';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';

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
  // exclude sessions without governing body and administrative unit
  //todo investigate why filtering is not working
  include: [
    'session',
    'session.governing-body',
    'session.governing-body.administrative-unit',
    'session.governing-body.administrative-unit.location',
  ].join(','),
  sort: '-session.started-at',
  filter: {
    session: {
      ':gt:started-at': plannedStartMin ? plannedStartMin : undefined,
      ':lt:ended-at': plannedStartMax ? plannedStartMax : undefined,
      ':has:governing-body': true,
      'governing-body': {
        ':has:administrative-unit': true,
        'administrative-unit': {
          ':has:name': true,
          location: {
            ':id:': locationIds ? locationIds : undefined,
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
    ':or:'?: {};
    session?: {
      ':gt:started-at'?: string | undefined;
      ':lt:ended-at'?: string | undefined;
      ':has:governing-body'?: boolean;
      'governing-body'?: {
        ':has:administrative-unit'?: boolean;
        'administrative-unit': {
          ':has:name'?: boolean;
          name?: any;
          location?: {};
        };
      };
    };
  };
}
export default class AgendaItemsRoute extends Route {
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

  @tracked municipalityLabels: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;

  @action
  error(error: Error) {
    const controller: any = this.controllerFor('agenda-items');
    controller.set('errorMsg', error.message);
    return true;
  }

  @action
  loading(transition: any, originRoute: any) {
    const controller: any = this.controllerFor('agenda-items');

    controller.set('loading', true);
    transition.promise.finally(() => {
      controller.set('loading', false);
    });
  }

  async model(params: any, transition: Transition<unknown>) {
    const controller: any = this.controllerFor('agenda-items');
    const model: any = this.modelFor('agenda-items');

    if (
      model?.agendaItems?.length > 0 &&
      params.keyword === this.keywordStore.keyword &&
      params.municipalityLabels === this.municipalityLabels &&
      params.sort === this.sort &&
      params.plannedStartMin === this.plannedStartMin &&
      params.plannedStartMax === this.plannedStartMax
    ) {
      return model;
    }
    this.keywordStore.keyword = params.keyword || '';
    this.municipalityLabels = params.municipalityLabels || '';
    this.sort = params.sort || '';
    this.plannedStartMin = params.plannedStartMin || '';
    this.plannedStartMax = params.plannedStartMax || '';

    params.municipality
      ? controller.set('selectedMunicipality', {
          id: params.municipality,
          label: params.municipality,
        })
      : controller.set('selectedMunicipality', null);

    // Check if the parameters have changed compared to the last time

    const locationIds = await this.municipalityList.getLocationIdsFromLabels(
      this.municipalityLabels.split(seperator)
    );

    const currentPage = 0;
    const agendaItems = await this.store.query(
      'agenda-item',
      getQuery({
        page: currentPage,

        locationIds: locationIds.join(','),

        keyword: params.keyword ? params.keyword : undefined,
        plannedStartMin: params.plannedStartMin
          ? params.plannedStartMin
          : undefined,
        plannedStartMax: params.plannedStartMax
          ? params.plannedStartMax
          : undefined,
      })
    );

    return {
      agendaItems,
      currentPage,
      getQuery,
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
