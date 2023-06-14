import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import Transition from "@ember/routing/transition";
import { service } from "@ember/service";
import { tracked } from "@glimmer/tracking";
import { IFilterInfo } from "../components/searcher/filter";

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
  @tracked filters: any = [];


  keywordChange(value: any) {
    console.log(value);
  }

  

  async model(params: object, transition: Transition<unknown>) {
    let req: MunicipalitiesRequestInterface = {
      page: { size: 600 },
      filter: {
        niveau: "Gemeente",
      },
    };
    const municipalities = await this.store.query("location", req);
    

    const keywordFilter: IFilterInfo = {
      id: "keyword",
      searchLabel: "Trefwoord",
      filterObject(value: string) {
        return {
          ":or:": {
            title: value,
            description: value
          }
        }
      },
      placeholder: "Terrasvergunning",
      queryParam: "trefwoord"
    }

    const municipalityFilter: IFilterInfo = {
      id: "municipality",
      searchLabel: "Gemeente",
      filterObject: (value: string) => {
        return {
          "session": {
            "governing-body": {
              "administrative-unit": {
                "name": value
              }
            }
          }
        }
      },
      options: municipalities,
      placeholder: "Selecteer een optie",
      queryParam: "gemeentes"
    };

    const dateRangeFilter: IFilterInfo = {
      id: "startdate",
      searchLabel: "Datum",
      filterObject:  (value: string) => {
        let sessionFilter: { [key: string]: any } = {};
        let split = value.split("<->");
        let start = split[0];
        let end = split[1];

        if (start) {
          sessionFilter[":gt:started-at"] = start;
        }
        if (end) {
          sessionFilter[":lt:ended-at"] = end;
        }

        return {
          "session": sessionFilter
        }
      },
      queryParams: ["begin", "eind"]
    }
    
    this.filters = [
      municipalityFilter,
      keywordFilter,
      dateRangeFilter
    ]

    return this.filters;
  }
}
