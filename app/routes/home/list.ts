import Route from '@ember/routing/route';
import { service } from "@ember/service";
import Store from "@ember-data/store";

export default class ListRoute extends Route {
    @service declare store: Store;

    size = 3;


    queryParams = {
        page: { refreshModel: true },
      };
    
      async model(params: any) {
        const page = params.page ? params.page : 0;
        // const municipality = params.municipality ? params.municipality : null;
        // const startDate = params.startDate ? params.startDate : null;
        // const endDate = params.endDate ? params.endDate : null;
    
        let agendaItems = await this.store.query("agenda-item", {
          page: {
            number: page,
            size: this.size
          },
          include: 'session,session.is-gehouden-door'
        });

        const entriesStart = page * this.size;
        const entriesEnd = entriesStart + this.size;

        console.log(agendaItems)
        return { 
          "agendaItems": agendaItems,
          "entriesStart": entriesStart,
          "entriesEnd": entriesEnd
        };
      }
}
