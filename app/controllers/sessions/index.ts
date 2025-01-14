import Controller from '@ember/controller';
import { action } from '@ember/object';
import { tracked } from '@glimmer/tracking';
import { service } from '@ember/service';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import Session from 'frontend-burgernabije-besluitendatabank/models/mu-search/session';
import MuSearchService, {
  DataMapper,
  MuSearchData,
  MuSearchResponse,
  PageableRequest,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-resources';
import GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';
import ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import {
  parseMuSearchAttributeToString,
  parseMuSearchAttributeToDate,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';
import RouterService from '@ember/routing/router-service';

interface SessionsParams {
  municipalityLabels: string;
  provinceLabels: string;
  plannedStartMin: string;
  plannedStartMax: string;
  keyword: string;
  governingBodyClassifications: string;
  dataQualityList: Array<string>;
  dateSort: string;
}

interface SessionsLoaderArgs {
  Named: {
    filters: SessionsParams;
  };
}

class SessionsLoader extends Resource<SessionsLoaderArgs> {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare muSearch: MuSearchService;

  @tracked data: Session[] = [];
  @tracked total = 0;

  #currentPage = 0;
  #filters?: SessionsParams;

  get canLoadMore() {
    return this.data.length < this.total;
  }

  get hasResults() {
    return this.data.length > 0;
  }

  get isLoading() {
    return this.loadSessions.isRunning;
  }

  get hasErrored() {
    return this.loadSessions.last?.isError;
  }

  modify(positional: unknown[], named: SessionsLoaderArgs['Named']) {
    this.#filters = named.filters;
    this.#loadInitialData();
  }

  #loadInitialData() {
    this.#reset();
    this.loadSessions.perform(this.#currentPage);
  }

  // We can't use private (#) fields here because it conflicts with the ember-concurrency task transpiler
  private loadSessions = task({ restartable: true }, async (page: number) => {
    if (!this.#filters) {
      return;
    }

    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.#filters.municipalityLabels,
      );

    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.#filters.provinceLabels,
    );

    const locationIds = [...municipalityIds, ...provinceIds].join(',');

    const { keyword, plannedStartMin, plannedStartMax, dateSort } =
      this.#filters;

    const governingBodyClassificationIds =
      await this.governingBodyList.getGoverningBodyClassificationIdsFromLabels(
        this.#filters.governingBodyClassifications,
      );

    const sessions: MuSearchResponse<Session> = await this.muSearch.search(
      sessionsQuery({
        index: 'sessions',
        page,
        keyword,
        locationIds,
        governingBodyClassificationIds,
        plannedStartMin,
        plannedStartMax,
        dateSort,
      }),
    );

    this.total = sessions.count ?? 0;
    this.data = [...this.data, ...sessions.items.slice()];
  });

  #reset() {
    this.#currentPage = 0;
    this.data = [];
    this.total = 0;
  }

  loadMore = () => {
    if (this.canLoadMore) {
      this.#currentPage += 1;
      this.loadSessions.perform(this.#currentPage);
    }
  };
}

export default class SessionsIndexController extends Controller {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;

