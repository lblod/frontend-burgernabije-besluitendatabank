import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";

export default class DetailRoute extends Route {
  @service declare store: Store;
  async model(params: any) {
    const { id } = params;
    return await axios
      .get(
        `https://burgernabije-besluitendatabank-dev.s.redhost.be/agenda-items?filter[id]=${id}`
      )
      .then((resp) => {
        console.log(resp.data.data[0]);
        return resp.data.data[0];
      });
    // return this.store.findRecord("agenda_items", id);
  }
}
