import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ModelFrom } from "frontend-burgernabije-besluitendatabank/lib/type-utils";
import AgendaItemsRoute from "frontend-burgernabije-besluitendatabank/routes/agenda-items";
import KeywordStoreService from "frontend-burgernabije-besluitendatabank/services/keyword-store";
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";

export default class AgendaItemsController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  @service declare keywordStore: KeywordStoreService;
  @service declare municipalityList: MunicipalityListService;
  @tracked municipality: string = "";
  @tracked sort: string = "";
  @tracked plannedStartMin: string = "";
  @tracked plannedStartMax: string = "";

  declare model: ModelFrom<AgendaItemsRoute>;
  @tracked isLoadingMore = false;

  @tracked loading = false;
  @tracked errorMsg = "";

  @action
  async loadMore() {
    if (this.model && !this.isLoadingMore) {
      this.isLoadingMore = true;
      const nextPage = this.model.currentPage + 1;
      const agendaItems = await this.store.query(
        "agenda-item",
        this.model.getQuery({
          page: nextPage,
          municipality: this.municipality,
          plannedStartMin: this.plannedStartMin,
          plannedStartMax: this.plannedStartMax,
          keyword: this.keywordStore.keyword,
        })
      );
      const concatenateAgendaItems = this.model.agendaItems.concat(
        agendaItems.toArray()
      );

      this.model.agendaItems.setObjects(concatenateAgendaItems);

      this.model.currentPage = nextPage;
      this.isLoadingMore = false;
    }
  }

  @tracked selectedMunicipality: {
    label: string;
    id: string;
  } | null = null;

  get currentRoute() {
    return this.router.currentRouteName;
  }

  get municipalities() {
    return this.municipalityList.municipalities();
  }

  @action handleMunicipalityChange(m: any) {
    if (!m) {
      this.selectedMunicipality = null;
      this.router.transitionTo("agenda-items", {
        queryParams: {
          gemeentes: null,
        },
      });
      return;
    }

    this.selectedMunicipality = {
      label: m.label,
      id: m.id,
    };

    this.router.transitionTo("agenda-items", {
      queryParams: {
        // query for multiselect
        // gemeentes: this.selectedMunicipality.join("+"),

        // temporary query for single select
        gemeentes: m.label,
      },
    });
  }

  @action handleKeywordChange(e: any) {
    this.router.transitionTo("agenda-items", {
      queryParams: {
        trefwoord: e.target.value,
      },
    });
  }

  @action applyDatePicker(picker: any, start: any, end: any) {
    this.router.transitionTo("agenda-items", {
      queryParams: {
        begin: start,
        eind: end,
      },
    });
  }

  @action hideDatePicker(picker: any, start: any, end: any) {}

  @action cancelDatePicker(picker: any, start: any, end: any) {}
}
