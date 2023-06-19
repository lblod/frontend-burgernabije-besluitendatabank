import Store from "@ember-data/store";
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

  queryParams = {
    municipality: {
      as: "gemeentes",
    },
    sort: {
      as: "sorteren",
    },
    plannedStartMin: {
      as: "begin",
    },
    plannedStartMax: {
      as: "eind",
    },
    keyword: {
      as: "trefwoord",
    },
  };

  @tracked municipality: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;
  @tracked keyword: any;

  async model(params: object, transition: Transition<unknown>) {
    let req: MunicipalitiesRequestInterface = {
      page: { size: 600 },
      filter: {
        niveau: "Gemeente",
      },
    };
    const municipalities = this.store.query("location", req);
    return { municipalities: municipalities };
  }
}
