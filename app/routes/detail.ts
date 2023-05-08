import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class DetailRoute extends Route {
  @service declare store: Store;

  model(params: any) {
    return this.store.query("agenda-item", 
    { 
      filter: {
        "title": params.title
      },
      include: 'session,session.governing-agent'
    }).then((agendaItem) => {
      console.log(agendaItem);
      return agendaItem.get("firstObject");
    });
  }
}
