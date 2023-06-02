import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import HomeRoute from "../home";
import { tracked } from "@glimmer/tracking";
import Transition from "@ember/routing/transition";
import { action } from "@ember/object";

interface AgendaItemsRequestInterface {
  page: {
    size: Number;
  };
  include: String;
  municipality?: String;
  filter?: {
    ":or:"?: {}
    session?: {}
  };
}



export default class ListRoute extends Route {
  @service declare store: Store;

  queryParams = {
    offset: {}
  }
  @tracked offset = 10;
  
  @action
  refreshListRoute() {
    this.refresh();
  }


  async model(params: any) {
    let offset = params.offset;

    let model : any = this.paramsFor("home");
    params = model;
    

    let municipality = params.gemeente ? params.gemeente : null;
    let sort = params.sort ? params.sort : "relevantie";
    let plannedStartMin = params.plannedStartMin ? params.plannedStartMin : null;
    let plannedStartMax = params.plannedStartMax ? params.plannedStartMax : null;
    let keyword = params.keyword ? params.keyword : null;

    let req: AgendaItemsRequestInterface = {
      page: {
        size: offset,
      },
      municipality: municipality,
      // include: 'session,session.governing-agent',
      include: "session"
    };

    // Had to assign it here for typescript rr
    req.filter = {};

    if (keyword) {
      req.filter[":or:"] = {
        "title": keyword,
        "description": keyword
      }
    }

    if (plannedStartMin || plannedStartMax || keyword) {
      // Expected format: YYYY-MM-DD
      let sessionFilter: { [key: string]: any } = {};

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
