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
    offset: {},
  };
  @tracked offset = 10;

  @action
  refreshListRoute() {
    this.refresh();
  }

  async model(params: any) {
    let offset = params.offset;

    let model: any = this.paramsFor("home");
    params = model;

    let municipality = params.municipality ? params.municipality : null;
    let sort = params.sort ? params.sort : "relevantie";
    let plannedStartMin = params.plannedStartMin
      ? params.plannedStartMin
      : null;
    let plannedStartMax = params.plannedStartMax
      ? params.plannedStartMax
      : null;
    let keyword = params.keyword ? params.keyword : null;

    let req: AgendaItemsRequestInterface = {
      page: {
        size: offset,
      },
      municipality: municipality,
      include: [
        "session",
        "session.governing-body",
        "session.governing-body.administrative-unit",
      ].join(","),
      filter: {},
    };

    // Had to assign it here for typescript rr
    req.filter = {};

    if (keyword) {
      req.filter[":or:"] = {
        title: keyword,
        description: keyword,
      };
    }

    if (municipality || plannedStartMin || plannedStartMax) {
      req.filter.session = {};
    }

    if (plannedStartMin || plannedStartMax || municipality) {
      // Expected format: YYYY-MM-DD
      let sessionFilter: { [key: string]: any } = {};

      if (municipality) {
        //sessionFilter["governing-body"] = {"administrative-unit": { "location": {"label": municipality} }};
        sessionFilter["governing-body"] = {
          "administrative-unit": { name: municipality },
        };
      }

      if (plannedStartMin) {
        sessionFilter[":gt:started-at"] = plannedStartMin;
      }
      if (plannedStartMax) {
        sessionFilter[":lt:ended-at"] = plannedStartMax;
      }
      req.filter.session = sessionFilter;
    }

    let agendaItems = await this.store.query("agenda-item", req);

    return agendaItems;
  }
}
