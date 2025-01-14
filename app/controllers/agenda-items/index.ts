import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-resources';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import type GoverningBodyDisabledList from 'frontend-burgernabije-besluitendatabank/services/governing-body-disabled-list';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';

import type {
  DataMapper,
  MuSearchData,
  MuSearchResponse,
  PageableRequest,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';
import {
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
  parseMuSearchAttributeToArray,
} from 'frontend-burgernabije-besluitendatabank/utils/mu-search-data-format';

interface AgendaItemsParams {
  keyword: string;
  municipalityLabels: string;
  provinceLabels: string;
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
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare muSearch: MuSearchService;
  @service declare governingBodyDisabledList: GoverningBodyDisabledList;

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
          }),
        );

      // remove disabled governing bodies from the response
      const items = agendaItems.items.filter((item) => {
        return !this.governingBodyDisabledList.disabledList.some((disabled) =>
          item.governingBodyIdResolved.includes(disabled),
        );
      });

      this.total = agendaItems.count ?? 0;
      this.data = [...this.data, ...items.slice()];
    },
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
  @tracked keyword = '';
  @tracked municipalityLabels = '';
  @tracked provinceLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked governingBodyClassifications = '';

  get showAdvancedFilters() {
    return this.governingBodyClassifications?.length > 0;
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

  AgendaItemsLoader = AgendaItemsLoader;

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

  get filters(): AgendaItemsParams {
    return {
      keyword: this.keyword,
      municipalityLabels: this.municipalityLabels,
      provinceLabels: this.provinceLabels,
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

type AgendaItemsQueryArguments = {
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

type AgendaItemMuSearchEntry = {
  uuid: string[] | string;
  abstract_location_id?: string;
  location_id?: string;
  abstract_governing_body_location_name?: string;
  governing_body_location_name?: string;
  abstract_governing_body_id?: string;
  governing_body_id?: string;
  abstract_governing_body_name?: string;
  governing_body_name?: string;
  abstract_governing_body_classification_name?: string;
  governing_body_classification_name?: string;
  session_planned_start?: string;
  session_started_at?: string;
  session_ended_at?: string;
  title?: string;
  description?: string;
  resolution_title?: string;
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

  // Ensure search_location_id field is present
  filters[':has:search_location_id'] = 't';

  // Apply optional filter for planned start range
  if (plannedStartMin) {
    filters[':query:session_planned_start'] =
      `(session_planned_start:[${plannedStartMin} TO ${
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

  // Apply optional filter for keyword search
  if (keyword) {
    filters[':fuzzy:search_content'] = keyword;
  }

  // Apply optional filter for date sorting
  const order = dateSort === 'asc' ? '+' : '-';
  request.sort = `${order}session_planned_start`;

  // Set page size and filters in the request
  request.page = page;
  request.size = 10;
  request.filters = filters;

  // Set dataMapping function in the request
  request.dataMapping = dataMapping;
  return request;
};

const dataMapping: DataMapper<AgendaItemMuSearchEntry, AgendaItem> = (
  data: MuSearchData<AgendaItemMuSearchEntry>,
) => {
  const entry = data.attributes;
  const uuid = entry.uuid;
  const dataResponse = new AgendaItem();

  // Map data attributes to AgendaItem properties
  dataResponse.id = Array.isArray(uuid) ? uuid[0] : uuid;
  dataResponse.title = cleanString(parseMuSearchAttributeToString(entry.title));
  dataResponse.resolutionTitle = cleanString(
    parseMuSearchAttributeToString(entry.resolution_title),
  );
  dataResponse.description = cleanString(
    parseMuSearchAttributeToString(entry.description),
  );
  dataResponse.locationId = entry.location_id || entry.abstract_location_id;
  dataResponse.abstractGoverningBodyLocationName =
    parseMuSearchAttributeToString(entry.abstract_governing_body_location_name);
  dataResponse.governingBodyLocationName = parseMuSearchAttributeToString(
    entry.governing_body_location_name,
  );
  dataResponse.abstractGoverningBodyId = parseMuSearchAttributeToArray(
    entry.abstract_governing_body_id,
  );
  dataResponse.governingBodyId = parseMuSearchAttributeToArray(
    entry.governing_body_id,
  );
  dataResponse.abstractGoverningBodyName = parseMuSearchAttributeToString(
    entry.abstract_governing_body_name,
  );
  dataResponse.governingBodyName = parseMuSearchAttributeToString(
    entry.governing_body_name,
  );
  dataResponse.abstractGoverningBodyClassificationName =
    parseMuSearchAttributeToString(
      entry.abstract_governing_body_classification_name,
    );
  dataResponse.governingBodyClassificationName = parseMuSearchAttributeToString(
    entry.governing_body_classification_name,
  );
  dataResponse.sessionPlannedStart = parseMuSearchAttributeToDate(
    entry.session_planned_start,
  );
  dataResponse.sessionEndedAt = parseMuSearchAttributeToDate(
    entry.session_ended_at,
  );
  dataResponse.sessionStartedAt = parseMuSearchAttributeToDate(
    entry.session_started_at,
  );

  return dataResponse;
};
