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
    const municipalities = this.store.query("location", req);

    this.filters = [
      {
        attribute: "municipality",
        name:"gemeente",
        queryParam: "gemeente",
        placeholder: "Selecteer een optie",
        type:"select",
        options: municipalities,
        selected: this.municipality,
        select: true,
        filter: (value: string) => {
          return {
            "session": {
              "governing-body": {
                "administrative-unit": {
                  "name": value
                }
              }
            }
          }
        }
      },
      {
        attribute: "keyword",
        name:"trefwoord",
        placeholder: "Terrasvergunning",
        value: this.keyword,
        queryParam: "trefwoord",
        onChange: this.keywordChange,
        filter: function (value: string) {
          return {
            ":or:": {
              title: value,
              description: value
            }
          }
        }
      },
      {
        attribute: "startdate",
        name:"datum",
        type: "date",
        start: this.plannedStartMin,
        end: this.plannedStartMax,
        date: true,
        filter: (value: string) => {
          return {}
        }
      }
    ];

    return this.filters;
  }
}
