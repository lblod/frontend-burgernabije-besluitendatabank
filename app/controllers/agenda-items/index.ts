import Store from '@ember-data/store';
import Controller from '@ember/controller';
import { action } from '@ember/object';
import RouterService from '@ember/routing/router-service';
import { service } from '@ember/service';
import { tracked } from '@glimmer/tracking';
import { ModelFrom } from 'frontend-burgernabije-besluitendatabank/lib/type-utils';
import AgendaItemsIndexRoute from 'frontend-burgernabije-besluitendatabank/routes/agenda-items';
import KeywordStoreService from 'frontend-burgernabije-besluitendatabank/services/keyword-store';
import MunicipalityListService from 'frontend-burgernabije-besluitendatabank/services/municipality-list';
import { AgendaItemMuSearch } from 'frontend-burgernabije-besluitendatabank/models/agenda-item';
import MuSearchService, {
  MuSearchResponse,
} from 'frontend-burgernabije-besluitendatabank/services/mu-search';

export default class AgendaItemsIndexController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare muSearch: MuSearchService;
  @service declare keywordStore: KeywordStoreService;
  @service declare municipalityList: MunicipalityListService;

  // QueryParameters
  @tracked agendaItems: AgendaItemMuSearch[] = [];
  @tracked municipalityLabels = '';
  @tracked sort = '';
  @tracked plannedStartMin = '';
  @tracked plannedStartMax = '';
  @tracked keyword = '';

  /** Used for requesting more data */
  declare model: ModelFrom<AgendaItemsIndexRoute>;

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

  setup() {
    this.agendaItems = this.model?.agendaItems.slice() || [];
  }

  @action
  async loadMore() {
    if (this.model && !this.isLoadingMore) {
      this.isLoadingMore = true;

      const locationIds = await this.municipalityList.getLocationIdsFromLabels(
        this.municipalityLabels
      );

      const nextPage = this.model.currentPage + 1;

      const agendaItems: MuSearchResponse<AgendaItemMuSearch> =
        await this.muSearch.search(
          this.model.getQueryMuSearch({
            index: 'agenda-items',
            page: nextPage,
            locationIds: locationIds,

            keyword: this.keywordStore.keyword,
            plannedStartMin: this.plannedStartMin,
            plannedStartMax: this.plannedStartMax,
          })
        );

      this.agendaItems = [...this.agendaItems, ...agendaItems.items];

      this.model.currentPage = nextPage;
      this.isLoadingMore = false;
    }
  }
  get currentRoute() {
    return this.router.currentRouteName;
  }

  get municipalities() {
    return this.municipalityList.municipalities();
  }
}
