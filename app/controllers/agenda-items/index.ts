import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-resources';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';

import MuSearchService, {
  DataMapper,
  MuSearchData,
  MuSearchResponse,
  PageableRequest,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';
import {
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';

interface AgendaItemsParams {
  keyword: string;
  municipalityLabels: string;
  plannedStartMin: string;
  plannedStartMax: string;
  governingBodyClassifications: string;
  dataQualityList: Array<string>;
  dateSort: string;
}

interface AgendaItemsLoaderArgs {
  Named: {
    filters: AgendaItemsParams;
  };
}

class AgendaItemsLoader extends Resource<AgendaItemsLoaderArgs> {
  @service declare municipalityList: MunicipalityListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare muSearch: MuSearchService;

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

      const { keyword, plannedStartMin, plannedStartMax, dateSort } =
        this.#filters;
      const governingBodyClassificationIds =
        await this.governingBodyList.getGoverningBodyClassificationIdsFromLabels(
          this.#filters.governingBodyClassifications
        );

      const agendaItems: MuSearchResponse<AgendaItem> =
        await this.muSearch.search(
          agendaItemsQuery({
            index: 'agenda-items',
            page,
            locationIds,
            governingBodyClassificationIds,
            keyword,
            plannedStartMin,
            plannedStartMax,
            dateSort,
          })
        );

      this.total = agendaItems.count ?? 0;
      this.data = [...this.data, ...agendaItems.items.slice()];
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
  @service declare municipalityList: MunicipalityListService;
  @service declare governingBodyList: GoverningBodyListService;

  @tracked showAdvancedFilters = false;

  @action toggleAdvancedFilters() {
    if (this.showAdvancedFilters && this.governingBodyClassifications !== '') {
      this.governingBodyClassifications = '';
    }
    this.showAdvancedFilters = !this.showAdvancedFilters;
  }

  // QueryParameters
  @tracked keyword = '';
  @tracked municipalityLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked governingBodyClassifications = '';

  @action handleDateSortChange(event: { target: { value: string } }) {
    this.dateSort = event?.target?.value;
  }

  @tracked dateSort = 'desc';

  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;

  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown

  /** Mobile filter */
  @tracked hasFilter = false;

  /** Data quality modal */
  @tracked modalOpen = false;

  AgendaItemsLoader = AgendaItemsLoader;

  get municipalities() {
    return this.municipalityList.municipalityLabels();
  }

  get governingBodies() {
    return this.governingBodyList.governingBodies();
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

  showModal = () => {
    this.modalOpen = true;
  };

  closeModal = () => {
    if (this.modalOpen) {
      this.modalOpen = false;
    }
  };

  get filters(): AgendaItemsParams {
    return {
      keyword: this.keyword,
      municipalityLabels: this.municipalityLabels,
      plannedStartMin: this.plannedStartMin,
      plannedStartMax: this.plannedStartMax,
      dateSort: this.dateSort,
      governingBodyClassifications: this.governingBodyClassifications,
      dataQualityList: this.municipalityLabels.split('+'),
    };
  }

  get hasMunicipalityFilter() {
    return this.filters.municipalityLabels.length > 0;
  }
}

type AgendaItemsQueryArguments = {
  index: string;
  page: number;
  keyword?: string;
  locationIds?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
  dateSort?: string;
  governingBodyClassificationIds?: string;
};

type AgendaItemMuSearchEntry = {
  uuid: string[] | string;
  abstract_location_id?: string;
  location_id?: string;
  abstract_governing_body_location_name?: string;
  governing_body_location_name?: string;
  abstract_governing_body_name?: string;
  governing_body_name?: string;
  session_planned_start?: string;
  session_started_at?: string;
  session_ended_at?: string;
  title?: string;
  description?: string;
};

type AgendaItemsQueryResult = PageableRequest<
  AgendaItemMuSearchEntry,
  AgendaItem
>;

const agendaItemsQuery = ({
  index,
  page,
  keyword,
  locationIds,
  plannedStartMin,
  plannedStartMax,
  dateSort,
  governingBodyClassificationIds,
}: AgendaItemsQueryArguments): AgendaItemsQueryResult => {
  // Initialize filters and request objects
  const filters = {} as { [key: string]: string };
  const request: PageableRequest<AgendaItemMuSearchEntry, AgendaItem> =
    {} as PageableRequest<AgendaItemMuSearchEntry, AgendaItem>;

  request.index = index;

  // Ensure title and location_id fields are present
  filters[':query:title'] =
    '_exists_:title AND (_exists_:location_id OR _exists_:abstract_location_id)';

  // Apply optional filter for planned start range
  if (plannedStartMin) {
    filters[
      ':query:session_planned_start'
    ] = `(session_planned_start:[${plannedStartMin} TO ${
      plannedStartMax || '*'
    }] ) `;
  }

  // Apply optional filter for locationIds
  if (locationIds) {
    const queryIds = locationIds
      .split(',')
      .map((id) => `(abstract_location_id:${id} OR location_id:${id})`)
      .join(' OR ');
    filters[':query:abstract_location_id'] = queryIds;
  }

  // Apply optional filter for governing body labels
  if (governingBodyClassificationIds) {
    const queryIds = governingBodyClassificationIds
      .split(',')
      .map((id) => `(governing_body_classification_id:${id})`)
      .join(' OR ');
    filters[':query:governing_body_classification_id'] = queryIds;
  }

  // Apply optional filter for keyword search
  if (keyword) {
    filters[
      ':query:title'
    ] = `(title:*${keyword}*) OR (description:*${keyword}*)`;
  }

  // Apply optional filter for date sorting
  if (dateSort === 'asc') {
    request.sort = `+session_planned_start`;
  } else {
    request.sort = '-session_planned_start';
  }

  // Set page size and filters in the request
  request.page = page;
  request.size = 10;
  request.filters = filters;

  // Set dataMapping function in the request
  request.dataMapping = dataMapping;
  return request;
};

const dataMapping: DataMapper<AgendaItemMuSearchEntry, AgendaItem> = (
  data: MuSearchData<AgendaItemMuSearchEntry>
) => {
  const entry = data.attributes;
  const uuid = entry.uuid;
  const dataResponse = new AgendaItem();

  // Map data attributes to AgendaItem properties
  dataResponse.id = Array.isArray(uuid) ? uuid[0] : uuid;
  dataResponse.title = cleanString(parseMuSearchAttributeToString(entry.title));
  dataResponse.description = cleanString(
    parseMuSearchAttributeToString(entry.description)
  );
  dataResponse.locationId = entry.location_id || entry.abstract_location_id;
  dataResponse.abstractGoverningBodyLocationName =
    parseMuSearchAttributeToString(entry.abstract_governing_body_location_name);
  dataResponse.governingBodyLocationName = parseMuSearchAttributeToString(
    entry.governing_body_location_name
  );
  dataResponse.abstractGoverningBodyName = parseMuSearchAttributeToString(
    entry.abstract_governing_body_name
  );
  dataResponse.governingBodyName = parseMuSearchAttributeToString(
    entry.governing_body_name
  );
  dataResponse.sessionPlannedStart = parseMuSearchAttributeToDate(
    entry.session_planned_start
  );
  dataResponse.sessionEndedAt = parseMuSearchAttributeToDate(
    entry.session_ended_at
  );
  dataResponse.sessionStartedAt = parseMuSearchAttributeToDate(
    entry.session_started_at
  );

  return dataResponse;
};
