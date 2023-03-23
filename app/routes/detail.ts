import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import axios from "axios";
import ENV from "frontend-burgernabije-besluitendatabank/config/environment";

export default class DetailRoute extends Route {
  @service declare store: Store;
  async model(params: any) {
    const { id } = params;
    return await axios
      .get(`${ENV.API_URL}/agenda-items?filter[id]=${id}`)
      .then((resp) => {
        console.log(resp.data.data[0]);
        return resp.data.data[0];
      })
      .catch((err) => {
        console.log(err);
        return err;
      });
    // return this.store.findRecord("agenda_items", id);
  }
}
