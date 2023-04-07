import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import Ember from "ember";
import { getAllAgendaItemsQuery } from "frontend-burgernabije-besluitendatabank/utils/sparqlQueries";

export default class MunicipalityRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
    // startDate: { refreshModel: true },
    // endDate: { refreshModel: true },
  };

  async model(params: any) {
    const { municipality, page } = params;

    const data = await Ember.RSVP.hash({
      agenda_items: axios
        .get(
          "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
            encodeURIComponent(
              getAllAgendaItemsQuery({
                municipality: municipality,
                offset: page * 3,
              })
            ),
          {
            headers: {
              Accept: "application/sparql-results+json",
            },
          }
        )
        .then((response) => {
          console.log(response.data);
          return response.data.results.bindings;
        })
        .catch((error) => {
          console.error(error);
        }),
      title: municipality,
    });

    return data;
  }
}
