import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { seperator } from "frontend-burgernabije-besluitendatabank/helpers/constants";
import { ModelFrom } from "frontend-burgernabije-besluitendatabank/lib/type-utils";
import AgendaItemsRoute from "frontend-burgernabije-besluitendatabank/routes/agenda-items";
import KeywordStoreService from "frontend-burgernabije-besluitendatabank/services/keyword-store";
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";

export default class AgendaItemsController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;
  @service declare municipalityList: MunicipalityListService;
  @tracked municipalityLabels: string = "";
  @tracked sort: string = "";
  @tracked plannedStartMin: string = "";
  @tracked plannedStartMax: string = "";

  declare model: ModelFrom<AgendaItemsRoute>;
  @tracked isLoadingMore = false;

  @tracked loading = false;
  @tracked errorMsg = "";

  @action
  async loadMore() {
    let moreDataToLoad = true;

    if (this.model && !this.isLoadingMore) {
      this.isLoadingMore = true;

      let locationIds = await this.municipalityList.getLocationIdsFromLabels(this.municipalityLabels.split(seperator));

      const nextPage = this.model.currentPage + 1;
      const agendaItems = await this.store.query(
        "agenda-item",
        this.model.getQuery({
          page: nextPage,
          keyword: this.keywordStore.keyword,
          locationIds: locationIds.join(","),
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
        })
      );
      const concatenateAgendaItems = this.model.agendaItems.concat(
        agendaItems.toArray()
      );

      const previousAmount = this.model.agendaItems.length;
      this.model.agendaItems.setObjects(concatenateAgendaItems);
      if (this.model.agendaItems.length === previousAmount) {
        moreDataToLoad = false;
      }

      this.model.currentPage = nextPage;
      this.isLoadingMore = false;
    }
    return moreDataToLoad;
  }
  get currentRoute() {
    return this.router.currentRouteName;
  }

  get municipalities() {
    return this.municipalityList.municipalities();
  }


}
