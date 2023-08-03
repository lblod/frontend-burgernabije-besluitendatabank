import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-resources';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
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

interface AgendaItemsLoaderArgs {
  Named: {
    filters: AgendaItemsParams;
  };
}

class AgendaItemsLoader extends Resource<AgendaItemsLoaderArgs> {
  @service declare municipalityList: MunicipalityListService;
  @service declare store: Store;

  @tracked data: AgendaItem[] = [];
  @tracked total = 0;

  #currentPage = 0;
  #filters?: AgendaItemsParams;

  get canLoadMore() {
    return this.data.length < this.total;
  }

  get hasResults() {
    return this.data.length > 0;
  }

  get isLoading() {
    return this.loadAgendaItems.isRunning;
  }

  get hasErrored() {
    return this.loadAgendaItems.last?.isError;
  }

  modify(positional: unknown[], named: AgendaItemsLoaderArgs['Named']) {
    this.#filters = named.filters;
    this.#loadInitialData();
  }

  #loadInitialData() {
    this.#reset();
    this.loadAgendaItems.perform(this.#currentPage);
  }

  // We can't use private (#) fields here because it conflicts with the ember-concurrency task transpiler
  private loadAgendaItems = task(
    { restartable: true },
    async (page: number) => {
      if (!this.#filters) {
        return;
      }

      const locationIds = await this.municipalityList.getLocationIdsFromLabels(
        this.#filters.municipalityLabels
      );

      const { keyword, plannedStartMin, plannedStartMax } = this.#filters;

      const agendaItems: AdapterPopulatedRecordArrayWithMeta<AgendaItem> =
        await this.store.query(
          'agenda-item',
          agendaItemsQuery({
            page,
            locationIds: locationIds,
            keyword,
            plannedStartMin,
            plannedStartMax,
          })
        );

      this.total = getCount(agendaItems) ?? 0;
      this.data = [...this.data, ...agendaItems.slice()];
    }
  );

  #reset() {
    this.#currentPage = 0;
    this.data = [];
    this.total = 0;
  }

  loadMore = () => {
    if (this.canLoadMore) {
      this.#currentPage += 1;
      this.loadAgendaItems.perform(this.#currentPage);
    }
  };
}

export default class AgendaItemsIndexController extends Controller {
  @service declare store: Store;
  @service declare municipalityList: MunicipalityListService;

  // QueryParameters
  @tracked keyword = '';
  @tracked municipalityLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';

  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;

  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown

  /** Mobile filter */
  @tracked hasFilter = false;

  AgendaItemsLoader = AgendaItemsLoader;

  get municipalities() {
    return this.municipalityList.municipalities();
  }

  updateKeyword = (value: string) => {
    console.log('updating keyword', value);
    this.keyword = value;
  };

  showFilter = () => {
    this.hasFilter = true;
  };

  hideFilter = () => {
    if (this.hasFilter) {
      this.hasFilter = false;
    }
  };

  get filters(): AgendaItemsParams {
    return {
      keyword: this.keyword,
      municipalityLabels: this.municipalityLabels,
      plannedStartMin: this.plannedStartMin,
      plannedStartMax: this.plannedStartMax,
    };
  }
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
