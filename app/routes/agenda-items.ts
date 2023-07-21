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
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
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

export const agendaItemsQuery = ({
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

export default class AgendaItemsRoute extends Route {
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
    return this.controllerFor('agenda-items') as AgendaItemsController;
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
    this.keyword = params.keyword || undefined;
    this.municipalityLabels = params.municipalityLabels || undefined;
    this.plannedStartMin = params.plannedStartMin || undefined;
    this.plannedStartMax = params.plannedStartMax || undefined;

    const currentPage = 0;

    let locationIds: string | undefined;
    if (this.municipalityLabels) {
      locationIds = (
        await this.municipalityList.getLocationIdsFromLabels(
          this.municipalityLabels.split(seperator)
        )
      ).join(',');
    } else {
      locationIds = undefined;
    }

    const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItemModel> =
      await this.store.query(
        'agenda-item',
        agendaItemsQuery({
          page: currentPage,

          locationIds: locationIds,

          keyword: this.keyword,
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
        })
      );

    this.routeController.set('agendaItems', agendaItems.slice());
    this.routeController.set('currentPage', currentPage);

    const count = getCount(agendaItems);

    return {
      currentPage,
      count,
    };
  }
}
