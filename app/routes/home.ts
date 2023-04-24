import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import Ember from "ember";
import ENV from "frontend-burgernabije-besluitendatabank/config/environment";
import { getMunicipalitiesFromVlaanderen } from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
    //   municipality: { refreshModel: true },
    //   startDate: { refreshModel: true },
    //   endDate: { refreshModel: true },
  };

  async model(params: any) {
    const page = params.page ? params.page : 0;
    // const municipality = params.municipality ? params.municipality : null;
    // const startDate = params.startDate ? params.startDate : null;
    // const endDate = params.endDate ? params.endDate : null;

    const municipalities = await getMunicipalitiesFromVlaanderen(true);
    let agendaItems = await this.store.query("agenda-items", {
      page: {
        number: page
      }
    });
    // TODO let both find at the same time, also not findall bc jaysus
    //let municipalities = await this.store.findAll("municipality)")

    console.log(municipalities)
    console.log(agendaItems)
    return { 
      agenda_items: agendaItems,
      municipalities: municipalities
    };

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
