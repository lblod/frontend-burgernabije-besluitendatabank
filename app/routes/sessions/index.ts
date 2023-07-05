import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import MunicipalityListService from "frontend-burgernabije-besluitendatabank/services/municipality-list";
import { seperator } from "frontend-burgernabije-besluitendatabank/helpers/constants";

/** Generate Ember Data options to fetch more sessions based on the passed filters */
const getQuery = (page: number, plannedStartMin?: string, plannedStartMax?: string, locationIds?: string) => ({
  // exclude sessions without governing body and administrative unit
  //todo investigate why filtering is not working
  filter: {
    ":has:governing-body": true,
    "governing-body": {
      ":has:administrative-unit": true,
      "administrative-unit": {
        ":has:name": locationIds ? true : undefined,
        "location": {
          ":id:": locationIds ? locationIds : undefined,
        }
      },
    },
    ":gt:planned-start": plannedStartMin ? plannedStartMin : undefined,
    ":lt:planned-start": plannedStartMax ? plannedStartMax : undefined,
  },
  include: ["governing-body.administrative-unit", "agenda-items"].join(","),
  sort: "-started-at",
  page: {
    number: page,
  },
});

export default class SessionsIndexRoute extends Route {
  @service declare store: Store;
  @service declare municipalityList: MunicipalityListService;

  queryParams = {
    municipalityLabels: {
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

  // QueryParams
  @tracked municipalityLabels: any;
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
    this.municipalityLabels = params.municipalityLabels || "";

    /**
     * Municipalities transform
     * 
     */
    let locationIds = await this.municipalityList.getLocationIdsFromLabels(this.municipalityLabels.split(seperator));
    

    console.log(locationIds)


    const currentPage = 0;
    const sessions = await this.store.query("session", getQuery(currentPage, this.plannedStartMin, this.plannedStartMax, locationIds.join(",")));

    return {
      sessions: sessions.toArray(),
      currentPage: currentPage,
      getQuery,
    };
  }
}
