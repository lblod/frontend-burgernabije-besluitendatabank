import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import Ember from "ember";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
import {
  getAllAgendaItemsQuery,
  getAllMunicipalitiesQuery,
} from "frontend-burgernabije-besluitendatabank/utils/sparqlQueries";
export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
    municipality: { refreshModel: true },
    sort: { refreshModel: true },
    plannedStart: { refreshModel: true },
    keyWord: { refreshModel: true },
    //   startDate: { refreshModel: true },
    //   endDate: { refreshModel: true },
  };

  async model(params: any) {
    const page = params.page ? params.page : 0;
    const municipality = params.municipality ? params.municipality : null;
    const sort = params.sort ? params.sort : "relevantie";
    const plannedStart = params.plannedStart ? params.plannedStart : null;
    const keyWord = params.keyWord ? params.keyWord : null;
    // const startDate = params.startDate ? params.startDate : null;
    // const endDate = params.endDate ? params.endDate : null;

    const municipalities = await getMunicipalitiesFromVlaanderen(true);

    // const resp = await this.store.findAll("agenda-items");

    // console.log(resp);
    // return resp;

    // const resp = await

    const resp = await Ember.RSVP.hash({
      agenda_items: axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              getAllAgendaItemsQuery({
                municipality: municipality,
                offset: page * 3,
                sort: sort,
                plannedStart: plannedStart,
                keyWord: keyWord,
              })
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        .then((response) => {
          return response.data.results.bindings;
        })
        .catch((error) => {
          console.error(error);
        }),
      municipalities: axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(getAllMunicipalitiesQuery()),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        .then((response) => {
          return response.data.results.bindings;
        })
        .catch((error) => {
          console.error(error);
        }),
    });
    console.log(resp);
    return resp;
  }
}
