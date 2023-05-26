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

    queryParams = {
      municipality: { 
        refreshModel: true,
        as: "gemeente" 
      },
      sort: { 
        refreshModel: true,
        as: "sorteren" 
      },
      plannedStartBottomMargin: { 
        refreshModel: true,
        as: "begin" 
      },
      plannedStartTopMargin: { 
        refreshModel: true,
        as: "eind" 
      },
      keyWord: { 
        refreshModel: true,
        as: "trefwoord" 
      },
      offset: { 
        refreshModel: true,
        as: "aantal"
       },
    };

    offset = 10;

      async model(params: any) {
        const municipality = params.municipality ? params.municipality : null;
        const sort = params.sort ? params.sort : "relevantie";
        const plannedStart = params.plannedStart ? params.plannedStart : null;
        const plannedEnd = params.plannedEnd ? params.plannedEnd : null;
        const keyWord = params.keyWord ? params.keyWord : null;

        let queryParams: ResourcesInterface = {
          page: {
            size: params.offset
          },
          include: 'session,session.governing-body',
          filter: {}
        }


        if (plannedStart || plannedEnd) {
          // Expected format: YYYY-MM-DD
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

        return agendaItems;
      }
}
