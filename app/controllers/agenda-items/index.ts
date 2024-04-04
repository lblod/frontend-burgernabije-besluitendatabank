import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { task } from 'ember-concurrency';
import { Resource } from 'ember-resources';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/mu-search/agenda-item';
import GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';

import MuSearchService, {
  DataMapper,
  MuSearchData,
  MuSearchResponse,
  PageableRequest,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';
import { cleanString } from 'frontend-burgernabije-besluitendatabank/utils/clean-string';
import {
  parseMuSearchAttributeToDate,
  parseMuSearchAttributeToString,
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
  public loadAgendaItems = task({ restartable: true }, async (page: number) => {
    if (!this.#filters) {
      return;
    }

    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.#filters.municipalityLabels
      );

    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.#filters.provinceLabels
    );

    const locationIds = [...municipalityIds, ...provinceIds].join(',');

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
  });

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
    }>
  ) {
    this.governmentList.selectedLocalGovernments = newOptions;
  }

  get localGovernmentGroupOptions() {
    return Promise.all([this.municipalities, this.provinces]).then(
      ([municipalities, provinces]) => [
        { groupName: 'Gemeente', options: municipalities },
        { groupName: 'Provincie', options: provinces },
      ]
    );
  }
  // QueryParameters
  @tracked keyword = '';
  @tracked municipalityLabels = '';
  @tracked provinceLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked governingBodyClassifications = '';
  @tracked isExporting = false;
  @service declare muSearch: MuSearchService;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  @action jsonToCSV(json: any) {
    const csvRows = [];
    const headers = Object.keys(json[0]);
    csvRows.push(headers.join(','));

    for (const row of json) {
      const values = headers.map((header) => row[header]);
      csvRows.push(values.join(','));
    }

    return csvRows.join('\n');
  }

  @action async exportToCSV() {
    this.isExporting = true;
    const municipalityIds =
      await this.municipalityList.getLocationIdsFromLabels(
        this.municipalityLabels
      );

    const provinceIds = await this.provinceList.getProvinceIdsFromLabels(
      this.provinceLabels
    );

    const locationIds = [...municipalityIds, ...provinceIds].join(',');

    const governingBodyClassificationIds =
      await this.governingBodyList.getGoverningBodyClassificationIdsFromLabels(
        this.governingBodyClassifications
      );

    const agendaItemCount: MuSearchResponse<AgendaItem> =
      await this.muSearch.search(
        agendaItemsQuery({
          index: 'agenda-items',
          page: 1,
          size: 1,
          locationIds: locationIds,
          governingBodyClassificationIds: governingBodyClassificationIds,
          keyword: this.keyword,
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
          dateSort: this.dateSort,
        })
      );

    const agendaItems: MuSearchResponse<AgendaItem> =
      await this.muSearch.search(
        agendaItemsQuery({
          index: 'agenda-items',
          page: 1,
          size: agendaItemCount.count > 5000 ? 5000 : agendaItemCount.count,
          locationIds: '',
          governingBodyClassificationIds: '',
          keyword: this.keyword,
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
          dateSort: this.dateSort,
        })
      );

    this.isExporting = false;
    const csv = this.jsonToCSV(agendaItems.items);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const csvUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = csvUrl;
    a.download = 'agenda-items.csv';
    a.click();
  }

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
    }>
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
  size?: number;
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
  size = 10,
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
    filters[
      ':query:session_planned_start'
    ] = `(session_planned_start:[${plannedStartMin} TO ${
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
  request.size = size;
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
  dataResponse.resolutionTitle = cleanString(
    parseMuSearchAttributeToString(entry.resolution_title)
  );
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
  dataResponse.abstractGoverningBodyClassificationName =
    parseMuSearchAttributeToString(
      entry.abstract_governing_body_classification_name
    );
  dataResponse.governingBodyClassificationName = parseMuSearchAttributeToString(
    entry.governing_body_classification_name
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
