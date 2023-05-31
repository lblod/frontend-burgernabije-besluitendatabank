import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";



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



export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    municipality: {
      refreshModel: true,
      as: "gemeente",
    },
    sort: {
      refreshModel: true,
      as: "sorteren",
    },
    plannedStartMin: {
      refreshModel: true,
      as: "begin",
    },
    plannedStartMax: {
      refreshModel: true,
      as: "eind",
    },
    keyword: {
      refreshModel: true,
      as: "trefwoord",
    },
    offset: {
      refreshModel: true,
      as: "aantal",
    },
  };

  @tracked municipality: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;
  @tracked keyword: any;
  @tracked offset: any;

  req: any;

  


  ParseParams(params: any) {
    this.municipality = params.gemeente ? params.gemeente : null;
    this.sort = params.sort ? params.sort : "relevantie";
    this.plannedStartMin = params.plannedStartMin ? params.plannedStartMin : null;
    this.plannedStartMax = params.plannedStartMax ? params.plannedStartMax : null;
    this.keyword = params.keyword ? params.keyword : null;

    let req: AgendaItemsRequestInterface = {
      page: {
        size: params.offset,
      },
      municipality: this.municipality,
      // include: 'session,session.governing-agent',
      include: "session"
    };

    // Had to assign it here for typescript rr
    req.filter = {};

    if (this.keyword) {
      req.filter[":or:"] = {
        "title": this.keyword,
        "description": this.keyword
      }
    }

    if (this.plannedStartMin || this.plannedStartMax || this.keyword) {
      // Expected format: YYYY-MM-DD
      let sessionFilter: { [key: string]: any } = {};

      if (this.plannedStartMin) {
        sessionFilter[":gt:started-at"] = this.plannedStartMin;
      }
      if (this.plannedStartMax) {
        sessionFilter[":lt:ended-at"] = this.plannedStartMax;
      }
      req.filter.session = sessionFilter;
    }

    this.req =req; 

}


  async model(params: any) {
    const municipalities = await getMunicipalitiesFromVlaanderen(true);
    
    this.ParseParams(params);
    return municipalities;
  }
}
