import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ModelFrom } from "frontend-burgernabije-besluitendatabank/lib/type-utils";
import AgendaItemsRoute from "frontend-burgernabije-besluitendatabank/routes/agenda-items";

export default class AgendaItemsController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

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

  @action handleSort(e: any) {}

}
