import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { ModelFrom } from "frontend-burgernabije-besluitendatabank/lib/type-utils";
import AgendaItemsRoute from "frontend-burgernabije-besluitendatabank/routes/agenda-items";
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare municipalityList: MunicipalityListService;

  @tracked loading = false;
  @tracked errorMsg = "";

  declare model: ModelFrom<AgendaItemsRoute>;
  @tracked isLoadingMore = false;

  @tracked selectedMunicipality: {
    label: string;
    id: string;
  } | null = null;

  get municipalities() {
    return this.municipalityList.municipalities();
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
  }
}
