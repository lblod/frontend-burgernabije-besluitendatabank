import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import { getOneAgendaItemByTitle } from "frontend-burgernabije-besluitendatabank/utils/sparqlQueries";

export default class DetailRoute extends Route {
  @service declare store: Store;
  async model(params: any) {
    const { id } = params;
    return await axios
      .get(
        "https://qa.centrale-vindplaats.lblod.info/sparql?query=" +
          encodeURIComponent(
            getOneAgendaItemByTitle({
              title: id,
            })
          ),
        {
          headers: {
            Accept: "application/sparql-results+json",
          },
        }
      )
      .then((response) => {
        console.log(response.data.results.bindings[0]);
        return response.data.results.bindings[0];
      })
      .catch((error) => {
        console.error(error);
      });
  }
}
