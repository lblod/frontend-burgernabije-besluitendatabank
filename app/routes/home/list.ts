import Route from '@ember/routing/route';
import { service } from "@ember/service";
import Store from "@ember-data/store";

export default class ListRoute extends Route {
    @service declare store: Store;

    size = 3;


    queryParams = {
      page: { refreshModel: true },
      municipality: { refreshModel: true },
      sort: { refreshModel: true },
      plannedStart: { refreshModel: true },
      keyWord: { refreshModel: true },
      offset: { refreshModel: true },
      //   startDate: { refreshModel: true },
      //   endDate: { refreshModel: true },
    };
      async model(params: any) {
        const page = params.page ? params.page : 0;
        const municipality = params.municipality ? params.municipality : null;
        const sort = params.sort ? params.sort : "relevantie";
        const plannedStart = params.plannedStart ? params.plannedStart : null;
        const keyWord = params.keyWord ? params.keyWord : null;
        const offset = params.offset ? params.offset : 0;
        // const municipality = params.municipality ? params.municipality : null;
        // const startDate = params.startDate ? params.startDate : null;
        // const endDate = params.endDate ? params.endDate : null;
    
        let agendaItems = await this.store.query("agenda-item", {
          page: {
            size: 10 + params.offset
          },
          include: 'session,session.governing-agent'
        });

        const entriesStart = page * this.size;
        console.log(agendaItems)
        return agendaItems;
      }
}
