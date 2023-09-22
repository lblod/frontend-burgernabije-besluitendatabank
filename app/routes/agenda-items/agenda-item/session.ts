import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  @service declare store: Store;

  async model() {
    return this.modelFor('agenda-items.agenda-item') as {
      agendaItem: AgendaItemModel;
      agendaItemOnSameSession: AgendaItemModel[];
    };
  }
}
