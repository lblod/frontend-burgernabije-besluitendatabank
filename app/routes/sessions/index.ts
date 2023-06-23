import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";

const getQuery = (page: number, plannedStartMin?: string, plannedStartMax?: string, municipality?: string) => ({
  // exclude sessions without governing body and administrative unit
  //todo investigate why filtering is not working
  filter: {
    ":has:governing-body": true,
    "governing-body": {
      ":has:administrative-unit": true,
      "administrative-unit": {
        ":has:name": municipality ? true : undefined,
        name: municipality ? municipality : undefined,
      },
    },
    
    ":gt:started-at": plannedStartMin ? plannedStartMin : undefined,
    ":lt:ended-at": plannedStartMax ? plannedStartMax : undefined,
  },
  include: ["governing-body.administrative-unit", "agenda-items"].join(","),
  page: {
    number: page,
  },
});

export default class SessionsIndexRoute extends Route {
  @service declare store: Store;

  queryParams = {
    municipality: {
      as: "gemeentes",
      refreshModel: true,
    },
    plannedStartMin: {
      as: "begin",
      refreshModel: true,
    },
    plannedStartMax: {
      as: "eind",
      refreshModel: true,
    }
  };

  @tracked municipality: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;


  async model(params: any) {
    /*
    const model: any = this.modelFor("sessions.index");
    if (model?.sessions?.toArray().length > 0) {
      console.log("Returning early")
      return model;
    }
    */

    this.plannedStartMin = params.plannedStartMin || null;
    this.plannedStartMax = params.plannedStartMax || null;
    this.municipality = params.municipality || null;


    const currentPage = 0;
    const sessions = await this.store.query("session", getQuery(currentPage, this.plannedStartMin, this.plannedStartMax, this.municipality));

    return {
      sessions: sessions.toArray(),
      currentPage: currentPage,
      getQuery,
    };
  }
}
