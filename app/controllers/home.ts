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

  @tracked begin = undefined;
  @tracked eind = undefined;

  @action handleMunicipalityChange(m: any) {
    this.selected = m;
    this.router.transitionTo("home", {
      queryParams: {
        gemeente: m,
        sorteren: this.sort,
        begin: this.begin,
        eind: this.eind,
        trefwoord: this.keyWord,
      },
    });
  }

  @action handleSort(e: any) {
    this.sort = e.target.value.toLowerCase();
  }

  @action handleKeywordChange(e: any) {
    this.keyWord = e.target.value;
    this.router.transitionTo("home.list", {
      queryParams: {
        trefwoord: this.keyWord,
      },
    });
  }

  @tracked dateRange = "";
  @action applyDatePicker(picker: any, start: any, end: any) {
    this.begin = start;
    this.eind = end;
    this.router.transitionTo("home.list", {
      queryParams: {
        gemeente: this.selected,
        sorteren: this.sort,
        begin: start,
        eind: end,
        trefwoord: this.keyWord,
      },
    });
  }

  @action hideDatePicker(picker: any, start: any, end: any) {}

  @action cancelDatePicker(picker: any, start: any, end: any) {}
}
