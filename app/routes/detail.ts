import Store from "@ember-data/store";
import Route from "@ember/routing/route";
import { service } from "@ember/service";

export default class DetailRoute extends Route {
  @service declare store: Store;

  async model(params: any) {
    let agendaItems = await this.store.findRecord("agenda-item", params.id, {
      include: [
        // 'session',
        // 'session.governing-body',
        // 'session.governing-body.administrative-unit',
        // 'handled-by',
        'handled-by.has-votes',
        // 'handled-by.has-votes.has-presents',
        // 'handled-by.has-votes.has-abstainers',
        'handled-by.has-votes.has-abstainers.alias',
        // 'handled-by.has-votes.has-voters',
        // 'handled-by.has-votes.has-opponents',
        'handled-by.has-votes.has-opponents.alias',
        // 'handled-by.has-votes.has-proponents',
        'handled-by.has-votes.has-proponents.alias',
      ].join(',')
    });

    // console.log(agendaItems);

    return agendaItems;

    // return this.store.query("agenda-item", 
    // { 
    //   filter: {
    //     "title": params.title
    //   },
    //   include: 'session,session.governing-agent'
    // }).then((agendaItem) => {
    //   console.log(agendaItem);
    //   return agendaItem.get("firstObject");
    // });
  }
}
