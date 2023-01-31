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

  model(params: any) {
    const page = params.page ? params.page : 0;
    const municipality = params.municipality ? params.municipality : null;
    console.log(params);

    return Ember.RSVP.hash({
      items: this.store.query("items", {
        municipality: municipality,
        page: page,
        limit: 3,
      }),
      municipalities: this.store.findAll("municipalities"),
    });
  }
}
