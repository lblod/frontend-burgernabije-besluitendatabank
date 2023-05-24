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



  async model(params: any) {
 
    // const startDate = params.startDate ? params.startDate : null;
    // const endDate = params.endDate ? params.endDate : null;

    const municipalities = await getMunicipalitiesFromVlaanderen(true);
    console.log(municipalities)
    return municipalities;
    

    // const resp = await this.store.findAll("agenda-items");

    // console.log(resp);
    // return resp;

    // const resp = await
    /*
    const resp = await Ember.RSVP.hash({
      agenda_items: axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              getAllAgendaItemsQuery({
                municipality: municipality,
                sort: sort,
                plannedStart: plannedStart,
                keyWord: keyWord,
                offset: offset,
              })
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        .then((response) => {
          console.log(response.data.results.bindings);
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
    return resp;
    */
  }
}
