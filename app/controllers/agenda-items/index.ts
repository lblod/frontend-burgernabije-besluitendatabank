import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { runTask } from 'ember-lifeline';
import type GoverningBodyListService from 'frontend-burgernabije-besluitendatabank/services/governing-body-list';
import type GovernmentListService from 'frontend-burgernabije-besluitendatabank/services/government-list';

import type MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import type ProvinceListService from 'frontend-burgernabije-besluitendatabank/services/province-list';

import type { AgendaItemsParams, SortType } from './types';
import AgendaItemsLoader from './agenda-item-loader';
import type RouterService from '@ember/routing/router-service';
import QueryParameterKeys from 'frontend-burgernabije-besluitendatabank/constants/query-parameter-keys';

export default class AgendaItemsIndexController extends Controller {
  @service declare municipalityList: MunicipalityListService;
  @service declare provinceList: ProvinceListService;
  @service declare governingBodyList: GoverningBodyListService;
  @service declare governmentList: GovernmentListService;
  @service declare router: RouterService;
  // QueryParameters
  @tracked keyword = '';
  @tracked municipalityLabels = '';
  @tracked provinceLabels = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked governingBodyClassifications = '';
  @tracked dateSort: SortType = 'desc';
  @tracked status = 'Alles';
  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;
  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown
  /** Mobile filter */
  @tracked hasFilter = false;
  /** Data quality modal */
  @tracked modalOpen = false;
  AgendaItemsLoader = AgendaItemsLoader;

  get localGovernmentGroupOptions() {
    return Promise.all([this.municipalities, this.provinces]).then(
      ([municipalities, provinces]) => [
        { groupName: 'Gemeente', options: municipalities },
        { groupName: 'Provincie', options: provinces },
      ],
    );
  }

  get showAdvancedFilters() {
    return this.governingBodyClassifications?.length > 0;
  }
  get municipalities() {
    return this.municipalityList.municipalityLabels();
  }

  get provinces() {
    return this.provinceList.provinceLabels();
  }
  get governingBodies() {
    return this.governingBodyList.governingBodies();
  }
  get statusOfAgendaItems() {
    return ['Alles', 'Behandeld', 'Niet behandeld'];
  }
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
      status: this.status,
    };
  }

  get hasMunicipalityFilter() {
    return this.filters.municipalityLabels.length > 0;
  }
  @action
  updateSelectedGovernment(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'provincies' | 'gemeentes';
    }>,
  ) {
    this.governmentList.selectedLocalGovernments = newOptions;
    this.governingBodyList.selectedGoverningBodyClassifications = [];
    this.router.transitionTo({
      queryParams: {
        [QueryParameterKeys.governingBodies]: null,
      },
    });
  }

  @action
  updateSelectedStatus(value: string) {
    this.status = value;
  }

  @action
  handleDateSortChange(event: { target: { value: SortType } }) {
    this.dateSort = event?.target?.value;
  }

  @action
  updateSelectedGoverningBodyClassifications(
    newOptions: Array<{
      label: string;
      id: string;
      type: 'governing-body-classifications';
    }>,
  ) {
    this.governingBodyList.selectedGoverningBodyClassifications = newOptions;
  }

  @action
  showFilter() {
    this.hasFilter = true;
  }

  @action
  hideFilter() {
    runTask(this, () => {
      this.hasFilter = false;
    });
  }

  @action
  showModal() {
    this.modalOpen = true;
  }
  @action
  closeModal() {
    this.modalOpen = false;
  }
}
