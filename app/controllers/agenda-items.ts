import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import {
  getAgendaItems,
  AgendaItemsParams,
} from 'frontend-burgernabije-besluitendatabank/routes/agenda-items';

export default class AgendaItemsController extends Controller {
  @service declare store: Store;
  @service declare municipalityList: MunicipalityListService;

  /** Used for requesting more data */
  @tracked agendaItems: AgendaItem[] = [];
  @tracked currentPage = 0; // Will be set by model

  // QueryParameters. Values will be set by getAgendaItems
  @tracked keyword?: string;
  @tracked municipalityLabels?: string;
  @tracked plannedStartMin?: string;
  @tracked plannedStartMax?: string;

  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;

  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown

  /** Mobile filter */
  @tracked hasFilter = false;

  /** Shows how many results have been found */
  @tracked count = 0;

  showFilter = () => {
    this.hasFilter = true;
  };

  hideFilter = () => {
    if (this.hasFilter) {
      this.hasFilter = false;
    }
  };

  get params(): AgendaItemsParams {
    return {
      keyword: this.keyword,
      municipalityLabels: this.municipalityLabels,
      plannedStartMin: this.plannedStartMin,
      plannedStartMax: this.plannedStartMax,
    };
  }

  @action
  async loadMore() {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;

      this.currentPage++;

      const agendaItems = await getAgendaItems(
        this,
        this.params,
        this.currentPage
      );
      this.agendaItems = [...this.agendaItems, ...agendaItems];

      this.isLoadingMore = false;
    }
  }

  get municipalities() {
    return this.municipalityList.municipalities();
  }
}
