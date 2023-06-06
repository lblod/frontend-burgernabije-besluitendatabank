import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked selectedMunicipality: Array<string> = [];
  
  
  get currentRoute() {
    return this.router.currentRouteName;
  }

  @action handleMunicipalityChange(m: any) {
    this.selectedMunicipality = m;

    
    this.router.transitionTo("home", {
      queryParams: {
        gemeentes: this.selectedMunicipality.join("+")
      },
    });
    this.send("refreshListRoute");
  }

  @action handleSort(e: any) {
    //this.sort = e.target.value.toLowerCase();
  }

  @action handleKeywordChange(e: any) {
    this.router.transitionTo("home.list", {
      queryParams: {
        trefwoord: e.target.value,
      },
    });
    this.send("refreshListRoute");
  }

  @action applyDatePicker(picker: any, start: any, end: any) {
    this.router.transitionTo("home.list", {
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
