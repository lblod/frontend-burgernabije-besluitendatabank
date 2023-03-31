import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import Ember from "ember";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
import { getAllMunicipalitiesQuery } from "frontend-burgernabije-besluitendatabank/utils/sparqlQueries";
export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
    municipality: { refreshModel: true },
    //   startDate: { refreshModel: true },
    //   endDate: { refreshModel: true },
  };

  async model(params: any) {
    const page = params.page ? params.page : 0;
    const municipality = params.municipality ? params.municipality : null;
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
              getAllMunicipalitiesQuery({ municipality: municipality })
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        .then((response) => {
          console.log(getAllMunicipalitiesQuery({}));
          console.log(response.data.results.bindings);
          return response.data.results.bindings;
        })
        .catch((error) => {
          console.log(getAllMunicipalitiesQuery({}));
          console.error(error);
        }),
      // agenda_items: axios
      //   .get(`${ENV.API_URL}/agenda-items?page[number]=${page}&page[size]=3`)
      //   .then((resp) => {
      //     return resp.data.data;
      //   })
      //   .catch((err) => {
      //     console.error(err);
      //   }),
      municipalities: municipalities,
    });
    console.log(resp);
    return resp;
  }
}
