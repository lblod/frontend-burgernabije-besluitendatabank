import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class HomeListController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;
  //   @tracked selected = "";
  //   @action handleKeywordChange() {}
  //   @tracked queryParams = ["page"];
  @tracked page = 0;
  @tracked entriesStart = 0;
  @tracked entriesEnd = 3;
  //   @tracked startDate = undefined;
  //   @tracked endDate = undefined;
  //   @action handleMunicipalityChange(m: any) {
  //     this.selected = m;
  //     this.page = 0;
  //     this.router.transitionTo("home", {
  //       queryParams: {
  //         page: this.page,
  //         municipality: m,
  //         startDate: this.startDate,
  //         endDate: this.endDate,
  //       },
  //     });
  //   }
  //   @action handleDateChange(d: any) {
  //     this.startDate = d!.target.value;
  //     this.page = 0;
  //     this.router.transitionTo("home", {
  //       queryParams: {
  //         page: this.page,
  //         municipality: this.selected,
  //         startDate: this.startDate,
  //         endDate: this.endDate,
  //       },
  //     });
  //   }
  @action nextPage() {
    this.page++;
    this.entriesStart = this.page * 3;
    this.entriesEnd = this.page * 3 + 3;
    this.router.transitionTo("home", {
      queryParams: {
        page: this.page,
      },
    });
  }
  @action previousPage() {
    if (this.page > 0) {
      this.page--;
      this.entriesStart = this.page * 3;
      this.entriesEnd = this.page * 3 + 3;
      this.router.transitionTo("home", {
        queryParams: {
          page: this.page,
        },
      });
    }
  }
}
