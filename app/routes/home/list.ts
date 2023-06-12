import Store from "@ember-data/store";
import { action } from "@ember/object";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

interface AgendaItemsRequestInterface {
  page: {
    size: Number;
  };
  include: String;
  municipality?: String;
  filter?: {
    ":or:"?: {};
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

export default class ListRoute extends Route {
  @service declare store: Store;

  queryParams = {
    offset: {
      refreshModel: true,
    },
  };
  @tracked offset = 100;

  @action
  refreshListRoute() {
    this.refresh();
  }

  async model(params: any) {
    
  }
}
