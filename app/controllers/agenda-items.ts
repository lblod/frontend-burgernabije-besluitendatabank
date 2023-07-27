import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { seperator } from 'frontend-burgernabije-besluitendatabank/helpers/constants';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import AgendaItem from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import { agendaItemsQuery } from 'frontend-burgernabije-besluitendatabank/routes/agenda-items';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class AgendaItemsController extends Controller {
  @service declare store: Store;
  @service declare municipalityList: MunicipalityListService;

  /** Used for requesting more data */
  @tracked agendaItems: AgendaItem[] = [];
  @tracked currentPage = 0;

  // QueryParameters
  @tracked keyword?: string = '';
  @tracked municipalityLabels?: string = '';
  @tracked plannedStartMin?: string;
  @tracked plannedStartMax?: string;

  /** Controls the loading animation of the "load more" button */
  @tracked isLoadingMore = false;

  @tracked loading = false; // Controls the loading animation that replaces the main view
  @tracked errorMsg = ''; // Controls whether an Oops is shown

  /** Mobile filter */
  @tracked hasFilter = false;

  showFilter = () => {
    this.hasFilter = true;
  };

  hideFilter = () => {
    if (this.hasFilter) {
      this.hasFilter = false;
    }
  };

  @action
  async loadMore() {
    if (!this.isLoadingMore) {
      this.isLoadingMore = true;

      const locationIds = await this.municipalityList.getLocationIdsFromLabels(
        this.municipalityLabels
      );

      this.currentPage++;

      const agendaItems = (await this.store.query(
        'agenda-item',
        agendaItemsQuery({
          page: this.currentPage,
          keyword: this.keyword,
          locationIds: locationIds,
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
        })
      )) as unknown as AgendaItemModel[];

      this.agendaItems = [...this.agendaItems, ...agendaItems];
      this.isLoadingMore = false;
    }
  }

  get municipalities() {
    return this.municipalityList.municipalities();
  }
}
