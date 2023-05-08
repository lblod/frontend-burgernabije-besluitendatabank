import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import Store from "@ember-data/store";

export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  @tracked selected = "";
  @action handleKeywordChange() {}



  @tracked startDate = undefined;
  @tracked endDate = undefined;

  @action handleMunicipalityChange(m: any) {
    this.selected = m;
    this.router.transitionTo("home", {
      queryParams: {
        municipality: m,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }

  @action handleDateChange(d: any) {
    this.startDate = d!.target.value;
    this.router.transitionTo("home", {
      queryParams: {
        municipality: this.selected,
        startDate: this.startDate,
        endDate: this.endDate,
      },
    });
  }
}
