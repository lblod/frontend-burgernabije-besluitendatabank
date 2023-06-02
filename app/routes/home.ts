import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { tracked } from "@glimmer/tracking";
import { service } from "@ember/service";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
import { set } from "@ember/object";


export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    municipality: {
      as: "gemeente",
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
    }
  };

  @tracked municipality: any;
  @tracked sort: any;
  @tracked plannedStartMin: any;
  @tracked plannedStartMax: any;
  @tracked keyword: any;

  async model(params: any) {
    const municipalities = await getMunicipalitiesFromVlaanderen(true);
    
    
    return municipalities;
  }
}
