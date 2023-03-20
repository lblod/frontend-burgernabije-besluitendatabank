import emberData__model from "@ember-data/model";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import Store from "@ember-data/store";
import Ember from "ember";
import {
  getMunicipalitiesFromVlaanderen,
  ApiVlaanderenMunicipality,
} from "frontend-burgernabije-besluitendatabank/utils/apivlaanderen";
import axios from "axios";

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

    // const resp = await this.store.findAll("agenda-items");

    // console.log(resp);
    // return resp;

    // const resp = await
    const data = await Ember.RSVP.hash({
      agenda_items: axios
        .get(
          `https://burgernabije-besluitendatabank-dev.s.redhost.be/agenda-items?page[number]=${page}&page[size]=3`
        )
        .then((resp) => {
          return resp.data.data;
        })
        .catch((err) => {
          console.error(err);
        }),
      municipalities: municipalities,
    });
    console.log(data);
    return data;
  }
}
