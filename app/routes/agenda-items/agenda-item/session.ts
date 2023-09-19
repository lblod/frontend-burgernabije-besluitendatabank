import Route from '@ember/routing/route';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  async model() {
    return this.modelFor('agenda-items.agenda-item') as {
      agendaItem: AgendaItemModel;
      agendaItemOnSameSession: AgendaItemModel[];
    };
  }
}
