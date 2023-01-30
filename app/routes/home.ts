import emberData__model from "@ember-data/model";
import Route from "@ember/routing/route";
import { service } from "@ember/service";
import Store from "@ember-data/store";

export default class HomeRoute extends Route {
  @service declare store: Store;
  model() {
    console.log("MODEL");
    console.log(this.store.findAll("items"));
    return this.store.findAll("items");
  }
}
