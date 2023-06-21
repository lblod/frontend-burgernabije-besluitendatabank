import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class HomeController extends Controller {
  @service declare router: RouterService;

  @tracked loading = false;
  @tracked errorMsg = "";

  @tracked selectedMunicipality: {
    label: string;
    id: string;
  } | null = null;

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
