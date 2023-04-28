import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class DetailRoute extends Route {
  @service declare store: Store;
  async model(params: any) {
    let item = await this.store.findRecord("agenda-item", params.id, {
      include: 'session,session.is-gehouden-door'
    });
    console.log(item)
    return item;
    //return
  }
}
