import emberData__model from "@ember-data/model";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import Store from "@ember-data/store";
import Ember from "ember";

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
      agenda_items: this.store.query("agenda-items", {
        municipality: municipality,
        page: page,
        limit: 3,
      }),
      title: municipality,
    });

    return data;
  }
}
