import Route from '@ember/routing/route';
import { service } from '@ember/service';
import { agendaItemsQuery } from 'frontend-burgernabije-besluitendatabank/controllers/agenda-items';
import MuSearchService from 'frontend-burgernabije-besluitendatabank/services/mu-search';

export default class DataQualityRoute extends Route {
  @service declare muSearch: MuSearchService;
  async model() {
    return await this.muSearch
      .search(
        agendaItemsQuery({
          index: 'agenda-items',
          page: 0,
        })
      )
      .then((response) => {
        console.log(response);
        return response.items;
      });
  }
}
