import Store from "@ember-data/store";
import Controller from "@ember/controller";
import { action } from "@ember/object";
import RouterService from "@ember/routing/router-service";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

export default class HomeListController extends Controller {
  @service declare inViewport: any;
  @service declare store: Store;
  @service declare router: RouterService;
  @action
  refreshListRoute() {
    this.router.refresh(this.router.currentRouteName);
  }


}
