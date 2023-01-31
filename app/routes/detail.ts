import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class DetailRoute extends Route {
  @service declare store: Store;
  model(params: any) {
    const { id } = params;
    return this.store.findRecord("items", id);
  }
}
