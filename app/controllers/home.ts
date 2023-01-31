import Controller from "@ember/controller";
import { action } from "@ember/object";
import Router from "@ember/routing/router";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import Store from "@ember-data/store";
import axios from "axios";
export default class HomeController extends Controller {
  @service declare router: RouterService;
  @service declare store: Store;

  @tracked options = ["antwerpen"];
  @tracked selected = "";
  @action handleKeywordChange() {}

  @action handleDateChange() {}

  @tracked queryParams = ["page"];
  @tracked page = 0;

  @tracked entriesStart = 0;
  @tracked entriesEnd = 3;

  @action handleMunicipalityChange(m: any) {
    this.selected = m;
    this.page = 0;
    this.router.transitionTo("home", {
      queryParams: {
        page: this.page,
        municipality: m,
      },
    });
  }

  @action nextPage() {
    this.page++;
    this.entriesStart = this.page * 3;
    this.entriesEnd = this.page * 3 + 3;
    this.router.transitionTo("home", {
      queryParams: {
        page: this.page,
        municipality: this.selected,
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
          municipality: this.selected,
        },
      });
    }
  }
}
