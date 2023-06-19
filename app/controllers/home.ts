import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ModelFrom } from "frontend-burgernabije-besluitendatabank/lib/type-utils";
import AgendaItemsRoute from "frontend-burgernabije-besluitendatabank/routes/agenda-items";

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked loading = false;

  declare model: ModelFrom<AgendaItemsRoute>;
  @tracked isLoadingMore = false;

  @tracked errorMsg = "";

  @action
  async loadMore() {
    if (this.model && !this.isLoadingMore) {
      this.isLoadingMore = true;
      const nextPage = this.model.currentPage + 1;
      const agendaItems = await this.store.query(
        "agenda-item",
        this.model.getQuery({ page: nextPage })
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

  @action handleMunicipalityChange(m: any) {
    this.selectedMunicipality = {
      label: m.label,
      id: m.id,
    };
  }

  @action handleMunicipalitySelect() {
    this.loading = true;
    this.router.transitionTo("agenda-items", {
      queryParams: {
        gemeentes: this.selectedMunicipality?.label || "",
      },
    });
    this.send("refreshListRoute");
  }

  @action handleSort(e: any) {
    //this.sort = e.target.value.toLowerCase();
  }

  @action handleKeywordChange(e: any) {
    this.router.transitionTo("agenda-items", {
      queryParams: {
        trefwoord: e.target.value,
      },
    });
    this.send("refreshListRoute");
  }

  @action applyDatePicker(picker: any, start: any, end: any) {
    this.router.transitionTo("agenda-items", {
      queryParams: {
        begin: start,
        eind: end,
      },
    });
    this.send("refreshListRoute");
  }

  @action hideDatePicker(picker: any, start: any, end: any) {}

  @action cancelDatePicker(picker: any, start: any, end: any) {}
}
