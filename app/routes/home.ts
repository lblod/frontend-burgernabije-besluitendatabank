import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import Ember from "ember";
import ENV from "frontend-burgernabije-besluitendatabank/config/environment";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
export default class HomeRoute extends Route {
  @service declare store: Store;

  async model(params: any) {
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
        .get(`${ENV.API_URL}/agenda-items?page[number]=${page}&page[size]=3`)
        .then((resp) => {
          return resp.data.data;
        })
        .catch((err) => {
          console.error(err);
        }),
      municipalities: municipalities,
    });
    console.log(resp);
    return resp;
    */
  }
}
