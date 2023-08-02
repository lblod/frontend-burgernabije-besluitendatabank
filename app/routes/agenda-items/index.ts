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
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import {
  AdapterPopulatedRecordArrayWithMeta,
  getCount,
} from 'frontend-burgernabije-besluitendatabank/utils/ember-data';

export interface AgendaItemsParams {
  keyword?: string;
  municipalityLabels?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
}

const agendaItemsQuery = ({
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
}) => ({
  include: [
    'sessions.governing-body.is-time-specialization-of.administrative-unit.location',
    'sessions.governing-body.administrative-unit.location',
  ].join(','),
  sort: '-sessions.planned-start',
  filter: {
    sessions: {
      ':gt:planned-start': plannedStartMin,
      ':lt:planned-start': plannedStartMax,
      'governing-body': {
        'is-time-specialization-of': {
          'administrative-unit': {
            location: {
              ':id:': locationIds,
            },
          },
        },
      },
    },
    ':or:': {
      title: keyword,
      description: keyword,
    },
  },
  page: {
    number: page,
    size: 10,
  },
});

export async function getAgendaItems(
  context: AgendaItemsIndexRoute | AgendaItemsIndexController,
  params: AgendaItemsParams,
  currentPage = 0
) {
  const controller =
    context instanceof AgendaItemsIndexController
      ? context
      : context.routeController;

  /**
   * The || undefined is important!
   *
   * Some queryParams are set to '' in the controller this is for
   * the sake of having empty values not leaving behind a ?queryparam=&...
   *
   * However, whether it be because of the way we build our queries,
   * because of our back-ends code, or because of internal Ember-Data structure,
   * it does not like being given '' when you intend to disable that filter
   * So this ensures that '' as well as undefined get both resolved to undefined!
   */
  controller.keyword = params.keyword || undefined;
  controller.municipalityLabels = params.municipalityLabels || undefined;
  controller.plannedStartMin = params.plannedStartMin || undefined;
  controller.plannedStartMax = params.plannedStartMax || undefined;

  const locationIds = await context.municipalityList.getLocationIdsFromLabels(
    controller.municipalityLabels
  );

  const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
    await context.store.query(
      'agenda-item',
      agendaItemsQuery({
        page: currentPage,

        locationIds: locationIds,

        keyword: controller.keyword,
        plannedStartMin: controller.plannedStartMin,
        plannedStartMax: controller.plannedStartMax,
      })
    );

  if (context instanceof AgendaItemsIndexRoute) {
    controller.set('agendaItems', agendaItems.slice());
  }

  controller.set('currentPage', currentPage);
  controller.set('count', getCount(agendaItems));

  return agendaItems.slice();
}

export default class AgendaItemsIndexRoute extends Route {
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
    keyword: {
      as: 'trefwoord',
      refreshModel: true,
    },
  };

  @tracked municipalityLabels?: string;
  @tracked plannedStartMin?: string;
  @tracked plannedStartMax?: string;
  @tracked keyword?: string;

  get routeController() {
    return this.controllerFor(
      'agenda-items.index'
    ) as AgendaItemsIndexController;
  }

  @action
  error(error: Error) {
    this.routeController.set('errorMsg', error.message);
    return true;
  }

  @action
  loading(transition: Transition) {
    this.routeController.set('loading', true);
    transition.promise.finally(() => {
      this.routeController.set('loading', false);
    });
  }

  async model(params: AgendaItemsParams) {
    return getAgendaItems(this, params);
  }
}
