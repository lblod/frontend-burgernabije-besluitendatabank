import emberData__model from "@ember-data/model";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import Store from "@ember-data/store";
import Ember from "ember";

export default class HomeRoute extends Route {
  @service declare store: Store;

  queryParams = {
    page: { refreshModel: true },
    municipality: { refreshModel: true },
  };

  async model(params: any) {
    const page = params.page ? params.page : 0;
    const municipality = params.municipality ? params.municipality : null;
    console.log(params);

    const data = await (await fetch("https://api.basisregisters.vlaanderen.be/v2/gemeenten/")).json()
    const gemeenten = data.gemeenten.map((municipality: {
      gemeentenaam: {geografischeNaam: {spelling: string}}
    }) => municipality.gemeentenaam.geografischeNaam.spelling);

    /*
    const municipalities = this.store.findAll("municipalities");
    console.log("muni")
    console.log(municipalities)
    */

    return Ember.RSVP.hash({
      items: this.store.query("items", {
        municipality: municipality,
        page: page,
        limit: 3,
      }),
      municipalities: gemeenten,
    });
  }
}
