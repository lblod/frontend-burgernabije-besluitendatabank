import Error from "@ember/error";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import { tracked } from "@glimmer/tracking";

export default class HomeRoute extends Route {
  @tracked municipality: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;
  @tracked keyword: any;

  @action
  error(error: Error) {
    let controller: any = this.controllerFor("home");
    controller.set("errorMsg", error.message);
    return true;
  }

  @action
  loading(transition: any, originRoute: any) {
    let controller: any = this.controllerFor("home");

    controller.set("loading", true);
    transition.promise.finally(() => {
      controller.set("loading", false);
    });
  }
}
