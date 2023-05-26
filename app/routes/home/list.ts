import Route from '@ember/routing/route';
import { service } from "@ember/service";
import Store from "@ember-data/store";

interface ResourcesInterface {
  page: {
    size: Number
  },
  include: String,
  filter?: {}
}

export default class ListRoute extends Route {
    @service declare store: Store;

    size = 3;


    queryParams = {
      page: { refreshModel: true },
      municipality: { refreshModel: true },
      sort: { refreshModel: true },
      plannedStart: { refreshModel: true },
      plannedEnd: { refreshModel: true },
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
        const plannedEnd = params.plannedEnd ? params.plannedEnd : null;
        const keyWord = params.keyWord ? params.keyWord : null;
        const offset = params.offset ? params.offset : 0;
        // const municipality = params.municipality ? params.municipality : null;
        // const startDate = params.startDate ? params.startDate : null;
        // const endDate = params.endDate ? params.endDate : null;

        let queryParams: ResourcesInterface = {
          page: {
            size: 10 + params.offset
          },
          include: 'session,session.governing-agent',
          filter: {}
        }


        if (plannedStart || plannedEnd) {
          console.log(plannedStart)
          console.log(plannedEnd)
          let sessionFilter: {[key:string]: any} = {};

          if (plannedStart) {
            sessionFilter[':gt:started-at'] = plannedStart
          }
          if (plannedEnd) {
            sessionFilter[':lt:ended-at'] = plannedEnd;
          }
          queryParams.filter = {
            session: sessionFilter
          }  
        }



     
    
        let agendaItems = await this.store.query("agenda-item", queryParams);

        const entriesStart = page * this.size;
        console.log(agendaItems)
        return agendaItems;
      }
}
