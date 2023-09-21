import Store from '@ember-data/store';
import Route from '@ember/routing/route';
import { service } from '@ember/service';
import AgendaItemModel from 'frontend-burgernabije-besluitendatabank/models/agenda-item';

export default class AgendaItemsAgendaItemSessionRoute extends Route {
  @service declare store: Store;

  async model() {
    const agendaItem = (
      this.modelFor('agenda-items.agenda-item') as {
        agendaItem: AgendaItemModel;
      }
    ).agendaItem;

    const session = await this.store.findRecord(
      'session',
      agendaItem.session?.id as string,
      {
        include: [
          'governing-body.is-time-specialization-of.administrative-unit.location',
          'governing-body.administrative-unit.location',
          'agenda-items',
        ].join(','),
      }
    );

    return {
      agendaItem,
      session,
    };
  }
}