  @action
  updateSelectedGovernment(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'provincies' | 'gemeentes';
    }>,
  ) {
    this.governmentList.selectedLocalGovernments = newOptions;
  }

  get localGovernmentGroupOptions() {
    return Promise.all([this.municipalities, this.provinces]).then(
      ([municipalities, provinces]) => [
        { groupName: 'Gemeente', options: municipalities },
        { groupName: 'Provincie', options: provinces },
      ],
    );
  }
  // QueryParameters
  @tracked municipalityLabels = '';
  @tracked provinceLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked keyword = '';
  @tracked governingBodyClassifications = '';

  @service declare router: RouterService;

  get showAdvancedFilters() {
    return this.governingBodyClassifications.length > 0;
  }

  @action handleDateSortChange(event: { target: { value: string } }) {
    this.dateSort = event?.target?.value;
  }

  @action updateSelectedGoverningBodyClassifications(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'governing-body-classifications';
    }>,
  ) {
    this.governingBodyList.selectedGoverningBodyClassifications = newOptions;
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

  SessionsLoader = SessionsLoader;

  get municipalities() {
    return this.municipalityList.municipalityLabels();
  }

  get provinces() {
    return this.provinceList.provinceLabels();
  }
  get governingBodies() {
    return this.governingBodyList.governingBodies();
  }

  updateKeyword = (value: string) => {
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

  get filters(): SessionsParams {
    return {
      municipalityLabels: this.municipalityLabels,
      provinceLabels: this.provinceLabels,
      keyword: this.keyword,
      plannedStartMin: this.plannedStartMin,
      plannedStartMax: this.plannedStartMax,
      dateSort: this.dateSort,
      governingBodyClassifications: this.governingBodyClassifications,
      dataQualityList: [],
    };
  }

  get hasMunicipalityFilter() {
    return this.filters.municipalityLabels.length > 0;
  }
}

type SessionsQueryArguments = {
  index: string;
  page: number;
  keyword?: string;
  locationIds?: string;
  provinceIds?: string;
  plannedStartMin?: string;
  plannedStartMax?: string;
  dateSort?: string;
  governingBodyClassificationIds?: string;
};

type SessionMuSearchEntry = {
  uuid: string[] | string;
  abstract_location_id?: string;
  location_id?: string;
  abstract_governing_body_location_name?: string;
  governing_body_location_name?: string;
  abstract_governing_body_name?: string;
  governing_body_name?: string;
  abstract_governing_body_classification_name?: string;
  governing_body_classification_name?: string;
  planned_start?: string;
  started_at?: string;
  ended_at?: string;
  title?: string;
  description?: string;
  resolution_title?: string;
  'agenda-items_id'?: string[];
};

type SessionsQueryResult = PageableRequest<SessionMuSearchEntry, Session>;

const sessionsQuery = ({
  index,
  page,
  keyword,
  plannedStartMin,
  plannedStartMax,
  dateSort,
  locationIds,
  governingBodyClassificationIds,
}: SessionsQueryArguments): SessionsQueryResult => {
  // Initialize filters and request objects
  const filters = {} as { [key: string]: string };
  const request: PageableRequest<SessionMuSearchEntry, Session> =
    {} as PageableRequest<SessionMuSearchEntry, Session>;

  request.index = index;

  // Ensure search_location_id field is present
  filters[':has:search_location_id'] = 't';

  // Apply optional filter for planned start range
  if (plannedStartMin) {
    filters[':query:planned_start'] = `(planned_start:[${plannedStartMin} TO ${
      plannedStartMax || '*'
    }] ) `;
  }

  // Apply optional filter for locationIds
  if (locationIds) {
    filters[':terms:search_location_id'] = locationIds;
  }

  // Apply optional filter for governing body ids
  if (governingBodyClassificationIds) {
    filters[':terms:search_governing_body_classification_id'] =
      governingBodyClassificationIds;
  }

  if (keyword) {
    filters[':fuzzy:search_content'] = keyword;
  }

  // Apply optional filter for date sorting
  const order = dateSort === 'asc' ? '+' : '-';
  request.sort = `${order}planned_start`;

  // Set page size and filters in the request
  request.page = page;
  request.size = 10;
  request.filters = filters;

  // Set dataMapping function in the request
  request.dataMapping = dataMapping;
  return request;
};

const dataMapping: DataMapper<SessionMuSearchEntry, Session> = (
  data: MuSearchData<SessionMuSearchEntry>,
) => {
  const entry = data.attributes;
  const uuid = entry.uuid;
  const dataResponse = new Session();

  // Map data attributes to AgendaItem properties
  dataResponse.id = Array.isArray(uuid) ? uuid[0] : uuid;
  dataResponse.locationId = entry.location_id || entry.abstract_location_id;
  dataResponse.abstractGoverningBodyLocationName =
    parseMuSearchAttributeToString(entry.abstract_governing_body_location_name);
  dataResponse.governingBodyLocationName = parseMuSearchAttributeToString(
    entry.governing_body_location_name,
  );
  dataResponse.abstractGoverningBodyName = parseMuSearchAttributeToString(
    entry.abstract_governing_body_name,
  );
  dataResponse.governingBodyName = parseMuSearchAttributeToString(
    entry.governing_body_name,
  );
  dataResponse.agendaItemsId = entry['agenda-items_id'] || [];
  dataResponse.abstractGoverningBodyClassificationName =
    parseMuSearchAttributeToString(
      entry.abstract_governing_body_classification_name,
    );
  dataResponse.governingBodyClassificationName = parseMuSearchAttributeToString(
    entry.governing_body_classification_name,
  );
  dataResponse.plannedStart = parseMuSearchAttributeToDate(entry.planned_start);
  dataResponse.endedAt = parseMuSearchAttributeToDate(entry.ended_at);
  dataResponse.startedAt = parseMuSearchAttributeToDate(entry.started_at);

  return dataResponse;
};
