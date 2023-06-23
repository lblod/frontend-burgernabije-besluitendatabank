import Store from "@ember-data/store";
import Error from "@ember/error";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import Transition from "@ember/routing/transition";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

interface MunicipalitiesRequestInterface {
  page: {
    size: Number;
  };
  include?: String;
  municipality?: String;
  filter?: {
    niveau?: {};
    session?: {
      "governing-body"?: {
        "administrative-unit": {
          name?: {};
          location?: {};
        };
      };
    };
  };
}

export default class HomeRoute extends Route {
  @service declare store: Store;

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

  async model(params: any, transition: Transition<unknown>) {
    let req: MunicipalitiesRequestInterface = {
      page: { size: 600 },
      filter: {
        niveau: "Gemeente",
      },
    };
    const municipalities = this.store.query("location", req);
    return {
      municipalities,
    };
  }
}
