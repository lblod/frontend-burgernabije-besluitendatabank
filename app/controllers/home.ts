import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  @tracked selected = "";

  get currentRoute() {
    return this.router.currentRouteName;
  }


  @tracked entriesStart = 0;
  @tracked entriesEnd = 3;
  @tracked keyWord = "";
  @tracked sort = "relevantie";

  @tracked plannedStart = undefined;

  @action handleMunicipalityChange(m: any) {
    this.selected = m;
    this.router.transitionTo("home", {
      queryParams: {
        municipality: m,
        sort: this.sort,
        plannedStart: this.plannedStart,
        keyWord: this.keyWord,
      },
    });
  }

  @action handleSort(e: any) {
    this.sort = e.target.value.toLowerCase();
  }

  @action handleKeywordChange(e: any) {
    this.keyWord = e.target.value;
    this.router.transitionTo("home", {
      queryParams: {
        municipality: this.selected,
        sort: this.sort,
        plannedStart: this.plannedStart,
        keyWord: this.keyWord,
      },
    });
  }

  @action handleDateChange(d: any) {
    this.plannedStart = d!.target.value;
    this.router.transitionTo("home", {
      queryParams: {
        municipality: this.selected,
        sort: this.sort,
        plannedStart: this.plannedStart,
        keyWord: this.keyWord,
      },
    });
  }
}
