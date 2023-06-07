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

  @action
  setupInViewport() {
    const loader = document.getElementById("loader");
    const viewportTolerance = { bottom: 200 };
    const { onEnter, _onExit } = this.inViewport.watchElement(loader, {
      viewportTolerance,
    });
    // pass the bound method to `onEnter` or `onExit`
    onEnter(this.didEnterViewport.bind(this));
  }

  didEnterViewport() {
    this.infinityLoad();
  }
  @tracked offset = 10;

  @action async infinityLoad() {
    this.offset += 10;

    this.router.transitionTo("home.list", {
      queryParams: {
        offset: this.offset,
      },
    });
  }
}
